import { errors } from '@strapi/utils';
import preventAuthorSpoofing from '../src/policies/prevent-author-spoofing';
import { slugify } from '../src/utils/slugify';
import { validateCreateDiscussion, validateDiscussionListQuery } from '../src/utils/validation';

describe('validateCreateDiscussion', () => {
  const valid = { title: 'Assurance-vie après 70 ans ?', content: 'Ma question…', type: 'question', category: 'assurance-vie' };

  it('accepte une discussion valide et nettoie les espaces', async () => {
    await expect(validateCreateDiscussion({ ...valid, title: `  ${valid.title}  ` })).resolves.toEqual(valid);
  });

  it('exige un titre d’au moins 10 caractères, espaces exclus', async () => {
    await expect(validateCreateDiscussion({ ...valid, title: '  123456789  ' })).rejects.toThrow(
      'Le titre doit contenir au moins 10 caractères.',
    );
    await expect(validateCreateDiscussion({ ...valid, title: '1234567890' })).resolves.toBeDefined();
  });

  it('exige un contenu, une catégorie et un type connu', async () => {
    const error = await validateCreateDiscussion({ title: valid.title, content: ' ', type: 'poll' }).catch((e) => e);
    expect(error).toBeInstanceOf(errors.ValidationError);
    expect(error.details.errors.map((e: { path: string[] }) => e.path[0]).sort()).toEqual(['category', 'content', 'type']);
  });

  it('ignore les champs inconnus (l’auteur n’est jamais lu depuis la requête)', async () => {
    await expect(validateCreateDiscussion({ ...valid, author: 1, repliesCount: 99 })).resolves.toEqual(valid);
  });
});

describe('validateDiscussionListQuery', () => {
  it('applique les valeurs par défaut et convertit les nombres', async () => {
    await expect(validateDiscussionListQuery({ page: '2' })).resolves.toMatchObject({
      sort: 'publishedAt:desc',
      page: 2,
      pageSize: 10,
    });
  });

  it('accepte la syntaxe Strapi pagination[page]', async () => {
    await expect(validateDiscussionListQuery({ pagination: { page: '3', pageSize: '5' } })).resolves.toMatchObject({
      page: 3,
      pageSize: 5,
    });
  });
});

describe('policy prevent-author-spoofing', () => {
  const user = { id: 7, documentId: 'moi' };
  const run = (data: unknown, currentUser: typeof user | undefined = user) =>
    preventAuthorSpoofing({ state: { user: currentUser }, request: { body: { data } } } as never, undefined, {} as never);

  it('laisse passer une requête sans auteur ou désignant l’utilisateur lui-même', () => {
    expect(run({ title: 'x' })).toBe(true);
    expect(run({ author: 7 })).toBe(true);
    expect(run({ author: 'moi' })).toBe(true);
    expect(run({ author: { connect: [{ documentId: 'moi' }] } })).toBe(true);
  });

  it.each([
    [{ author: 8 }],
    [{ author: 'autre' }],
    [{ author: { id: 8 } }],
    [{ author: { connect: [{ id: 7 }, { id: 8 }] } }],
    [{ author: { set: ['autre'] } }],
    [{ author: { disconnect: [7] } }],
    [{ user: 8 }],
  ])('rejette %j', (data) => {
    expect(() => run(data)).toThrow(errors.PolicyError);
  });
});

describe('slugify', () => {
  it('produit une URL lisible sans accents ni ponctuation', () => {
    expect(slugify('Assurance-vie après 70 ans : est-ce encore intéressant ?')).toBe(
      'assurance-vie-apres-70-ans-est-ce-encore-interessant',
    );
    expect(slugify('J’ai 25 ans et 10 000 € de côté')).toBe('j-ai-25-ans-et-10-000-de-cote');
    expect(slugify('???')).toBe('discussion');
  });
});
