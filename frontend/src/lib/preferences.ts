import 'server-only';
import { cookies } from 'next/headers';
import type { Density } from '@/components/discussions/DiscussionList';

/** Densité d'affichage du fil, mémorisée dans un cookie pour être rendue dès le serveur. */
export const DENSITY_COOKIE = 'lr_density';

export async function getDensity(): Promise<Density> {
  return (await cookies()).get(DENSITY_COOKIE)?.value === 'compact' ? 'compact' : 'comfy';
}
