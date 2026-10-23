import { api, findUser, setupStrapi, strapi, teardownStrapi, tokenFor } from './helpers/strapi';

beforeAll(setupStrapi);
afterAll(teardownStrapi);

const getDiscussion = async (slug: string) => (await api().get(`/api/discussions/${slug}`).expect(200)).body.data;

const SLUG = 'location-meublee-micro-bic-ou-regime-reel';

describe('Réponses', () => {
  it('liste les réponses d’une discussion, de la plus ancienne à la plus récente', async () => {
    const discussion = await getDiscussion('ouvrir-un-pea-avec-5-000-par-ou-commencer');
    const res = await api().get(`/api/replies?discussion=${discussion.documentId}`).expect(200);

    expect(res.body.data).toHaveLength(discussion.repliesCount);
    const dates = res.body.data.map((r: { createdAt: string }) => Date.parse(r.createdAt));
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
    expect(res.body.data[0].author).not.toHaveProperty('email');
  });

  it('exige le paramètre discussion et renvoie 404 pour une discussion inconnue', async () => {
    await api().get('/api/replies').expect(400);
    await api().get('/api/replies?discussion=inconnue').expect(404);
  });

  it('refuse une réponse d’un visiteur non authentifié', async () => {
    const discussion = await getDiscussion(SLUG);
    await api().post('/api/replies').send({ data: { content: 'Bonjour', discussion: discussion.documentId } }).expect(403);
    expect((await getDiscussion(SLUG)).repliesCount).toBe(discussion.repliesCount);
  });

  it('valide le contenu et la discussion ciblée', async () => {
    const token = await tokenFor('Thomas_PEA');
    const discussion = await getDiscussion(SLUG);

    const empty = await api()
      .post('/api/replies')
      .set('Authorization', `Bearer ${token}`)
      .send({ data: { content: '   ', discussion: discussion.documentId } })
      .expect(400);
    expect(empty.body.error.details.errors[0]).toMatchObject({ path: ['content'], message: 'La réponse ne peut pas être vide.' });

    await api()
      .post('/api/replies')
      .set('Authorization', `Bearer ${token}`)
      .send({ data: { content: 'Bonjour', discussion: 'inconnue' } })
      .expect(404);
  });

  it('empêche de répondre au nom d’un autre membre', async () => {
    const token = await tokenFor('Thomas_PEA');
    const victim = await findUser('Sandrine_CGP');
    const discussion = await getDiscussion(SLUG);

    await api()
      .post('/api/replies')
      .set('Authorization', `Bearer ${token}`)
      .send({ data: { content: 'Je suis experte.', discussion: discussion.documentId, author: { documentId: victim.documentId } } })
      .expect(403);
  });

  it('publie la réponse au nom de l’utilisateur et met à jour le compteur et l’activité', async () => {
    const token = await tokenFor('Thomas_PEA');
    const before = await getDiscussion(SLUG);

    const res = await api()
      .post('/api/replies')
      .set('Authorization', `Bearer ${token}`)
      .send({ data: { content: 'J’ai choisi le micro-BIC la première année.', discussion: before.documentId } })
      .expect(201);
    expect(res.body.data.author.username).toBe('Thomas_PEA');

    const after = await getDiscussion(SLUG);
    expect(after.repliesCount).toBe(before.repliesCount + 1);
    expect(Date.parse(after.lastActivityAt)).toBeGreaterThan(Date.parse(before.lastActivityAt));
    expect(after.publishedAt).toBe(before.publishedAt); // la date de publication ne bouge pas
  });

  it('recalcule le compteur quand une réponse est supprimée (ex. depuis l’admin)', async () => {
    const discussion = await getDiscussion(SLUG);
    const replies = await api().get(`/api/replies?discussion=${discussion.documentId}`).expect(200);
    const last = replies.body.data.at(-1);

    await strapi().documents('api::reply.reply').delete({ documentId: last.documentId });

    const after = await getDiscussion(SLUG);
    expect(after.repliesCount).toBe(discussion.repliesCount - 1);
  });
});

describe('Permissions', () => {
  it('ne publie pas la liste des comptes (Users & Permissions)', async () => {
    await api().get('/api/users').expect(403);
  });

  it('expose un profil public de membre sans e-mail', async () => {
    const res = await api().get('/api/members/Vincent_ETF').expect(200);
    expect(res.body.data).toMatchObject({ username: 'Vincent_ETF', stats: { discussions: 1 } });
    expect(res.body.data).not.toHaveProperty('email');
    await api().get('/api/members/inconnu').expect(404);
  });

  it('n’expose aucune route de modification ou de suppression', async () => {
    const token = await tokenFor('Camille_B');
    const { body } = await api().get('/api/discussions?pageSize=1').expect(200);
    const id = body.data[0].documentId;
    await api().put(`/api/discussions/${id}`).set('Authorization', `Bearer ${token}`).send({ data: { title: 'Titre modifié par un tiers' } }).expect(405);
    await api().delete(`/api/discussions/${id}`).set('Authorization', `Bearer ${token}`).expect(405);
  });
});
