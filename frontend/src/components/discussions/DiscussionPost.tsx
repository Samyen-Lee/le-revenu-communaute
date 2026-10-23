import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { RelativeTime } from '@/components/ui/RelativeTime';
import type { Discussion } from '@/lib/strapi/types';
import { AuthorLine } from './AuthorLine';
import { CopyLinkButton } from './CopyLinkButton';
import { DiscussionMeta } from './DiscussionMeta';
import { Prose } from './Prose';

export function Breadcrumbs({ discussion }: { discussion: Discussion }) {
  return (
    <nav aria-label="Fil d’Ariane" className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-ink-3">
      <Link href="/" className="hover:text-ink">
        Accueil
      </Link>
      {discussion.category && (
        <>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link href={`/espaces/${discussion.category.slug}`} className="hover:text-ink">
            {discussion.category.name}
          </Link>
        </>
      )}
    </nav>
  );
}

/** Message d'ouverture d'une discussion. */
export function DiscussionPost({ discussion }: { discussion: Discussion }) {
  return (
    <article className="rounded-card border border-hairline bg-surface p-4 shadow-card md:px-[22px] md:py-5">
      <DiscussionMeta discussion={discussion} />
      <h1 className="mt-1.5 mb-3.5 font-display text-2xl leading-[1.2] font-bold tracking-[-0.01em] md:text-[29px]">
        {discussion.title}
      </h1>
      <AuthorLine author={discussion.author} size="md">
        Publiée <RelativeTime date={discussion.publishedAt} />
      </AuthorLine>
      <Prose text={discussion.content} className="mt-3.5" />
      <div className="mt-4 flex flex-wrap items-center gap-1">
        <CopyLinkButton />
      </div>
    </article>
  );
}
