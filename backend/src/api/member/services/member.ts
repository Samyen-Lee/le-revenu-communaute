import type { Core } from '@strapi/strapi';
import { toPublicAuthor } from '../../../utils/serializers';

const USER = 'plugin::users-permissions.user';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async findPublicProfile(username: string) {
    const user = await strapi.db.query(USER).findOne({
      where: { username, blocked: false },
      select: ['id', 'documentId', 'username', 'displayName', 'avatarColor', 'memberType', 'expertTitle', 'isSubscriber', 'bio', 'createdAt'],
    });
    if (!user) return null;

    const byAuthor = { author: { id: user.id } };
    const [discussions, replies] = await Promise.all([
      strapi.db.query('api::discussion.discussion').count({ where: byAuthor }),
      strapi.db.query('api::reply.reply').count({ where: byAuthor }),
    ]);

    return {
      ...toPublicAuthor(user),
      bio: user.bio ?? null,
      memberSince: user.createdAt,
      stats: { discussions, replies },
    };
  },
});
