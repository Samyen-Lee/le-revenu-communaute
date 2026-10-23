/**
 * Règles de validation métier, appliquées côté Strapi quel que soit le client.
 * Les messages sont en français car ils sont renvoyés tels quels au formulaire (error.details.errors).
 */
import { yup, validateYupSchema } from '@strapi/utils';

export const DISCUSSION_TYPES = ['question', 'discussion'] as const;
export type DiscussionType = (typeof DISCUSSION_TYPES)[number];

export const DISCUSSION_RULES = { titleMin: 10, titleMax: 150, contentMax: 10_000 } as const;
export const REPLY_RULES = { contentMin: 2, contentMax: 5_000 } as const;

export const DISCUSSION_SORTS = [
  'publishedAt:desc',
  'publishedAt:asc',
  'repliesCount:desc',
  'lastActivityAt:desc',
] as const;
export type DiscussionSort = (typeof DISCUSSION_SORTS)[number];

const PAGE_SIZE_MAX = 50;
const REPLIES_PAGE_SIZE_MAX = 100;

const options = { strict: false, abortEarly: false, stripUnknown: true };

const createDiscussionSchema = yup.object({
  title: yup
    .string()
    .typeError('Le titre doit être un texte.')
    .trim()
    .required('Le titre est obligatoire.')
    .min(DISCUSSION_RULES.titleMin, `Le titre doit contenir au moins ${DISCUSSION_RULES.titleMin} caractères.`)
    .max(DISCUSSION_RULES.titleMax, `Le titre ne doit pas dépasser ${DISCUSSION_RULES.titleMax} caractères.`),
  content: yup
    .string()
    .typeError('Le contenu doit être un texte.')
    .trim()
    .required('Le contenu est obligatoire.')
    .max(DISCUSSION_RULES.contentMax, `Le contenu ne doit pas dépasser ${DISCUSSION_RULES.contentMax} caractères.`),
  type: yup
    .string()
    .required('Le type est obligatoire.')
    .oneOf([...DISCUSSION_TYPES], 'Le type doit être « question » ou « discussion ».'),
  category: yup.string().typeError('La catégorie est invalide.').trim().required('La catégorie est obligatoire.'),
});

export type CreateDiscussionInput = {
  title: string;
  content: string;
  type: DiscussionType;
  /** Slug de la catégorie */
  category: string;
};

export const validateCreateDiscussion = (data: unknown) =>
  validateYupSchema(createDiscussionSchema, options)(data ?? {}) as Promise<CreateDiscussionInput>;

const createReplySchema = yup.object({
  content: yup
    .string()
    .typeError('La réponse doit être un texte.')
    .trim()
    .required('La réponse ne peut pas être vide.')
    .min(REPLY_RULES.contentMin, `La réponse doit contenir au moins ${REPLY_RULES.contentMin} caractères.`)
    .max(REPLY_RULES.contentMax, `La réponse ne doit pas dépasser ${REPLY_RULES.contentMax} caractères.`),
  discussion: yup
    .string()
    .typeError('La discussion est invalide.')
    .trim()
    .required('La discussion est obligatoire.'),
});

export type CreateReplyInput = {
  content: string;
  /** documentId de la discussion */
  discussion: string;
};

export const validateCreateReply = (data: unknown) =>
  validateYupSchema(createReplySchema, options)(data ?? {}) as Promise<CreateReplyInput>;

const discussionListSchema = yup.object({
  category: yup.string().trim().max(80),
  author: yup.string().trim().max(60),
  type: yup.string().oneOf([...DISCUSSION_TYPES], 'Le type doit être « question » ou « discussion ».'),
  unanswered: yup.boolean().typeError('Le filtre « unanswered » doit valoir true ou false.'),
  q: yup.string().trim().max(100, 'La recherche ne doit pas dépasser 100 caractères.'),
  sort: yup
    .string()
    .oneOf([...DISCUSSION_SORTS], `Tri invalide. Valeurs possibles : ${DISCUSSION_SORTS.join(', ')}.`)
    .default('publishedAt:desc'),
  page: yup.number().typeError('La page doit être un nombre.').integer().min(1).default(1),
  pageSize: yup
    .number()
    .typeError('La taille de page doit être un nombre.')
    .integer()
    .min(1)
    .max(PAGE_SIZE_MAX, `La taille de page ne doit pas dépasser ${PAGE_SIZE_MAX}.`)
    .default(10),
});

export type DiscussionListParams = {
  category?: string;
  /** username de l'auteur */
  author?: string;
  type?: DiscussionType;
  unanswered?: boolean;
  q?: string;
  sort: DiscussionSort;
  page: number;
  pageSize: number;
};

/** Accepte `page`/`pageSize` à plat ou la syntaxe Strapi `pagination[page]`. */
export const validateDiscussionListQuery = (query: Record<string, unknown>) => {
  const pagination = (query.pagination ?? {}) as Record<string, unknown>;
  return validateYupSchema(discussionListSchema, options)({
    ...query,
    page: query.page ?? pagination.page,
    pageSize: query.pageSize ?? pagination.pageSize,
  }) as Promise<DiscussionListParams>;
};

const replyListSchema = yup.object({
  discussion: yup.string().trim().required('Le paramètre « discussion » est obligatoire.'),
  page: yup.number().typeError('La page doit être un nombre.').integer().min(1).default(1),
  pageSize: yup
    .number()
    .typeError('La taille de page doit être un nombre.')
    .integer()
    .min(1)
    .max(REPLIES_PAGE_SIZE_MAX, `La taille de page ne doit pas dépasser ${REPLIES_PAGE_SIZE_MAX}.`)
    .default(50),
});

export type ReplyListParams = { discussion: string; page: number; pageSize: number };

export const validateReplyListQuery = (query: Record<string, unknown>) => {
  const pagination = (query.pagination ?? {}) as Record<string, unknown>;
  return validateYupSchema(replyListSchema, options)({
    ...query,
    page: query.page ?? pagination.page,
    pageSize: query.pageSize ?? pagination.pageSize,
  }) as Promise<ReplyListParams>;
};
