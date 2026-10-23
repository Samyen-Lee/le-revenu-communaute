import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CategoryChips } from '@/components/categories/CategoryChips';
import { SpaceIcon } from '@/components/categories/SpaceIcon';
import { DiscussionFeed } from '@/components/discussions/DiscussionFeed';
import { MainColumn, SideColumn } from '@/components/layout/PageColumns';
import { CardSkeleton, DiscussionListSkeleton, FeedToolbarSkeleton } from '@/components/ui/Skeletons';
import { AccountCard } from '@/components/widgets/AccountCard';
import { UnansweredWidget } from '@/components/widgets/UnansweredWidget';
import { getCategories, getCategory } from '@/lib/strapi/queries';

type Props = PageProps<'/espaces/[slug]'>;

/** Les espaces connus sont prérendus au build ; un espace ajouté ensuite dans Strapi est rendu à la demande. */
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  return category ? { title: category.name, description: category.description ?? undefined } : { title: 'Espace introuvable' };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <>
      <MainColumn>
        <section className="flex flex-wrap items-center gap-[18px] rounded-card border border-hairline bg-surface p-[22px] shadow-card">
          <SpaceIcon category={category} size="xl" />
          <div className="min-w-[220px] flex-1">
            <h1 className="font-display text-[28px] font-bold tracking-[-0.01em]">{category.name}</h1>
            {category.description && <p className="mt-1 max-w-[60ch] text-ink-2">{category.description}</p>}
          </div>
          <Link href={`/publier?espace=${category.slug}`} className="btn btn-primary">
            <Plus className="size-[18px]" aria-hidden /> Publier ici
          </Link>
        </section>
        <CategoryChips active={category.slug} />
        <Suspense
          fallback={
            <>
              <FeedToolbarSkeleton />
              <DiscussionListSkeleton />
            </>
          }
        >
          <DiscussionFeed searchParams={searchParams} basePath={`/espaces/${category.slug}`} scope={{ category: category.slug }} />
        </Suspense>
      </MainColumn>
      <SideColumn>
        <Suspense fallback={<CardSkeleton />}>
          <AccountCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <UnansweredWidget category={category.slug} />
        </Suspense>
      </SideColumn>
    </>
  );
}
