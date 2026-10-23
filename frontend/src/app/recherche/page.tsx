import { Search } from 'lucide-react';
import type { Metadata } from 'next';
import Form from 'next/form';
import Link from 'next/link';
import { Suspense } from 'react';
import { DiscussionFeed } from '@/components/discussions/DiscussionFeed';
import { MainColumn } from '@/components/layout/PageColumns';
import { DiscussionListSkeleton } from '@/components/ui/Skeletons';

export const metadata: Metadata = { title: 'Rechercher', robots: { index: false } };

const SUGGESTIONS = ['PEA', 'assurance-vie', 'donation', 'SCPI', 'PER', 'frais réels'];

/** Recherche plein texte (titre et contenu), effectuée par Strapi ($containsi). */
export default function SearchPage({ searchParams }: PageProps<'/recherche'>) {
  return (
    <MainColumn wide>
      <header>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.01em]">Rechercher</h1>
      </header>
      <Suspense fallback={<DiscussionListSkeleton rows={3} />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </MainColumn>
  );
}

async function SearchResults({ searchParams }: Pick<PageProps<'/recherche'>, 'searchParams'>) {
  const { q } = await searchParams;
  const query = (typeof q === 'string' ? q : '').trim();

  return (
    <>
      <Form
        action="/recherche"
        role="search"
        className="flex h-11 items-center gap-2 rounded-control border border-line bg-surface px-3 text-ink-3 focus-within:border-brand"
      >
        <Search className="size-[18px]" aria-hidden />
        <input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="PEA, donation, SCPI…"
          aria-label="Rechercher une discussion"
          maxLength={100}
          autoFocus
          className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Rechercher
        </button>
      </Form>
      {query ? (
        <DiscussionFeed searchParams={searchParams} basePath="/recherche" showFilters={false} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <Link
              key={suggestion}
              href={`/recherche?q=${encodeURIComponent(suggestion)}`}
              className="rounded-full border border-hairline bg-surface px-[13px] py-1.5 text-[13.5px] font-medium text-ink-2 shadow-[0_1px_2px_rgba(0,0,0,.04)] hover:text-ink"
            >
              {suggestion}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
