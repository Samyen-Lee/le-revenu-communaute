import { CircleQuestionMark } from 'lucide-react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/Card';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { getDiscussions } from '@/lib/strapi/queries';

/** « Ils attendent votre aide » : questions sans réponse, l'incitation la plus efficace à contribuer. */
export async function UnansweredWidget({ category }: { category?: string }) {
  const { data, meta } = await getDiscussions({ category, unanswered: true, sort: 'publishedAt:desc', pageSize: 3 });
  if (data.length === 0) return null;

  const moreHref = category ? `/espaces/${category}?filtre=sans-reponse` : '/?filtre=sans-reponse';
  return (
    <Card>
      <CardTitle action={meta.pagination.total > data.length ? <Link href={moreHref}>Tout voir</Link> : undefined}>
        <CircleQuestionMark aria-hidden />
        Ils attendent votre aide
      </CardTitle>
      <ul className="flex flex-col">
        {data.map((discussion) => (
          <li key={discussion.documentId} className="border-t border-line py-3 first:border-t-0 first:pt-0 last:pb-0">
            <Link href={`/discussions/${discussion.slug}`} className="text-[14.5px] font-semibold hover:text-brand-text">
              {discussion.title}
            </Link>
            <p className="mt-0.5 text-[13px] text-ink-3">
              {discussion.author?.displayName} · <RelativeTime date={discussion.publishedAt} />
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
