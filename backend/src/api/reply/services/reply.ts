import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { authorPopulate, paginationMeta, toPublicReply } from '../../../utils/serializers';
import type { CreateReplyInput, ReplyListParams } from '../../../utils/validation';

const UID = 'api::reply.reply';

type AuthUser = { id: number; documentId: string };

export default factories.createCoreService(UID, ({ strapi }) => ({
  async assertDiscussionExists(documentId: string) {
    const discussion = await strapi.documents('api::discussion.discussion').findOne({ documentId, fields: ['slug'] });
    if (!discussion) throw new errors.NotFoundError('Discussion introuvable.');
    return discussion;
  },

  /** Réponses d'une discussion, de la plus ancienne à la plus récente. */
  async findPublicList(params: ReplyListParams) {
    await this.assertDiscussionExists(params.discussion);
    const filters = { discussion: { documentId: { $eq: params.discussion } } };

    const [rows, total] = await Promise.all([
      strapi.documents(UID).findMany({
        filters,
        sort: [{ createdAt: 'asc' }, { id: 'asc' }],
        fields: ['content', 'createdAt'],
        populate: { author: authorPopulate } as any,
        start: (params.page - 1) * params.pageSize,
        limit: params.pageSize,
      }),
      strapi.documents(UID).count({ filters }),
    ]);

    return { data: rows.map(toPublicReply), meta: paginationMeta(params.page, params.pageSize, total) };
  },

  /**
   * Le compteur de réponses de la discussion est mis à jour par le middleware du Document Service
   * (src/document-middlewares/reply-stats.ts), y compris pour les réponses créées dans l'admin.
   */
  async createForAuthor(input: CreateReplyInput, author: AuthUser) {
    await this.assertDiscussionExists(input.discussion);

    const reply = await strapi.documents(UID).create({
      data: { content: input.content, author: author.documentId, discussion: input.discussion } as any,
      populate: { author: authorPopulate } as any,
    });
    return toPublicReply(reply);
  },
}));
