import Link from 'next/link';
import { SpaceIcon } from '@/components/categories/SpaceIcon';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { cn } from '@/lib/cn';
import type { DiscussionSummary } from '@/lib/strapi/types';

export const rowGrid = 'grid grid-cols-[minmax(0,1fr)_62px_92px] items-center gap-2.5 px-3.5 md:grid-cols-[minmax(0,1fr)_70px_110px] md:px-[18px]';

/** Vue compacte : une discussion par ligne, réponses et dernière activité en colonnes. */
export function DiscussionRow({ discussion }: { discussion: DiscussionSummary }) {
  const { category, author } = discussion;
  return (
    <div className={cn(rowGrid, 'group row-hover relative border-t border-line py-[9px] first:border-t-0')}>
      <span className="flex min-w-0 items-center gap-2.5">
        {category && <SpaceIcon category={category} size="md" />}
        <span className="flex min-w-0 flex-col">
          <Link
            href={`/discussions/${discussion.slug}`}
            className="line-clamp-2 text-[14.5px] font-semibold text-ink group-hover:text-brand-text after:absolute after:inset-0 md:truncate"
          >
            {discussion.title}
          </Link>
          <small className="truncate text-xs text-ink-3">
            {category?.name} · {author?.displayName ?? 'Membre supprimé'}
            {discussion.type === 'question' && ' · Question'}
          </small>
        </span>
      </span>
      <span
        className={cn(
          'text-right text-[13.5px] tabular-nums',
          discussion.repliesCount === 0 ? 'font-semibold text-alert' : 'text-ink-2',
        )}
      >
        {discussion.repliesCount}
      </span>
      <span className="text-right text-[13px] whitespace-nowrap text-ink-2">
        <RelativeTime date={discussion.lastActivityAt} />
      </span>
    </div>
  );
}
