import { Plus, Search } from 'lucide-react';
import Form from 'next/form';
import Link from 'next/link';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/session';
import { LoginLink } from './LoginLink';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';

/**
 * En-tête : la partie statique (logo, recherche) est prérendue ; seule la zone compte,
 * qui dépend du cookie de session, est rendue à la requête derrière <Suspense>.
 */
export function Header() {
  return (
    <header className="glass sticky top-0 z-40 border-b border-hairline">
      <div className="mx-auto flex h-[62px] max-w-[1260px] items-center gap-5 px-4">
        <Logo />
        <Form
          action="/recherche"
          role="search"
          className="hidden h-9 max-w-[420px] flex-1 items-center gap-2 rounded-control border border-transparent bg-fill px-3 text-sm text-ink-3 transition focus-within:border-brand focus-within:bg-surface search:flex"
        >
          <Search className="size-[18px] shrink-0" aria-hidden />
          <input
            name="q"
            type="search"
            placeholder="Rechercher une discussion, un sujet…"
            aria-label="Rechercher une discussion"
            autoComplete="off"
            maxLength={100}
            className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3"
          />
        </Form>
        <div className="ml-auto flex items-center gap-2.5">
          <Link
            href="/recherche"
            aria-label="Rechercher"
            className="grid size-9 place-items-center rounded-[9px] text-ink-2 hover:bg-fill hover:text-ink search:hidden"
          >
            <Search className="size-[18px]" aria-hidden />
          </Link>
          <Suspense fallback={<div className="skeleton h-9 w-36 rounded-full" />}>
            <AccountActions />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function AccountActions() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <>
        <LoginLink className="btn btn-quiet">Se connecter</LoginLink>
        <LoginLink className="btn btn-primary hidden search:inline-flex">Rejoindre</LoginLink>
      </>
    );
  }
  return (
    <>
      <Link href="/publier" className="btn btn-primary hidden search:inline-flex">
        <Plus className="size-[18px]" aria-hidden />
        Publier
      </Link>
      <UserMenu user={user} />
    </>
  );
}
