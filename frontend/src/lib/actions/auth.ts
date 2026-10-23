'use server';

import { redirect } from 'next/navigation';
import { clearSession, setSessionToken } from '../session';
import { StrapiError, strapiFetch } from '../strapi/client';
import { formString, safeRedirectPath, toFormError } from './action-utils';
import type { FormState } from './form-state';

export type LoginField = 'identifier' | 'password';

/** Connexion via Users & Permissions (POST /api/auth/local) ; le JWT reste côté serveur. */
export async function loginAction(_previous: FormState<LoginField>, formData: FormData): Promise<FormState<LoginField>> {
  const identifier = formString(formData, 'identifier').trim();
  const password = formString(formData, 'password');
  const next = safeRedirectPath(formString(formData, 'next'));

  if (!identifier || !password) {
    return {
      status: 'error',
      message: 'Renseignez votre identifiant et votre mot de passe.',
      fieldErrors: {
        ...(!identifier && { identifier: 'Identifiant obligatoire.' }),
        ...(!password && { password: 'Mot de passe obligatoire.' }),
      },
    };
  }

  try {
    const { jwt } = await strapiFetch<{ jwt: string }>('/auth/local', {
      method: 'POST',
      body: { identifier, password },
    });
    await setSessionToken(jwt);
  } catch (error) {
    if (error instanceof StrapiError && error.status === 400) {
      return { status: 'error', message: 'Identifiant ou mot de passe incorrect.' };
    }
    if (error instanceof StrapiError && error.status === 429) {
      return { status: 'error', message: 'Trop de tentatives. Patientez une minute avant de réessayer.' };
    }
    return toFormError(error);
  }

  redirect(next);
}

export async function logoutAction(formData: FormData) {
  await clearSession();
  redirect(safeRedirectPath(formString(formData, 'next')));
}
