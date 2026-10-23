import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { Pagination as PaginationMeta } from '@/lib/strapi/types';

/** Fenêtre de pages autour de la page courante : 1 … 4 5 [6] 7 8 … 20 */
export function pageWindow(page: number, pageCount: number, radius = 2): (number | 'gap')[] {
  const pages: (number | 'gap')[] = [];
  for (let p = 1; p <= pageCount; p += 1) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= radius) pages.push(p);
    else if (pages.at(-1) !== 'gap') pages.push('gap');
  }
  return pages;
}

const itemClass =
  'inline-grid h-9 min-w-9 place-items-center rounded-control px-2.5 text-sm font-medium tabular-nums transition';

export function Pagination({ pagination, hrefFor }: { pagination: PaginationMeta; hrefFor: (page: number) => string }) {
  const { page, pageCount } = pagination;
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cn(itemClass, 'text-ink-2 hover:bg-fill')} rel="prev">
          <ChevronLeft className="size-4" aria-hidden />
          <span className="sr-only">Page précédente</span>
        </Link>
      ) : null}
      {pageWindow(page, pageCount).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="px-1 text-ink-3">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              itemClass,
              item === page ? 'bg-surface text-ink shadow-card font-semibold' : 'text-ink-2 hover:bg-fill',
            )}
          >
            {item}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={cn(itemClass, 'text-ink-2 hover:bg-fill')} rel="next">
          <span className="sr-only">Page suivante</span>
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
