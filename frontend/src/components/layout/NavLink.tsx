'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, Suspense } from 'react';
import { cn } from '@/lib/cn';

type NavLinkProps = { href: string; exact?: boolean; icon: ReactNode; children: ReactNode };

const baseClass =
  'flex items-center gap-[11px] rounded-sm px-2.5 py-[7px] text-sm font-medium text-ink-2 hover:bg-fill hover:text-ink [&>svg]:size-[18px] [&>svg]:shrink-0';

function LinkBody({ href, icon, children, active }: Omit<NavLinkProps, 'exact'> & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(baseClass, active && 'bg-fill-2 font-semibold text-ink [&>svg]:text-brand-text')}
    >
      {icon}
      <span className="min-w-0">{children}</span>
    </Link>
  );
}

function ActiveAwareLink({ exact, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === props.href : pathname === props.href || pathname.startsWith(`${props.href}/`);
  return <LinkBody {...props} active={active} />;
}

/**
 * Lien de navigation surligné quand il correspond à la page courante.
 * usePathname peut suspendre pendant le prérendu des routes dynamiques : le lien inactif sert de repli.
 */
export function NavLink(props: NavLinkProps) {
  return (
    <Suspense fallback={<LinkBody {...props} active={false} />}>
      <ActiveAwareLink {...props} />
    </Suspense>
  );
}
