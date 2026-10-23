/**
 * Garde-fou explicite sur les routes d'écriture.
 *
 * Les permissions Users & Permissions refusent déjà la publication au rôle Public (403).
 * Cette policy garantit en plus qu'aucune écriture n'aboutit sans utilisateur, même si un
 * administrateur ouvrait par erreur la permission `create` au rôle Public.
 */
import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';

type ContextWithState = Core.PolicyContext & { state: { user?: unknown } };

const isAuthenticated: Core.PolicyHandler = (policyContext) => {
  if ((policyContext as ContextWithState).state.user) return true;
  throw new errors.UnauthorizedError('Vous devez être connecté pour publier.');
};

export default isAuthenticated;
