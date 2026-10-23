import { revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { CACHE_TAGS } from '@/lib/strapi/queries';

const ALLOWED_TAGS = new Set<string>(Object.values(CACHE_TAGS));

const isAuthorized = (provided: string | null) => {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

/**
 * Appelé par Strapi (document middleware) quand un contenu change dans l'admin :
 * expire immédiatement les entrées de cache correspondantes.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request.headers.get('x-revalidate-secret'))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((tag): tag is string => ALLOWED_TAGS.has(tag as string)) : [];
  if (tags.length === 0) return NextResponse.json({ error: 'Aucun tag valide' }, { status: 400 });

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: tags });
}
