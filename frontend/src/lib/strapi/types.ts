/** Contrat de l'API Strapi de la communauté (voir backend/src/utils/serializers.ts). */

export type MemberType = 'member' | 'redaction' | 'expert' | 'moderator';

export type Author = {
  id: number;
  documentId: string;
  username: string;
  displayName: string;
  avatarColor: string | null;
  memberType: MemberType;
  expertTitle: string | null;
  isSubscriber: boolean;
};

export type CategoryIconName =
  | 'candles'
  | 'globe'
  | 'piggy'
  | 'umbrella'
  | 'building'
  | 'receipt'
  | 'armchair'
  | 'family'
  | 'gem'
  | 'wallet'
  | 'coffee'
  | 'message';

export type Category = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: CategoryIconName;
  position: number;
};

export const DISCUSSION_TYPES = ['question', 'discussion'] as const;
export type DiscussionType = (typeof DISCUSSION_TYPES)[number];

export type DiscussionSummary = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  type: DiscussionType;
  repliesCount: number;
  publishedAt: string;
  lastActivityAt: string;
  author: Author | null;
  category: Category | null;
  excerpt: string;
};

export type Discussion = Omit<DiscussionSummary, 'excerpt'> & {
  content: string;
  updatedAt: string;
};

export type Reply = {
  id: number;
  documentId: string;
  content: string;
  createdAt: string;
  author: Author | null;
};

export type Pagination = { page: number; pageSize: number; pageCount: number; total: number };

export type Paginated<T> = { data: T[]; meta: { pagination: Pagination } };

export type DiscussionSort = 'publishedAt:desc' | 'publishedAt:asc' | 'repliesCount:desc' | 'lastActivityAt:desc';

export type MemberProfile = Author & {
  bio: string | null;
  memberSince: string;
  stats: { discussions: number; replies: number };
};

export type DiscussionQuery = {
  category?: string;
  /** username de l'auteur */
  author?: string;
  type?: DiscussionType;
  unanswered?: boolean;
  q?: string;
  sort?: DiscussionSort;
  page?: number;
  pageSize?: number;
};

/** Utilisateur connecté, tel qu'exposé aux composants (jamais le jeton). */
export type SessionUser = Author & { bio: string | null };

export type StrapiErrorPayload = {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details?: { errors?: { path: (string | number)[]; message: string }[] } & Record<string, unknown>;
  };
};
