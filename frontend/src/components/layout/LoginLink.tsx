'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Lien vers la connexion qui ramène ensuite sur la page en cours. */
export function LoginLink({ className, children }: { className?: string; children: ReactNode }) {
  const pathname = usePathname();
  const next = pathname && pathname !== '/connexion' ? `?next=${encodeURIComponent(pathname)}` : '';
  return (
    <Link href={`/connexion${next}`} className={className}>
      {children}
    </Link>
  );
}
