import type { Core } from '@strapi/strapi';

type MemberService = { findPublicProfile(username: string): Promise<unknown | null> };

export default ({ strapi }: { strapi: Core.Strapi }): Core.Controller => ({
  /** GET /api/members/:username */
  async findOne(ctx) {
    const service = strapi.service('api::member.member') as unknown as MemberService;
    const member = await service.findPublicProfile(String(ctx.params.username));
    if (!member) return ctx.notFound('Membre introuvable.');
    return { data: member };
  },
});
