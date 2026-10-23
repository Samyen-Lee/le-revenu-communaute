import type { DiscussionType } from './strapi/types';

/**
 * Contrôles de confort côté navigateur (retour immédiat). Ils reprennent les règles de Strapi,
 * qui reste la seule source de vérité : toute requête est revalidée côté serveur.
 */
export const DISCUSSION_RULES = { titleMin: 10, titleMax: 150, contentMax: 10_000 } as const;
export const REPLY_RULES = { contentMin: 2, contentMax: 5_000 } as const;

export type DiscussionFormValues = { title: string; content: string; type: DiscussionType | ''; category: string };
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function validateDiscussionForm(values: DiscussionFormValues): FieldErrors<DiscussionFormValues> {
  const errors: FieldErrors<DiscussionFormValues> = {};
  const title = values.title.trim();
  if (!title) errors.title = 'Le titre est obligatoire.';
  else if (title.length < DISCUSSION_RULES.titleMin)
    errors.title = `Le titre doit contenir au moins ${DISCUSSION_RULES.titleMin} caractères.`;
  else if (title.length > DISCUSSION_RULES.titleMax)
    errors.title = `Le titre ne doit pas dépasser ${DISCUSSION_RULES.titleMax} caractères.`;

  const content = values.content.trim();
  if (!content) errors.content = 'Le contenu est obligatoire.';
  else if (content.length > DISCUSSION_RULES.contentMax)
    errors.content = `Le contenu ne doit pas dépasser ${DISCUSSION_RULES.contentMax} caractères.`;

  if (values.type !== 'question' && values.type !== 'discussion') errors.type = 'Choisissez un type de publication.';
  if (!values.category) errors.category = 'Choisissez un espace.';
  return errors;
}

export function validateReply(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return 'La réponse ne peut pas être vide.';
  if (trimmed.length < REPLY_RULES.contentMin) return `La réponse doit contenir au moins ${REPLY_RULES.contentMin} caractères.`;
  if (trimmed.length > REPLY_RULES.contentMax) return `La réponse ne doit pas dépasser ${REPLY_RULES.contentMax} caractères.`;
  return null;
}
