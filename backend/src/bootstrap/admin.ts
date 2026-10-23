/**
 * Crée le premier compte administrateur si SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD sont définis,
 * pour accéder directement à l'admin Strapi sans passer par l'écran d'inscription.
 */
import type { Core } from '@strapi/strapi';

export const ensureAdminUser = async (strapi: Core.Strapi) => {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) return;

  const adminUsers = strapi.service('admin::user');
  if (await adminUsers.exists()) return;

  await adminUsers.createFirstAdmin({ email, password, firstname: 'Admin', lastname: 'Démo' });
  strapi.log.info(`[seed] Compte administrateur créé : ${email}`);
};
