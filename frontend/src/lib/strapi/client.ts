import 'server-only';
import type { StrapiErrorPayload } from './types';

/**
 * Point d'entrée unique vers l'API Strapi. Exécuté uniquement côté serveur : l'URL interne
 * de Strapi et le jeton de l'utilisateur ne sont jamais exposés au navigateur.
 */
const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';
const TIMEOUT_MS = 10_000;

export class StrapiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Erreurs de validation par champ, issues de error.details.errors */
    readonly fieldErrors: Record<string, string> = {},
    readonly code = 'ApplicationError',
  ) {
    super(message);
    this.name = 'StrapiError';
  }

  static fromPayload(status: number, payload: unknown) {
    const error = (payload as StrapiErrorPayload | null)?.error;
    const fieldErrors: Record<string, string> = {};
    for (const item of error?.details?.errors ?? []) {
      const field = String(item.path?.[0] ?? '');
      if (field && !fieldErrors[field]) fieldErrors[field] = item.message;
    }
    return new StrapiError(status, error?.message ?? `Erreur ${status}`, fieldErrors, error?.name);
  }
}

/** Strapi injoignable (arrêté, réseau…) : à distinguer d'une erreur métier. */
export class StrapiUnavailableError extends Error {
  constructor(cause: unknown) {
    super('Le service de la communauté est momentanément indisponible.', { cause });
    this.name = 'StrapiUnavailableError';
  }
}

type QueryValue = string | number | boolean | undefined | null;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** JWT de l'utilisateur, pour les appels authentifiés */
  token?: string | null;
};

export async function strapiFetch<T>(path: string, { method = 'GET', query, body, token }: RequestOptions = {}) {
  const url = new URL(`/api${path}`, STRAPI_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (cause) {
    // Requête annulée par Next.js (rendu interrompu) : ce n'est pas une panne, on la laisse remonter.
    if (cause instanceof Error && cause.name === 'AbortError') throw cause;
    throw new StrapiUnavailableError(cause);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw StrapiError.fromPayload(response.status, payload);
  return payload as T;
}
