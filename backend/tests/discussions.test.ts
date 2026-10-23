import { api, findUser, setupStrapi, strapi, teardownStrapi, tokenFor } from './helpers/strapi';

beforeAll(setupStrapi);
afterAll(teardownStrapi);

const validDiscussion = {
  title: 'Faut-il ouvrir un PER à 45 ans ?',
  content: 'Je suis salarié, imposé à 30 %. Le PER vaut-il le coup à mon âge ?',
  type: 'question',
  category: 'retraite',
};

const countDiscussions = () => strapi().db.query('api::discussion.discussion').count();

describe('GET /api/discussions — affichage des discussions', () => {
  it('liste les discussions avec auteur, espace, nombre de réponses et date, triées par date décroissante', async () => {
    const res = await api().get('/api/discussions').expect(200);

    expect(res.body.meta.pagination).toMatchObject({ page: 1, pageSize: 10, total: 20, pageCount: 2 });
    expect(res.body.data).toHaveLength(10);

    const [first] = res.body.data;
    expect(first).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        slug: expect.any(String),
        excerpt: expect.any(String),
        repliesCount: expect.any(Number),
        publishedAt: expect.any(String),
        author: expect.objectContaining({ username: expect.any(String), displayName: expect.any(String) }),
        category: expect.objectContaining({ name: expect.any(String), slug: expect.any(String) }),
      }),
    );

    const dates = res.body.data.map((d: { publishedAt: string }) => Date.parse(d.publishedAt));
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it('n’expose jamais de donnée privée de l’auteur', async () => {
    const res = await api().get('/api/discussions').expect(200);
    for (const discussion of res.body.data) {
      expect(Object.keys(discussion.author).sort()).toEqual(
        ['avatarColor', 'displayName', 'documentId', 'expertTitle', 'id', 'isSubscriber', 'memberType', 'username'].sort(),
      );
    }
  });

  it('filtre par catégorie et trie par date croissante', async () => {
    const res = await api().get('/api/discussions?category=bourse&sort=publishedAt:asc').expect(200);
    expect(res.body.data.length).toBeGreaterThan(1);
    for (const discussion of res.body.data) expect(discussion.category.slug).toBe('bourse');

    const dates = res.body.data.map((d: { publishedAt: string }) => Date.parse(d.publishedAt));
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  it('pagine côté serveur', async () => {
    const page2 = await api().get('/api/discussions?page=2&pageSize=5').expect(200);
    expect(page2.body.meta.pagination).toMatchObject({ page: 2, pageSize: 5 });
    expect(page2.body.data).toHaveLength(5);
  });

  it('filtre les discussions sans réponse', async () => {
    const res = await api().get('/api/discussions?unanswered=true').expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const discussion of res.body.data) expect(discussion.repliesCount).toBe(0);
  });

  it('refuse des paramètres de requête invalides (400)', async () => {
    const res = await api().get('/api/discussions?sort=title:asc&pageSize=500').expect(400);
    const paths = res.body.error.details.errors.map((e: { path: string[] }) => e.path[0]);
    expect(paths).toEqual(expect.arrayContaining(['sort', 'pageSize']));
  });

  it('garde la date de publication quand un éditeur corrige la discussion dans l’admin', async () => {
    const slug = 'or-physique-pieces-ou-lingots-que-privilegiez-vous';
    const before = (await api().get(`/api/discussions/${slug}`).expect(200)).body.data;

    // Même chemin que le Content Manager : Document Service, qui republie le document
    await strapi().documents('api::discussion.discussion').update({
      documentId: before.documentId,
      data: { title: 'Or physique : pièces ou lingots, que préférez-vous ?' } as never,
    });

    const after = (await api().get(`/api/discussions/${slug}`).expect(200)).body.data;
    expect(after.title).toBe('Or physique : pièces ou lingots, que préférez-vous ?');
    expect(after.publishedAt).toBe(before.publishedAt);
    expect(after.repliesCount).toBe(before.repliesCount);

    const latest = await api().get('/api/discussions?pageSize=1').expect(200);
    expect(latest.body.data[0].slug).not.toBe(slug);
  });

  it('renvoie le détail par slug, et 404 si la discussion n’existe pas', async () => {
    const { body } = await api().get('/api/discussions?pageSize=1').expect(200);
    const { slug } = body.data[0];

    const detail = await api().get(`/api/discussions/${slug}`).expect(200);
    expect(detail.body.data).toMatchObject({ slug, content: expect.any(String) });

    await api().get('/api/discussions/n-existe-pas').expect(404);
  });
});

