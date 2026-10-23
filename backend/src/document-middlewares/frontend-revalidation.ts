/**
 * Prévient le front Next.js qu'un contenu a changé, pour qu'il invalide ses caches (tags).
 *
 * Next.js garde les listes et les discussions en cache (`use cache` + `cacheTag`). Les écritures
 * faites depuis le site invalident déjà ce cache dans la Server Action ; ce hook couvre les
 * modifications faites dans l'admin Strapi (correction d'un titre, ajout d'une catégorie…).
 * Désactivé si FRONTEND_REVALIDATE_URL n'est pas renseignée.
 */
import type { Core } from '@strapi/strapi';

const TAGS_BY_UID: Record<string, string[]> = {
  'api::category.category': ['categories', 'discussions'],
  'api::discussion.discussion': ['discussions'],
  'api::reply.reply': ['discussions'],
};
const WRITE_ACTIONS = new Set(['create', 'update', 'delete', 'publish', 'unpublish']);
const TIMEOUT_MS = 3_000;
const WARN_INTERVAL_MS = 60_000;

let paused = 0;

/** Suspend les notifications pendant un traitement de masse (ex. : seed). */
export const withoutRevalidation = async <T>(task: () => Promise<T>) => {
  paused += 1;
  try {
    return await task();
  } finally {
    paused -= 1;
  }
};

export const frontendRevalidationMiddleware = (strapi: Core.Strapi) => {
  const url = process.env.FRONTEND_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  let lastWarning = 0;

  return async (context: any, next: () => Promise<any>) => {
    const result = await next();
    const tags = TAGS_BY_UID[context.uid];
    if (!url || !secret || !tags || paused > 0 || !WRITE_ACTIONS.has(context.action)) return result;

    // Sans attendre : la réponse de l'API ne doit pas dépendre de la disponibilité du front.
    fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }).catch((error: Error) => {
      if (Date.now() - lastWarning < WARN_INTERVAL_MS) return;
      lastWarning = Date.now();
      strapi.log.warn(`[revalidation] front injoignable (${url}) : ${error.message}`);
    });

    return result;
  };
};
