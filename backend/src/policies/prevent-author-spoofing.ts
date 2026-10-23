/**
 * Empêche un utilisateur de publier au nom d'un autre.
 *
 * L'auteur est toujours déduit du jeton (ctx.state.user) dans les controllers. Cette policy rejette
 * en amont, avec un 403 explicite, toute requête qui tente de désigner un autre auteur, quelle que
 * soit la forme utilisée (id, documentId, { connect }, { set }…).
 */
import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const AUTHOR_KEYS = ['author', 'user', 'users_permissions_user'];

const extractRefs = (value: unknown): string[] => {
  if (typeof value === 'string' || typeof value === 'number') return [String(value)];
  if (Array.isArray(value)) return value.flatMap(extractRefs);
  if (value && typeof value === 'object') {
    const ref = value as Record<string, unknown>;
    return [
      ...(ref.id !== undefined ? [String(ref.id)] : []),
      ...(ref.documentId !== undefined ? [String(ref.documentId)] : []),
      ...extractRefs(ref.connect ?? []),
      ...extractRefs(ref.set ?? []),
    ];
  }
  return [];
};

type ContextWithState = Core.PolicyContext & {
  state: { user?: { id: number; documentId: string } };
  request: { body?: { data?: unknown } };
};

const preventAuthorSpoofing: Core.PolicyHandler = (policyContext) => {
  const { state, request } = policyContext as ContextWithState;
  const user = state.user;
  const data = request.body?.data;
  if (!data || typeof data !== 'object') return true;

  for (const key of AUTHOR_KEYS) {
    const claimed = (data as Record<string, unknown>)[key];
    if (claimed === undefined || claimed === null) continue;

    const refs = extractRefs(claimed);
    const isSelf =
      !!user && refs.length > 0 && refs.every((ref) => ref === String(user.id) || ref === user.documentId);
    if (!isSelf) {
      throw new errors.PolicyError('Vous ne pouvez pas publier au nom d’un autre membre.', {
        policy: 'prevent-author-spoofing',
        field: key,
      });
    }
  }
  return true;
};

export default preventAuthorSpoofing;