describe('POST /api/discussions — création', () => {
  it('refuse la publication à un visiteur non authentifié', async () => {
    const before = await countDiscussions();
    const res = await api().post('/api/discussions').send({ data: validDiscussion });

    expect(res.status).toBe(403);
    expect(await countDiscussions()).toBe(before);
  });

  it('refuse un jeton invalide (401)', async () => {
    await api().post('/api/discussions').set('Authorization', 'Bearer jeton.invalide').send({ data: validDiscussion }).expect(401);
  });

  it('applique les validations métier côté Strapi (400 avec erreurs par champ)', async () => {
    const token = await tokenFor('Camille_B');
    const before = await countDiscussions();

    const res = await api()
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({ data: { title: '   PEA ?   ', content: '   ', type: 'sondage', category: '' } })
      .expect(400);

    const errors = Object.fromEntries(
      res.body.error.details.errors.map((e: { path: string[]; message: string }) => [e.path[0], e.message]),
    );
    expect(errors).toEqual({
      title: 'Le titre doit contenir au moins 10 caractères.',
      content: 'Le contenu est obligatoire.',
      type: 'Le type doit être « question » ou « discussion ».',
      category: 'La catégorie est obligatoire.',
    });
    expect(await countDiscussions()).toBe(before);
  });

  it('refuse une catégorie inexistante', async () => {
    const token = await tokenFor('Camille_B');
    const res = await api()
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({ data: { ...validDiscussion, category: 'inconnue' } })
      .expect(400);
    expect(res.body.error.details.errors[0].path).toEqual(['category']);
  });

  it.each([
    ['un id', (id: number) => id],
    ['un documentId', (_: number, documentId: string) => documentId],
    ['un connect', (id: number) => ({ connect: [{ id }] })],
  ])('empêche de publier au nom d’un autre membre (%s)', async (_label, authorOf) => {
    const token = await tokenFor('Camille_B');
    const victim = await findUser('LaRedaction');
    const before = await countDiscussions();

    const res = await api()
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({ data: { ...validDiscussion, author: authorOf(victim.id, victim.documentId) } })
      .expect(403);

    expect(res.body.error).toMatchObject({ name: 'PolicyError', message: 'Vous ne pouvez pas publier au nom d’un autre membre.' });
    expect(await countDiscussions()).toBe(before);
  });

  it('crée la discussion au nom de l’utilisateur authentifié, avec un slug unique', async () => {
    const token = await tokenFor('Camille_B');

    const first = await api().post('/api/discussions').set('Authorization', `Bearer ${token}`).send({ data: validDiscussion }).expect(201);
    expect(first.body.data).toMatchObject({
      title: validDiscussion.title,
      type: 'question',
      slug: 'faut-il-ouvrir-un-per-a-45-ans',
      repliesCount: 0,
      author: { username: 'Camille_B' },
      category: { slug: 'retraite' },
    });

    const second = await api().post('/api/discussions').set('Authorization', `Bearer ${token}`).send({ data: validDiscussion }).expect(201);
    expect(second.body.data.slug).toBe('faut-il-ouvrir-un-per-a-45-ans-2');

    const list = await api().get('/api/discussions?category=retraite').expect(200);
    expect(list.body.data[0].documentId).toBe(second.body.data.documentId);
  });

  it('accepte un champ author qui désigne l’utilisateur lui-même', async () => {
    const token = await tokenFor('Thomas_PEA');
    const me = await findUser('Thomas_PEA');
    const res = await api()
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({ data: { ...validDiscussion, title: 'Mon premier PEA : retour après un an', author: me.id } })
      .expect(201);
    expect(res.body.data.author.username).toBe('Thomas_PEA');
  });
});
