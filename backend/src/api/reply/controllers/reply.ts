import { factories } from '@strapi/strapi';
import type { CreateReplyInput, ReplyListParams } from '../../../utils/validation';
import { validateCreateReply, validateReplyListQuery } from '../../../utils/validation';

const UID = 'api::reply.reply';

type ReplyService = {
  findPublicList(params: ReplyListParams): Promise<{ data: unknown[]; meta: unknown }>;
  createForAuthor(input: CreateReplyInput, author: { id: number; documentId: string }): Promise<unknown>;
};

export default factories.createCoreController(UID, ({ strapi }) => {
  const service = () => strapi.service(UID) as unknown as ReplyService;

  return {
    /** GET /api/replies?discussion=<documentId>&page=&pageSize= */
    async find(ctx) {
      const params = await validateReplyListQuery(ctx.query);
      return service().findPublicList(params);
    },

    /** POST /api/replies — { data: { content, discussion: <documentId> } } */
    async create(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('Vous devez être connecté pour répondre.');

      const input = await validateCreateReply(ctx.request.body?.data);
      const reply = await service().createForAuthor(input, user);
      ctx.status = 201;
      return { data: reply };
    },
  };
});
