'use server';

import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionToken } from '../session';
import { strapiFetch } from '../strapi/client';
import { CACHE_TAGS } from '../strapi/queries';
import type { Discussion, Reply } from '../strapi/types';
import { formString, toFormError } from './action-utils';
import type { FormState } from './form-state';

/*
 * Les Server Actions relaient les écritures vers Strapi avec le JWT de l'utilisateur.
 * Aucune règle métier ici : validation, auteur et permissions sont appliqués par Strapi.
 * Après succès, updateTag expire immédiatement le cache des discussions (lecture de sa propre écriture).
 */

export type DiscussionField = 'title' | 'content' | 'type' | 'category';

export async function createDiscussionAction(
  _previous: FormState<DiscussionField>,
  formData: FormData,
): Promise<FormState<DiscussionField>> {
  const token = await getSessionToken();
  if (!token) redirect('/connexion?next=/publier');

  let slug: string;
  try {
    const { data } = await strapiFetch<{ data: Discussion }>('/discussions', {
      method: 'POST',
      token,
      body: {
        data: {
          title: formString(formData, 'title'),
          content: formString(formData, 'content'),
          type: formString(formData, 'type'),
          category: formString(formData, 'category'),
        },
      },
    });
    slug = data.slug;
  } catch (error) {
    return toFormError<DiscussionField>(error);
  }

  updateTag(CACHE_TAGS.discussions);
  redirect(`/discussions/${slug}`);
}

export type ReplyField = 'content';

export async function createReplyAction(
  discussionDocumentId: string,
  _previous: FormState<ReplyField>,
  formData: FormData,
): Promise<FormState<ReplyField>> {
  const token = await getSessionToken();
  if (!token) return { status: 'error', message: 'Connectez-vous pour répondre.' };

  try {
    await strapiFetch<{ data: Reply }>('/replies', {
      method: 'POST',
      token,
      body: { data: { content: formString(formData, 'content'), discussion: discussionDocumentId } },
    });
  } catch (error) {
    return toFormError<ReplyField>(error);
  }

  updateTag(CACHE_TAGS.discussions);
  return { status: 'success', message: 'Votre réponse est publiée.', submittedAt: Date.now() };
}
