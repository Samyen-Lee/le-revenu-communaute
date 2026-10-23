import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { StrapiError, strapiFetch } from './client';
import type { Category, Discussion, DiscussionQuery, DiscussionSummary, MemberProfile, Paginated, Reply } from './types';

/**
 * Lectures publiques, mises en cache par Next.js (`use cache`) et étiquetées :
 * - « categories » et « discussions » sont invalidées par les Server Actions après une écriture
 *   (updateTag) et par Strapi via /api/revalidate quand un contenu change dans l'admin ;
 * - cacheLife borne la durée de vie si aucune invalidation n'arrive.
 * Les arguments font partie de la clé de cache : chaque combinaison de filtres a son entrée.
 */

export const CACHE_TAGS = { categories: 'categories', discussions: 'discussions' } as const;

export async function getCategories() {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.categories);

  const { data } = await strapiFetch<Paginated<Category>>('/categories', {
    query: { sort: 'position:asc', 'pagination[pageSize]': 100 },
  });
  return data;
}

export async function getCategory(slug: string) {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getDiscussions(query: DiscussionQuery) {
  'use cache';
  cacheLife('minutes');
  cacheTag(CACHE_TAGS.discussions);

  return strapiFetch<Paginated<DiscussionSummary>>('/discussions', { query });
}

export async function getDiscussion(slug: string) {
  'use cache';
  cacheLife('minutes');
  cacheTag(CACHE_TAGS.discussions);

  try {
    const { data } = await strapiFetch<{ data: Discussion }>(`/discussions/${encodeURIComponent(slug)}`);
    return data;
  } catch (error) {
    if (error instanceof StrapiError && error.status === 404) return null;
    throw error;
  }
}

export async function getMember(username: string) {
  'use cache';
  cacheLife('minutes');
  cacheTag(CACHE_TAGS.discussions);

  try {
    const { data } = await strapiFetch<{ data: MemberProfile }>(`/members/${encodeURIComponent(username)}`);
    return data;
  } catch (error) {
    if (error instanceof StrapiError && error.status === 404) return null;
    throw error;
  }
}

export async function getReplies(discussionDocumentId: string, page = 1) {
  'use cache';
  cacheLife('minutes');
  cacheTag(CACHE_TAGS.discussions);

  return strapiFetch<Paginated<Reply>>('/replies', {
    query: { discussion: discussionDocumentId, page, pageSize: 50 },
  });
}
