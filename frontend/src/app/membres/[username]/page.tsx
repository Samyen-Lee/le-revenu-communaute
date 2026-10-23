import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { DiscussionFeed } from '@/components/discussions/DiscussionFeed';
import { MainColumn } from '@/components/layout/PageColumns';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorBadges } from '@/components/ui/AuthorBadges';
import { DiscussionListSkeleton, FeedToolbarSkeleton } from '@/components/ui/Skeletons';
import { formatDate, formatNumber } from '@/lib/format';
import { getMember } from '@/lib/strapi/queries';

type Props = PageProps<'/membres/[username]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const member = await getMember(decodeURIComponent((await params).username));
  return { title: member ? member.displayName : 'Membre introuvable' };
}

/** Profil public d'un membre et ses discussions. */
export default async function MemberPage({ params, searchParams }: Props) {
  const username = decodeURIComponent((await params).username);
  const member = await getMember(username);
  if (!member) notFound();

  return (
    <MainColumn wide>
      <section className="flex flex-wrap items-center gap-5 rounded-card border border-hairline bg-surface p-[22px] shadow-card">
        <Avatar author={member} size="lg" />
        <div className="min-w-[220px] flex-1">
          <h1 className="font-display text-[28px] font-bold tracking-[-0.01em]">{member.displayName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[13.5px] text-ink-3">
            <span>@{member.username}</span>
            <span>· Membre depuis le {formatDate(member.memberSince)}</span>
            <AuthorBadges author={member} />
          </div>
          {member.expertTitle && <p className="mt-2 text-[13.5px] font-semibold text-pro">{member.expertTitle}</p>}
          {member.bio && <p className="mt-2.5 max-w-[60ch] text-ink-2">{member.bio}</p>}
        </div>
        <dl className="flex gap-2.5">
          {[
            ['Discussions', member.stats.discussions],
            ['Réponses', member.stats.replies],
          ].map(([label, value]) => (
            <div key={label} className="min-w-24 rounded-card border border-hairline bg-surface p-3.5 text-center shadow-card">
              <dd className="text-[22px] font-semibold tabular-nums">{formatNumber(Number(value))}</dd>
              <dt className="text-[12.5px] text-ink-3">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <h2 className="font-display text-[21px] font-bold tracking-[-0.01em]">Discussions lancées</h2>
      <Suspense
        fallback={
          <>
            <FeedToolbarSkeleton />
            <DiscussionListSkeleton rows={3} />
          </>
        }
      >
        <DiscussionFeed
          searchParams={searchParams}
          basePath={`/membres/${encodeURIComponent(member.username)}`}
          scope={{ author: member.username }}
        />
      </Suspense>
    </MainColumn>
  );
}
