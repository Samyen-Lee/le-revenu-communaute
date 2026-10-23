import { ExternalLink, House, LayoutGrid, Search } from 'lucide-react';
import { Suspense } from 'react';
import { SpaceIcon } from '@/components/categories/SpaceIcon';
import { getCategories } from '@/lib/strapi/queries';
import { NavLink } from './NavLink';
import { SITE_URL } from './SiteBar';

/** Barre latérale (≥ 761 px) : navigation statique, puis la liste des espaces issue de Strapi. */
export function SideNav() {
  return (
    <nav aria-label="Navigation principale" className="sticky top-[86px] hidden flex-col gap-0.5 md:row-span-3 md:flex">
      <NavLink href="/" exact icon={<House aria-hidden />}>
        Accueil
      </NavLink>
      <NavLink href="/espaces" exact icon={<LayoutGrid aria-hidden />}>
        Tous les espaces
      </NavLink>
      <NavLink href="/recherche" exact icon={<Search aria-hidden />}>
        Rechercher
      </NavLink>
      <div className="px-2.5 pt-[18px] pb-1.5 text-[11.5px] font-semibold text-ink-3">Espaces</div>
      <Suspense fallback={<SpaceLinksSkeleton />}>
        <SpaceLinks />
      </Suspense>
      <a
        href={SITE_URL}
        className="mt-[18px] flex items-center gap-2 border-t border-hairline px-2.5 pt-3 text-[13px] text-ink-3 hover:text-brand-text"
      >
        Retour sur lerevenu.com
        <ExternalLink className="ml-auto size-[13px]" aria-hidden />
      </a>
    </nav>
  );
}

async function SpaceLinks() {
  const categories = await getCategories();
  return categories.map((category) => (
    <NavLink key={category.slug} href={`/espaces/${category.slug}`} icon={<SpaceIcon category={category} />}>
      {category.name}
    </NavLink>
  ));
}

function SpaceLinksSkeleton() {
  return Array.from({ length: 8 }, (_, index) => (
    <div key={index} aria-hidden className="flex items-center gap-[11px] px-2.5 py-[7px]">
      <span className="skeleton size-[22px] rounded-md" />
      <span className="skeleton h-3.5 w-28" />
    </div>
  ));
}
