/**
 * Maintient `repliesCount` et `lastActivityAt` des discussions à jour à chaque écriture
 * sur une réponse, qu'elle vienne de l'API REST ou de l'admin Strapi.
 *
 * Le compteur dénormalisé évite de charger ou de compter les réponses à chaque affichage
 * de liste, et permet de trier ou de filtrer (« sans réponse ») directement en base.
 */
import type { Core } from '@strapi/strapi';

const REPLY_UID = 'api::reply.reply';
const WRITE_ACTIONS = new Set(['create', 'update', 'delete']);

type DiscussionStatsService = { syncStats(discussionDocumentId: string): Promise<void> };

export const replyStatsMiddleware = (strapi: Core.Strapi) => {
  const discussionOf = async (replyDocumentId?: string) => {
    if (!replyDocumentId) return null;
    const reply = await strapi.db.query(REPLY_UID).findOne({
      where: { documentId: replyDocumentId },
      populate: { discussion: { select: ['documentId'] } },
    });
    return (reply?.discussion?.documentId as string | undefined) ?? null;
  };

  return async (context: any, next: () => Promise<any>) => {
    if (context.uid !== REPLY_UID || !WRITE_ACTIONS.has(context.action)) return next();

    const affected = new Set<string>();
    if (context.action !== 'create') {
      const before = await discussionOf(context.params?.documentId);
      if (before) affected.add(before);
    }

    const result = await next();

    if (context.action !== 'delete') {
      const after = await discussionOf(result?.documentId ?? context.params?.documentId);
      if (after) affected.add(after);
    }

    const discussions = strapi.service('api::discussion.discussion') as unknown as DiscussionStatsService;
    for (const documentId of affected) await discussions.syncStats(documentId);

    return result;
  };
};
