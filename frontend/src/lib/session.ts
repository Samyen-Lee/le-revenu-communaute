import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { StrapiError, strapiFetch } from './strapi/client';
import type { MemberType, SessionUser } from './strapi/types';

/**
 * Session : le JWT Strapi est stocké dans un cookie httpOnly, illisible par le JavaScript du
 * navigateur. Il n'est relu que côté serveur, pour les appels authentifiés à Strapi.
 */
const SESSION_COOKIE = 'lr_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // aligné sur JWT_EXPIRES_IN côté Strapi

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionToken(jwt: string) {
  (await cookies()).set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

type StrapiMe = {
  id: number;
  documentId: string;
  username: string;
  displayName: string | null;
  avatarColor: string | null;
  memberType: MemberType | null;
  expertTitle: string | null;
  isSubscriber: boolean | null;
  bio: string | null;
};

/**
 * Utilisateur courant, vérifié auprès de Strapi (/users/me). Mémoïsé pour la durée d'une requête
 * avec React.cache : l'en-tête, la page et le formulaire de réponse partagent le même appel.
 * Lit les cookies : à appeler sous une frontière <Suspense>.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const me = await strapiFetch<StrapiMe>('/users/me', { token });
    return {
      id: me.id,
      documentId: me.documentId,
      username: me.username,
      displayName: me.displayName || me.username,
      avatarColor: me.avatarColor,
      memberType: me.memberType ?? 'member',
      expertTitle: me.expertTitle,
      isSubscriber: Boolean(me.isSubscriber),
      bio: me.bio,
    };
  } catch (error) {
    // Jeton expiré ou révoqué : on se comporte comme un visiteur.
    if (error instanceof StrapiError && (error.status === 401 || error.status === 403)) return null;
    throw error;
  }
});
