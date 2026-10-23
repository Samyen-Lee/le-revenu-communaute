'use client';

import { House, LayoutGrid, Plus, Search, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Barre de navigation basse, affichée sous 761 px, avec le bouton central de publication. */
export function BottomNav({ username }: { username: string | null }) {
  const pathname = usePathname();
  const item = (href: string, label: string, icon: ReactNode, active: boolean) => (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex min-w-14 flex-col items-center gap-0.5 px-2 py-1 text-[11px] [&>svg]:size-[18px]',
        active ? 'font-semibold text-brand-text' : 'text-ink-3',
      )}
    >
      {icon}
      {label}
    </Link>
  );

  const profileHref = username ? `/membres/${encodeURIComponent(username)}` : `/connexion?next=${encodeURIComponent(pathname)}`;

  return (
    <nav
      aria-label="Navigation mobile"
      className="glass fixed inset-x-0 bottom-0 z-45 flex items-center justify-around border-t border-hairline px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] md:hidden"
    >
      {item('/', 'Accueil', <House aria-hidden />, pathname === '/')}
      {item('/espaces', 'Espaces', <LayoutGrid aria-hidden />, pathname.startsWith('/espaces'))}
      <Link
        href="/publier"
        aria-label="Publier"
        className="btn-primary -mt-[18px] grid size-12 place-items-center rounded-full shadow-[0_6px_16px_color-mix(in_srgb,var(--brand)_40%,transparent)]"
      >
        <Plus className="size-6" aria-hidden />
      </Link>
      {item('/recherche', 'Rechercher', <Search aria-hidden />, pathname === '/recherche')}
      {item(profileHref, username ? 'Profil' : 'Connexion', <User aria-hidden />, pathname.startsWith('/membres') || pathname === '/connexion')}
    </nav>
  );
}
