'use client';

import { LogOut, PenLine, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { logoutAction } from '@/lib/actions/auth';
import type { SessionUser } from '@/lib/strapi/types';

const itemClass =
  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-sm hover:bg-brand hover:text-white [&>svg]:size-4';

/** Menu du compte connecté (profil, publication, déconnexion). */
export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Mon compte (${user.displayName})`}
        className="flex items-center gap-2 rounded-full border border-hairline bg-surface py-[3px] pr-2.5 pl-[3px] shadow-[0_1px_2px_rgba(0,0,0,.05)] hover:bg-surface-2"
      >
        <Avatar author={user} size="sm" />
        <span className="hidden max-w-[12ch] truncate text-[13px] font-semibold md:inline">{user.displayName}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+8px)] right-0 z-60 w-[270px] overflow-hidden rounded-xl border border-hairline bg-surface shadow-pop"
        >
          <div className="flex items-center gap-2.5 border-b border-hairline px-4 py-3.5">
            <Avatar author={user} size="md" />
            <div className="min-w-0">
              <b className="block truncate">{user.displayName}</b>
              <span className="text-[13px] text-ink-3">@{user.username}</span>
            </div>
          </div>
          <div className="p-1.5" onClick={() => setOpen(false)}>
            <Link role="menuitem" href={`/membres/${encodeURIComponent(user.username)}`} className={itemClass}>
              <User aria-hidden />
              Mon profil
            </Link>
            <Link role="menuitem" href="/publier" className={itemClass}>
              <PenLine aria-hidden />
              Publier une discussion
            </Link>
            <form action={logoutAction}>
              <input type="hidden" name="next" value={pathname === '/publier' ? '/' : pathname} />
              <button role="menuitem" type="submit" className={itemClass}>
                <LogOut aria-hidden />
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
