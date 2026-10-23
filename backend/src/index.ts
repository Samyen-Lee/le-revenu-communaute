import type { Core } from '@strapi/strapi';
import { ensureAdminUser } from './bootstrap/admin';
import { ensureIndexes } from './bootstrap/indexes';
import { syncPermissions } from './bootstrap/permissions';
import { frontendRevalidationMiddleware, withoutRevalidation } from './document-middlewares/frontend-revalidation';
import { replyStatsMiddleware } from './document-middlewares/reply-stats';
import { seedDemoData } from './seed';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(replyStatsMiddleware(strapi));
    strapi.documents.use(frontendRevalidationMiddleware(strapi));
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureIndexes(strapi);
    await syncPermissions(strapi);
    await ensureAdminUser(strapi);

    if (process.env.SEED_DEMO_DATA !== 'false') {
      await withoutRevalidation(() => seedDemoData(strapi, { reset: process.env.SEED_RESET === 'true' }));
    }
  },
};
