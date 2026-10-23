import type { DiscussionQuery, DiscussionSort } from './strapi/types';

/**
 * Paramètres d'URL du fil de discussions (en français, lisibles et partageables) et leur
 * traduction vers la requête Strapi. Les valeurs inconnues retombent sur les valeurs par défaut.
 *   /?filtre=questions&tri=ancien&page=2
 */

export const FEED_FILTERS = [
  { value: 'tout', label: 'Toutes' },
  { value: 'questions', label: 'Questions' },
  { value: 'discussions', label: 'Discussions' },
  { value: 'sans-reponse', label: 'Sans réponse' },
] as const;
export type FeedFilter = (typeof FEED_FILTERS)[number]['value'];

export const FEED_SORTS = [
  { value: 'recent', label: 'Plus récentes', strapi: 'publishedAt:desc' },
  { value: 'ancien', label: 'Plus anciennes', strapi: 'publishedAt:asc' },
  { value: 'activite', label: 'Dernière activité', strapi: 'lastActivityAt:desc' },
  { value: 'reponses', label: 'Plus de réponses', strapi: 'repliesCount:desc' },
] as const satisfies readonly { value: string; label: string; strapi: DiscussionSort }[];
export type FeedSort = (typeof FEED_SORTS)[number]['value'];

export const FEED_PAGE_SIZE = 10;

export type FeedState = { filter: FeedFilter; sort: FeedSort; page: number; q: string };

type RawSearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? '';

export function parseFeedParams(searchParams: RawSearchParams): FeedState {
  const filter = first(searchParams.filtre);
  const sort = first(searchParams.tri);
  const page = Number.parseInt(first(searchParams.page), 10);
  return {
    filter: FEED_FILTERS.some((f) => f.value === filter) ? (filter as FeedFilter) : 'tout',
    sort: FEED_SORTS.some((s) => s.value === sort) ? (sort as FeedSort) : 'recent',
    page: Number.isFinite(page) && page > 0 ? page : 1,
    q: first(searchParams.q).trim().slice(0, 100),
  };
}

/** Restriction fixe du fil, imposée par la page (espace, auteur). */
export type FeedScope = Pick<DiscussionQuery, 'category' | 'author'>;

export function toDiscussionQuery(state: FeedState, scope: FeedScope = {}): DiscussionQuery {
  return {
    ...scope,
    q: state.q || undefined,
    type: state.filter === 'questions' ? 'question' : state.filter === 'discussions' ? 'discussion' : undefined,
    unanswered: state.filter === 'sans-reponse' || undefined,
    sort: FEED_SORTS.find((s) => s.value === state.sort)!.strapi,
    page: state.page,
    pageSize: FEED_PAGE_SIZE,
  };
}

/** Construit l'URL d'un état du fil en omettant les valeurs par défaut. */
export function feedHref(pathname: string, state: Partial<FeedState>) {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.filter && state.filter !== 'tout') params.set('filtre', state.filter);
  if (state.sort && state.sort !== 'recent') params.set('tri', state.sort);
  if (state.page && state.page > 1) params.set('page', String(state.page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
