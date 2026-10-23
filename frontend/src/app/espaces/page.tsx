import type { Metadata } from 'next';
import Link from 'next/link';
import { SpaceIcon } from '@/components/categories/SpaceIcon';
import { MainColumn } from '@/components/layout/PageColumns';
import { getCategories } from '@/lib/strapi/queries';

export const metadata: Metadata = { title: 'Tous les espaces' };

/** Grille des espaces : entièrement issue du cache, donc prérendue. */
export default async function SpacesPage() {
  const categories = await getCategories();
  return (
    <MainColumn wide>
      <header>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.01em]">Tous les espaces</h1>
        <p className="mt-1.5 max-w-[62ch] text-ink-2">
          {categories.length} espaces thématiques, calqués sur les grandes rubriques du Revenu.
        </p>
      </header>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3.5">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/espaces/${category.slug}`}
            className="flex flex-col gap-1.5 rounded-card border border-hairline bg-surface p-[18px] shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
          >
            <span className="mb-1.5">
              <SpaceIcon category={category} size="lg" />
            </span>
            <h2 className="font-display text-lg font-bold tracking-[-0.01em]">{category.name}</h2>
            <p className="flex-1 text-[13.5px] text-ink-2">{category.description}</p>
          </Link>
        ))}
      </div>
    </MainColumn>
  );
}
