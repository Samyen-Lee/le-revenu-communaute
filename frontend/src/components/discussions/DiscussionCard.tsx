import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { Tag } from '@/components/ui/Tag';
import { cn } from '@/lib/cn';
import type { DiscussionSummary } from '@/lib/strapi/types';
import { DiscussionMeta } from './DiscussionMeta';

/** Case de gauche : nombre de réponses, en pointillés rouges quand personne n'a encore répondu. */
function ReplyCountBox({ count }: { count: number }) {
  return (
    <div
      className={cn(
        'hidden h-[58px] w-[62px] flex-col items-center justify-center rounded-sm border leading-[1.1] md:flex',
        count === 0 ? 'border-dashed border-alert text-alert' : 'border-line text-ink-2',
      )}
    >
      <b className={cn('text-[19px] font-semibold tabular-nums', count === 0 ? 'text-alert' : 'text-ink')}>{count}</b>
      <span className="text-[10.5px] tracking-[0.02em]">{count > 1 ? 'réponses' : 'réponse'}</span>
    </div>
  );
}

/** Vue détaillée d'une discussion dans le fil. Toute la carte est cliquable (lien étiré sur le titre). */
export function DiscussionCard({ discussion }: { discussion: DiscussionSummary }) {
  const { author } = discussion;
  return (
    <article className="group row-hover relative grid grid-cols-1 gap-2 border-t border-line px-4 py-3.5 transition-colors first:border-t-0 md:grid-cols-[62px_minmax(0,1fr)] md:gap-4 md:px-[18px] md:py-4">
      <ReplyCountBox count={discussion.repliesCount} />
      <div className="min-w-0">
        <DiscussionMeta discussion={discussion} />
        <h3 className="font-display text-[18.5px] leading-[1.3] font-bold tracking-[-0.01em] text-ink group-hover:text-brand-text">
          <Link href={`/discussions/${discussion.slug}`} className="after:absolute after:inset-0">
            {discussion.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-2">{discussion.excerpt}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[13px] text-ink-3">
          <span className="inline-flex items-center gap-[7px]">
            <Avatar author={author} size="xs" />
            <b className="font-semibold text-ink-2">{author?.displayName ?? 'Membre supprimé'}</b>
            {author?.memberType === 'redaction' && <Tag variant="redac">Rédaction</Tag>}
            <span>
              · <RelativeTime date={discussion.publishedAt} />
            </span>
          </span>
          <span className="ml-auto inline-flex items-center gap-1 tabular-nums" title="Réponses">
            <MessageCircle className="size-[15px]" aria-hidden />
            <span className="sr-only">Réponses :</span>
            {discussion.repliesCount}
          </span>
        </div>
      </div>
    </article>
  );
}
