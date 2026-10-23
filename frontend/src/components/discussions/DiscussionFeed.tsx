import { Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { cn } from '@/lib/cn';
import {
  FEED_FILTERS,
  FEED_SORTS,
  type FeedScope,
  type FeedSort,
  type FeedState,
  feedHref,
  parseFeedParams,
  toDiscussionQuery,
} from '@/lib/feed-params';
import { getDensity } from '@/lib/preferences';
import { getDiscussions } from '@/lib/strapi/queries';
import { DiscussionList } from './DiscussionList';
import { DensityToggle, SortSelect } from './FeedControls';

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Fil de discussions piloté par l'URL (filtre, tri, page, recherche). Composant serveur :
 * il lit les paramètres de la requête, interroge Strapi (lecture mise en cache) et rend la liste.
 * À placer sous <Suspense>, car il dépend de données de requête (searchParams, cookie de densité).
 */
export async function DiscussionFeed({
  searchParams,
  basePath,
  scope = {},
  showFilters = true,
}: {
  searchParams: Promise<SearchParams>;
  basePath: string;
  scope?: FeedScope;
  showFilters?: boolean;
}) {
  const state = parseFeedParams(await searchParams);
  const [result, unanswered, density] = await Promise.all([
    getDiscussions(toDiscussionQuery(state, scope)),
    getDiscussions({ ...scope, unanswered: true, pageSize: 1 }),
    getDensity(),
  ]);

  const sortHrefs = Object.fromEntries(
    FEED_SORTS.map((sort) => [sort.value, feedHref(basePath, { ...state, sort: sort.value, page: 1 })]),
  ) as Record<FeedSort, string>;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {showFilters ? (
          <FilterTabs state={state} basePath={basePath} unansweredCount={unanswered.meta.pagination.total} />
        ) : (
          <p className="text-ink-3">
            <span className="tabular-nums">{result.meta.pagination.total}</span> résultat
            {result.meta.pagination.total > 1 ? 's' : ''} pour « {state.q} »
          </p>
        )}
        <div className="flex items-center gap-2">
          <SortSelect value={state.sort} hrefs={sortHrefs} />
          <DensityToggle value={density} />
        </div>
      </div>

      <DiscussionList
        discussions={result.data}
        density={density}
        empty={<FeedEmptyState state={state} basePath={basePath} scope={scope} />}
      />

      <Pagination
        pagination={result.meta.pagination}
        hrefFor={(page) => feedHref(basePath, { ...state, page })}
      />
    </>
  );
}

function FilterTabs({ state, basePath, unansweredCount }: { state: FeedState; basePath: string; unansweredCount: number }) {
  return (
    <nav
      aria-label="Filtrer les discussions"
      className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-control bg-fill p-[3px] [scrollbar-width:none]"
    >
      {FEED_FILTERS.map((filter) => {
        const active = state.filter === filter.value;
        return (
          <Link
            key={filter.value}
            href={feedHref(basePath, { ...state, filter: filter.value, page: 1 })}
            aria-current={active ? 'page' : undefined}
            scroll={false}
            className={cn(
              'inline-flex items-center gap-[7px] rounded-lg px-3.5 py-1.5 text-sm whitespace-nowrap transition',
              active
                ? 'bg-surface font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,.12)]'
                : 'font-medium text-ink-2 hover:text-ink',
            )}
          >
            {filter.label}
            {filter.value === 'sans-reponse' && unansweredCount > 0 && (
              <span className="rounded-full bg-alert-soft px-[7px] py-px text-[11.5px] text-alert tabular-nums">
                {unansweredCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function FeedEmptyState({ state, basePath, scope }: { state: FeedState; basePath: string; scope: FeedScope }) {
  if (state.q) {
    return (
      <EmptyState
        title="Aucune discussion trouvée"
        action={
          <Link href="/publier" className="btn btn-primary">
            <Plus className="size-[18px]" aria-hidden /> Poser cette question
          </Link>
        }
      >
        Posez la question à la communauté : quelqu’un a sûrement vécu la même situation.
      </EmptyState>
    );
  }
  if (state.page > 1) {
    return (
      <EmptyState
        title="Cette page est vide"
        action={
          <Link href={feedHref(basePath, { ...state, page: 1 })} className="btn btn-secondary">
            Revenir à la première page
          </Link>
        }
      />
    );
  }
  if (scope.author) {
    return <EmptyState title="Aucune discussion pour l’instant">Ce membre n’a pas encore lancé de discussion.</EmptyState>;
  }
  if (state.filter === 'sans-reponse') {
    return (
      <EmptyState title="Toutes les questions ont une réponse">
        Bravo à la communauté ! Revenez plus tard ou posez à votre tour une question.
      </EmptyState>
    );
  }
  return (
    <EmptyState
      title="Rien ici pour l’instant"
      action={
        <Link href="/publier" className="btn btn-primary">
          <Plus className="size-[18px]" aria-hidden /> Publier
        </Link>
      }
    >
      {scope.category ? 'Lancez la première discussion de cet espace.' : 'Lancez la première discussion de la communauté.'}
    </EmptyState>
  );
}
