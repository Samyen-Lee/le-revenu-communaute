/**
 * Seules les routes utiles sont exposées : pas de modification ni de suppression publiques.
 * Les permissions (Public / Authenticated) sont déclarées dans src/bootstrap/permissions.ts.
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::discussion.discussion', {
  only: ['find', 'findOne', 'create'],
  config: {
    create: {
      policies: ['global::is-authenticated', 'global::prevent-author-spoofing'],
    },
  },
});
