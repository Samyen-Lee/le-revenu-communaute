import 'server-only';
import { StrapiError, StrapiUnavailableError } from '../strapi/client';
import type { FormState } from './form-state';

/** Traduit une erreur de l'API en message affichable, sans exposer de détail technique. */
export function toFormError<Field extends string>(error: unknown): FormState<Field> {
  if (error instanceof StrapiUnavailableError) {
    return { status: 'error', message: 'Le service est momentanément indisponible. Réessayez dans un instant.' };
  }
  if (error instanceof StrapiError) {
    if (error.status === 400) {
      const hasFields = Object.keys(error.fieldErrors).length > 0;
      return {
        status: 'error',
        message: hasFields ? 'Certains champs sont à corriger.' : error.message,
        fieldErrors: error.fieldErrors as Partial<Record<Field, string>>,
      };
    }
    if (error.status === 401) return { status: 'error', message: 'Votre session a expiré : reconnectez-vous.' };
    if (error.status === 403) {
      return {
        status: 'error',
        message: error.code === 'PolicyError' ? error.message : 'Vous devez être connecté pour publier.',
      };
    }
    if (error.status === 404) return { status: 'error', message: 'Cette discussion n’existe plus.' };
  }
  console.error(error);
  return { status: 'error', message: 'Une erreur inattendue est survenue. Réessayez.' };
}

export const formString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

/** N'autorise que des redirections internes (évite les redirections ouvertes). */
export const safeRedirectPath = (value: string, fallback = '/') =>
  value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : fallback;
