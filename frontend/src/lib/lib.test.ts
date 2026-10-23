import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './actions/action-utils';
import { feedHref, parseFeedParams, toDiscussionQuery } from './feed-params';
import { formatRelative } from './format';
import { StrapiError } from './strapi/client';
import { validateDiscussionForm, validateReply } from './validation';

describe('paramètres du fil', () => {
  it('traduit l’URL en requête Strapi', () => {
    const state = parseFeedParams({ filtre: 'sans-reponse', tri: 'ancien', page: '2' });
    expect(toDiscussionQuery(state, { category: 'bourse' })).toEqual({
      category: 'bourse',
      q: undefined,
      type: undefined,
      unanswered: true,
      sort: 'publishedAt:asc',
      page: 2,
      pageSize: 10,
    });
  });

  it('ignore les valeurs inconnues', () => {
    expect(parseFeedParams({ filtre: 'nimporte', tri: 'x', page: '-3' })).toEqual({ filter: 'tout', sort: 'recent', page: 1, q: '' });
  });

  it('construit des URL sans les valeurs par défaut', () => {
    expect(feedHref('/', { filter: 'tout', sort: 'recent', page: 1, q: '' })).toBe('/');
    expect(feedHref('/espaces/bourse', { filter: 'questions', sort: 'ancien', page: 3 })).toBe(
      '/espaces/bourse?filtre=questions&tri=ancien&page=3',
    );
  });
});

describe('validation du formulaire (confort, Strapi reste juge)', () => {
  it('reprend les règles de Strapi', () => {
    expect(validateDiscussionForm({ title: ' court ', content: '', type: '', category: '' })).toEqual({
      title: 'Le titre doit contenir au moins 10 caractères.',
      content: 'Le contenu est obligatoire.',
      type: 'Choisissez un type de publication.',
      category: 'Choisissez un espace.',
    });
    expect(
      validateDiscussionForm({ title: 'Un titre assez long', content: 'Détails', type: 'question', category: 'bourse' }),
    ).toEqual({});
    expect(validateReply('   ')).toBe('La réponse ne peut pas être vide.');
  });
});

describe('erreurs Strapi', () => {
  it('extrait les erreurs de validation par champ', () => {
    const error = StrapiError.fromPayload(400, {
      data: null,
      error: {
        status: 400,
        name: 'ValidationError',
        message: '2 errors occurred',
        details: {
          errors: [
            { path: ['title'], message: 'Le titre doit contenir au moins 10 caractères.' },
            { path: ['category'], message: 'La catégorie est obligatoire.' },
          ],
        },
      },
    });
    expect(error.status).toBe(400);
    expect(error.fieldErrors).toEqual({
      title: 'Le titre doit contenir au moins 10 caractères.',
      category: 'La catégorie est obligatoire.',
    });
  });
});

describe('utilitaires', () => {
  it('formate une date relative', () => {
    const now = Date.parse('2026-10-23T12:00:00Z');
    expect(formatRelative('2026-10-23T11:58:00Z', now)).toBe('il y a 2 min');
    expect(formatRelative('2026-10-23T09:00:00Z', now)).toBe('il y a 3 h');
    expect(formatRelative('2026-10-22T10:00:00Z', now)).toBe('hier');
  });

  it('refuse les redirections externes après connexion', () => {
    expect(safeRedirectPath('/publier')).toBe('/publier');
    expect(safeRedirectPath('//evil.example')).toBe('/');
    expect(safeRedirectPath('https://evil.example')).toBe('/');
  });
});
