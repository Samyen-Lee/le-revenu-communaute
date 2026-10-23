/**
 * Logique métier des discussions, via le Document Service API de Strapi v5.
 */
import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import {
  authorPopulate,
  categoryPopulate,
  paginationMeta,
  toDiscussionDetail,
  toDiscussionListItem,
} from '../../../utils/serializers';
import { slugify } from '../../../utils/slugify';
import type { CreateDiscussionInput, DiscussionListParams, DiscussionSort } from '../../../utils/validation';

const UID = 'api::discussion.discussion';

/**
 * Date de publication = createdAt. Draft & Publish étant désactivé, une discussion est publiée à sa
 * création ; le champ technique publishedAt de Strapi, lui, est réécrit à chaque modification faite
 * dans l'admin : trier dessus ferait remonter une ancienne discussion après une simple correction.
 */
const SORTS: Record<DiscussionSort, Record<string, 'asc' | 'desc'>[]> = {
  'publishedAt:desc': [{ createdAt: 'desc' }, { id: 'desc' }],
  'publishedAt:asc': [{ createdAt: 'asc' }, { id: 'asc' }],
  'repliesCount:desc': [{ repliesCount: 'desc' }, { createdAt: 'desc' }],
  'lastActivityAt:desc': [{ lastActivityAt: 'desc' }, { createdAt: 'desc' }],
};

/** Colonnes lues pour une liste : pas de relation `replies`, le compteur est dénormalisé. */
const LIST_FIELDS = ['title', 'slug', 'content', 'type', 'repliesCount', 'lastActivityAt', 'createdAt'];

const relationsPopulate = { author: authorPopulate, category: categoryPopulate };

type AuthUser = { id: number; documentId: string };

export default factories.createCoreService(UID, ({ strapi }) => ({
  async findPublicList(params: DiscussionListParams) {
    const filters: Record<string, any> = {};
    if (params.category) filters.category = { slug: { $eq: params.category } };
    if (params.author) filters.author = { username: { $eq: params.author } };
    if (params.type) filters.type = { $eq: params.type };
    if (params.unanswered) filters.repliesCount = { $eq: 0 };
    if (params.q) filters.$or = [{ title: { $containsi: params.q } }, { content: { $containsi: params.q } }];

    const [rows, total] = await Promise.all([
      strapi.documents(UID).findMany({
        filters,
        sort: SORTS[params.sort],
        fields: LIST_FIELDS as any,
        populate: relationsPopulate as any,
        start: (params.page - 1) * params.pageSize,
        limit: params.pageSize,
      }),
      strapi.documents(UID).count({ filters }),
    ]);

    return { data: rows.map(toDiscussionListItem), meta: paginationMeta(params.page, params.pageSize, total) };
  },

  /** Accepte un slug (URL publique) ou un documentId. */
  async findPublicOne(idOrSlug: string) {
    const discussion = await strapi.documents(UID).findFirst({
      filters: { $or: [{ slug: { $eq: idOrSlug } }, { documentId: { $eq: idOrSlug } }] },
      populate: relationsPopulate as any,
    });
    return discussion ? toDiscussionDetail(discussion) : null;
  },

  async createForAuthor(input: CreateDiscussionInput, author: AuthUser) {
    const category = await strapi.documents('api::category.category').findFirst({
      filters: { slug: { $eq: input.category } },
      fields: ['slug'],
    });
    if (!category) {
      throw new errors.ValidationError('La catégorie sélectionnée n’existe pas.', {
        errors: [{ path: ['category'], message: 'La catégorie sélectionnée n’existe pas.', name: 'ValidationError' }],
      });
    }

    const created = await strapi.documents(UID).create({
      data: {
        title: input.title,
        content: input.content,
        type: input.type,
        slug: await this.generateUniqueSlug(input.title),
        author: author.documentId,
        category: category.documentId,
        repliesCount: 0,
        lastActivityAt: new Date().toISOString(),
      } as any,
    });

    return this.findPublicOne(created.documentId);
  },

  async generateUniqueSlug(title: string) {
    const base = slugify(title);
    const taken = await strapi.documents(UID).findMany({
      filters: { slug: { $startsWith: base } },
      fields: ['slug'],
    });
    const used = new Set(taken.map((d) => d.slug));
    if (!used.has(base)) return base;
    let suffix = 2;
    while (used.has(`${base}-${suffix}`)) suffix += 1;
    return `${base}-${suffix}`;
  },

  /**
   * Recalcule le nombre de réponses et la date de dernière activité.
   * Écrit via le Query Engine : il s'agit de compteurs techniques, qui ne doivent ni repasser
   * par les middlewares du Document Service ni modifier la date de publication.
   */
  async syncStats(discussionDocumentId: string) {
    const discussion = await strapi.db
      .query(UID)
      .findOne({ where: { documentId: discussionDocumentId }, select: ['id', 'createdAt'] });
    if (!discussion) return;

    const replyFilter = { discussion: { documentId: discussionDocumentId } };
    const [repliesCount, lastReply] = await Promise.all([
      strapi.db.query('api::reply.reply').count({ where: replyFilter }),
      strapi.db.query('api::reply.reply').findOne({
        where: replyFilter,
        select: ['createdAt'],
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    await strapi.db.query(UID).updateMany({
      where: { documentId: discussionDocumentId },
      data: { repliesCount, lastActivityAt: lastReply?.createdAt ?? discussion.createdAt },
    });
  },
}));
