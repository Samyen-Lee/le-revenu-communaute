/**
 * Les actions natives sont surchargées pour contrôler précisément ce qui sort de l'API
 * (champs publics de l'auteur) et pour appliquer les règles métier à la création.
 */
import { factories } from '@strapi/strapi';
import type { CreateDiscussionInput, DiscussionListParams } from '../../../utils/validation';
import { validateCreateDiscussion, validateDiscussionListQuery } from '../../../utils/validation';

const UID = 'api::discussion.discussion';

type DiscussionService = {
  findPublicList(params: DiscussionListParams): Promise<{ data: unknown[]; meta: unknown }>;
  findPublicOne(idOrSlug: string): Promise<unknown | null>;
  createForAuthor(input: CreateDiscussionInput, author: { id: number; documentId: string }): Promise<unknown>;
};

export default factories.createCoreController(UID, ({ strapi }) => {
  const service = () => strapi.service(UID) as unknown as DiscussionService;

  return {
    /** GET /api/discussions?category=&author=&type=&unanswered=&q=&sort=&page=&pageSize= */
    async find(ctx) {
      const params = await validateDiscussionListQuery(ctx.query);
      return service().findPublicList(params);
    },

    /** GET /api/discussions/:id — :id accepte le slug ou le documentId */
    async findOne(ctx) {
      const discussion = await service().findPublicOne(ctx.params.id);
      if (!discussion) return ctx.notFound('Discussion introuvable.');
      return { data: discussion };
    },

    /** POST /api/discussions — l'auteur est toujours l'utilisateur authentifié */
    async create(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('Vous devez être connecté pour publier.');

      const input = await validateCreateDiscussion(ctx.request.body?.data);
      const discussion = await service().createForAuthor(input, user);
      ctx.status = 201;
      return { data: discussion };
    },
  };
});
