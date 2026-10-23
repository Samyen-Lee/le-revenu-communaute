/**
 * Permissions Users & Permissions déclarées dans le code, pour qu'elles soient identiques
 * sur chaque environnement (au lieu d'être cochées à la main dans l'admin).
 *
 * Pour les API de la communauté, la liste fait foi : une permission ajoutée à la main dans
 * l'admin sur ces API (ex. « create » pour le rôle Public) est retirée au démarrage.
 */
import type { Core } from '@strapi/strapi';

const MANAGED_PREFIXES = ['api::category.', 'api::discussion.', 'api::reply.', 'api::member.'];

const READ_ACTIONS = [
  'api::category.category.find',
  'api::category.category.findOne',
  'api::discussion.discussion.find',
  'api::discussion.discussion.findOne',
  'api::reply.reply.find',
  'api::member.member.findOne',
];

export const ROLE_PERMISSIONS: Record<'public' | 'authenticated', string[]> = {
  public: READ_ACTIONS,
  authenticated: [...READ_ACTIONS, 'api::discussion.discussion.create', 'api::reply.reply.create'],
};

const ROLE_UID = 'plugin::users-permissions.role';
const PERMISSION_UID = 'plugin::users-permissions.permission';

export const syncPermissions = async (strapi: Core.Strapi) => {
  for (const [type, actions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await strapi.db.query(ROLE_UID).findOne({ where: { type } });
    if (!role) continue;

    const existing = await strapi.db.query(PERMISSION_UID).findMany({ where: { role: role.id } });
    const managed = existing.filter((p) => MANAGED_PREFIXES.some((prefix) => p.action.startsWith(prefix)));

    const toRemove = managed.filter((p) => !actions.includes(p.action));
    const toAdd = actions.filter((action) => !existing.some((p) => p.action === action));

    if (toRemove.length) {
      await strapi.db.query(PERMISSION_UID).deleteMany({ where: { id: { $in: toRemove.map((p) => p.id) } } });
    }
    for (const action of toAdd) {
      await strapi.db.query(PERMISSION_UID).create({ data: { action, role: role.id } });
    }
  }
};
