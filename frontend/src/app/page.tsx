import { Suspense } from 'react';
import { CategoryChips } from '@/components/categories/CategoryChips';
import { DiscussionFeed } from '@/components/discussions/DiscussionFeed';
import { QuickComposer } from '@/components/discussions/QuickComposer';
import { MainColumn, SideColumn } from '@/components/layout/PageColumns';
import { CardSkeleton, DiscussionListSkeleton, FeedToolbarSkeleton } from '@/components/ui/Skeletons';
import { AccountCard } from '@/components/widgets/AccountCard';
import { SiteNewsWidget } from '@/components/widgets/SiteNewsWidget';
import { UnansweredWidget } from '@/components/widgets/UnansweredWidget';
import { Welcome, WelcomeSkeleton } from '@/components/widgets/Welcome';

/**
 * Accueil. Le cadre (composer, espaces, widgets en cache) fait partie du rendu statique ;
 * le fil, qui dépend de l'URL (?filtre, ?tri, ?page), et les blocs liés à la session
 * arrivent en streaming derrière leurs squelettes.
 */
export default function HomePage({ searchParams }: PageProps<'/'>) {
  return (
    <>
      <MainColumn>
        <Suspense fallback={<WelcomeSkeleton />}>
          <Welcome />
        </Suspense>
        <QuickComposer />
        <CategoryChips />
        <Suspense
          fallback={
            <>
              <FeedToolbarSkeleton />
              <DiscussionListSkeleton />
            </>
          }
        >
          <DiscussionFeed searchParams={searchParams} basePath="/" />
        </Suspense>
      </MainColumn>
      <SideColumn>
        <Suspense fallback={<CardSkeleton />}>
          <AccountCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <UnansweredWidget />
        </Suspense>
        <SiteNewsWidget />
      </SideColumn>
    </>
  );
}
