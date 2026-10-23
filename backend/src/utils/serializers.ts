/**
 * Représentations publiques renvoyées par l'API communautaire.
 *
 * On ne sérialise jamais l'utilisateur complet : seuls les champs d'affichage sortent
 * (pas d'e-mail, de rôle technique ni de jeton). Les `fields` ci-dessous servent aussi
 * à limiter les colonnes lues en base lors des `populate`.
 */

export const AUTHOR_FIELDS = [
  'username',
  'displayName',
  'avatarColor',
  'memberType',
  'expertTitle',
  'isSubscriber',
] as const;

export const CATEGORY_FIELDS = ['name', 'slug', 'description', 'color', 'icon', 'position'] as const;

export const authorPopulate = { fields: [...AUTHOR_FIELDS] };
export const categoryPopulate = { fields: [...CATEGORY_FIELDS] };

type Row = Record<string, any>;

export type PublicAuthor = {
  id: number;
  documentId: string;
  username: string;
  displayName: string;
  avatarColor: string | null;
  memberType: 'member' | 'redaction' | 'expert' | 'moderator';
  expertTitle: string | null;
  isSubscriber: boolean;
};

export const toPublicAuthor = (user: Row | null | undefined): PublicAuthor | null =>
  user
    ? {
        id: user.id,
        documentId: user.documentId,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarColor: user.avatarColor ?? null,
        memberType: user.memberType ?? 'member',
        expertTitle: user.expertTitle ?? null,
        isSubscriber: Boolean(user.isSubscriber),
      }
    : null;

export const toPublicCategory = (category: Row | null | undefined) =>
  category
    ? {
        id: category.id,
        documentId: category.documentId,
        name: category.name,
        slug: category.slug,
        description: category.description ?? null,
        color: category.color,
        icon: category.icon,
        position: category.position ?? 0,
      }
    : null;

const EXCERPT_LENGTH = 220;

export const toExcerpt = (content: string) => {
  const plain = content.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > EXCERPT_LENGTH ? `${plain.slice(0, EXCERPT_LENGTH).trimEnd()}…` : plain;
};

const discussionBase = (discussion: Row) => ({
  id: discussion.id,
  documentId: discussion.documentId,
  title: discussion.title,
  slug: discussion.slug,
  type: discussion.type,
  repliesCount: discussion.repliesCount ?? 0,
  // Date de publication exposée = date de création (voir SORTS dans le service des discussions).
  publishedAt: discussion.createdAt,
  lastActivityAt: discussion.lastActivityAt ?? discussion.createdAt,
  author: toPublicAuthor(discussion.author),
  category: toPublicCategory(discussion.category),
});

export const toDiscussionListItem = (discussion: Row) => ({
  ...discussionBase(discussion),
  excerpt: toExcerpt(discussion.content ?? ''),
});

export const toDiscussionDetail = (discussion: Row) => ({
  ...discussionBase(discussion),
  content: discussion.content,
  updatedAt: discussion.updatedAt,
});

export const toPublicReply = (reply: Row) => ({
  id: reply.id,
  documentId: reply.documentId,
  content: reply.content,
  createdAt: reply.createdAt,
  author: toPublicAuthor(reply.author),
});

export const paginationMeta = (page: number, pageSize: number, total: number) => ({
  pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total },
});
