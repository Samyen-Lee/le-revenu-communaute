import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { DiscussionList } from '@/components/discussions/DiscussionList';
import { Breadcrumbs, DiscussionPost } from '@/components/discussions/DiscussionPost';
import { ReplyBox, ReplyBoxSkeleton } from '@/components/discussions/ReplyBox';
import { ReplyItem } from '@/components/discussions/ReplyItem';
import { MainColumn, SideColumn } from '@/components/layout/PageColumns';
import { Pagination } from '@/components/ui/Pagination';
import { CategoryCard, DiscussionFacts, HelpCard } from '@/components/widgets/DiscussionSidebar';
import { getDiscussion, getDiscussions, getReplies } from '@/lib/strapi/queries';
import type { Author } from '@/lib/strapi/types';

type Props = PageProps<'/discussions/[slug]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const discussion = await getDiscussion((await params).slug);
  if (!discussion) return { title: 'Discussion introuvable' };
  return {
    title: discussion.title,
    description: discussion.content.replace(/\*\*/g, '').replace(/\s+/g, ' ').slice(0, 160),
  };
}

/**
 * Détail d'une discussion, adressé par son slug (/discussions/assurance-vie-apres-70-ans…).
 * Discussion, réponses et suggestions sont lues en parallèle depuis le cache ; seule la zone
 * de réponse dépend de la session et arrive en streaming.
 */
export default async function DiscussionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const discussion = await getDiscussion(slug);
  if (!discussion) notFound();

  const page = Math.max(1, Number.parseInt(String((await searchParams).page ?? '1'), 10) || 1);
  const [replies, related] = await Promise.all([
    getReplies(discussion.documentId, page),
    discussion.category ? getDiscussions({ category: discussion.category.slug, pageSize: 4 }) : null,
  ]);

  const participants = [discussion.author, ...replies.data.map((reply) => reply.author)].filter(
    (author, index, all): author is Author =>
      author !== null && all.findIndex((other) => other?.documentId === author.documentId) === index,
  );
  const relatedDiscussions = (related?.data ?? []).filter((item) => item.documentId !== discussion.documentId).slice(0, 3);
  const { total } = replies.meta.pagination;

  return (
    <>
      <MainColumn>
        <Breadcrumbs discussion={discussion} />
        <DiscussionPost discussion={discussion} />

        <section aria-labelledby="reponses" className="flex flex-col gap-3">
          <h2 id="reponses" className="font-display text-[21px] font-bold tracking-[-0.01em]">
            {total ? `${total} réponse${total > 1 ? 's' : ''}` : 'Aucune réponse pour l’instant'}
          </h2>
          {replies.data.map((reply) => (
            <ReplyItem key={reply.documentId} reply={reply} />
          ))}
          <Pagination
            pagination={replies.meta.pagination}
            hrefFor={(target) => `/discussions/${discussion.slug}${target > 1 ? `?page=${target}` : ''}#reponses`}
          />
          <Suspense fallback={<ReplyBoxSkeleton />}>
            <ReplyBox discussion={discussion} />
          </Suspense>
        </section>

        {relatedDiscussions.length > 0 && discussion.category && (
          <section aria-labelledby="a-lire-aussi" className="flex flex-col gap-3">
            <h2 id="a-lire-aussi" className="font-display text-[21px] font-bold tracking-[-0.01em]">
              À lire aussi dans {discussion.category.name}
            </h2>
            <DiscussionList discussions={relatedDiscussions} empty={null} />
          </section>
        )}
      </MainColumn>

      <SideColumn>
        {total === 0 && <HelpCard discussion={discussion} />}
        <DiscussionFacts discussion={discussion} participants={participants} />
        {discussion.category && <CategoryCard category={discussion.category} />}
      </SideColumn>
    </>
  );
}
