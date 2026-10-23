import Link from 'next/link';
import { Tag } from '@/components/ui/Tag';
import type { DiscussionSummary } from '@/lib/strapi/types';

/** Ligne d'en-tête d'une discussion : espace (lien) et type. */
export function DiscussionMeta({ discussion }: { discussion: Pick<DiscussionSummary, 'category' | 'type'> }) {
  const { category } = discussion;
  return (
    <div className="mb-[5px] flex flex-wrap items-center gap-2 text-[12.5px]">
      {category && (
        <Link
          href={`/espaces/${category.slug}`}
          className="relative z-10 font-semibold text-brand-text hover:text-ink"
        >
          {category.name}
        </Link>
      )}
      <Tag>{discussion.type === 'question' ? 'Question' : 'Discussion'}</Tag>
    </div>
  );
}
