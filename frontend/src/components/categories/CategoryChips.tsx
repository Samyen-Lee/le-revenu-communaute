import Link from 'next/link';
import { Suspense } from 'react';
import { cn } from '@/lib/cn';
import { getCategories } from '@/lib/strapi/queries';

const chipClass =
  'inline-flex items-center gap-[7px] whitespace-nowrap rounded-full border px-[13px] py-1.5 text-[13.5px] font-medium shadow-[0_1px_2px_rgba(0,0,0,.04)]';

const scrollerClass = '-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] md:hidden';

/** Filtre par espace sur mobile (la barre latérale est masquée sous 761 px). */
export function CategoryChips({ active }: { active?: string }) {
  return (
    <Suspense fallback={<div aria-hidden className={cn(scrollerClass, 'h-[34px]')} />}>
      <Chips active={active} />
    </Suspense>
  );
}

async function Chips({ active }: { active?: string }) {
  const categories = await getCategories();
  const chip = (href: string, label: string, isActive: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(chipClass, isActive ? 'border-brand bg-brand text-brand-ink' : 'border-hairline bg-surface text-ink-2')}
    >
      {label}
    </Link>
  );

  return (
    <nav aria-label="Espaces" className={scrollerClass}>
      {chip('/', 'Tout', !active)}
      {categories.map((category) => chip(`/espaces/${category.slug}`, category.name, active === category.slug))}
    </nav>
  );
}
