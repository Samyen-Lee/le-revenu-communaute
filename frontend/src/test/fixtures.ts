import type { Author, Category, DiscussionSummary } from '@/lib/strapi/types';

export const author = (overrides: Partial<Author> = {}): Author => ({
  id: 1,
  documentId: 'author-1',
  username: 'Vincent_ETF',
  displayName: 'Vincent',
  avatarColor: '#5856d6',
  memberType: 'member',
  expertTitle: null,
  isSubscriber: true,
  ...overrides,
});

export const category = (overrides: Partial<Category> = {}): Category => ({
  id: 1,
  documentId: 'category-1',
  name: 'Bourse & actions',
  slug: 'bourse',
  description: 'Actions, ETF, PEA…',
  color: '#007aff',
  icon: 'candles',
  position: 0,
  ...overrides,
});

export const discussion = (overrides: Partial<DiscussionSummary> = {}): DiscussionSummary => ({
  id: 1,
  documentId: 'discussion-1',
  title: 'Ouvrir un PEA avec 5 000 € : par où commencer ?',
  slug: 'ouvrir-un-pea-avec-5-000-par-ou-commencer',
  type: 'question',
  repliesCount: 4,
  publishedAt: '2026-10-21T08:00:00.000Z',
  lastActivityAt: '2026-10-22T18:00:00.000Z',
  author: author({ displayName: 'Thomas', username: 'Thomas_PEA' }),
  category: category(),
  excerpt: 'Bonjour, je viens d’ouvrir un PEA en ligne…',
  ...overrides,
});
