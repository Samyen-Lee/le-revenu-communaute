import { Plus } from 'lucide-react';
import Link from 'next/link';
import { SpaceIcon } from '@/components/categories/SpaceIcon';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardTitle } from '@/components/ui/Card';
import { RelativeTime } from '@/components/ui/RelativeTime';
import type { Author, Category, Discussion } from '@/lib/strapi/types';

/** « Soyez le premier à aider » : affichée tant que la discussion n'a aucune réponse. */
export function HelpCard({ discussion }: { discussion: Discussion }) {
  return (
    <Card className="border-transparent bg-surface-3">
      <h3 className="mb-1 text-[15.5px] font-semibold">Soyez le premier à aider {discussion.author?.displayName}</h3>
      <p className="mb-3 text-[13.5px] text-ink-2">Une question sans réponse : votre expérience compte, même partielle.</p>
      <a href="#reply-content" className="btn btn-primary btn-sm">
        Répondre
      </a>
    </Card>
  );
}

export function DiscussionFacts({
  discussion,
  participants,
}: {
  discussion: Discussion;
  participants: Author[];
}) {
  return (
    <Card>
      <CardTitle>Cette discussion</CardTitle>
      <dl className="grid grid-cols-2 gap-x-2.5 gap-y-3">
        <div>
          <dt className="text-xs text-ink-3">Réponses</dt>
          <dd className="text-base font-semibold tabular-nums">{discussion.repliesCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-3">Participants</dt>
          <dd className="text-base font-semibold tabular-nums">{participants.length}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-ink-3">Dernière activité</dt>
          <dd className="text-[13.5px] font-semibold">
            <RelativeTime date={discussion.lastActivityAt} />
          </dd>
        </div>
      </dl>
      <div className="mt-3.5">
        <small className="text-ink-3">Participants</small>
        <div className="mt-1.5 flex">
          {participants.slice(0, 8).map((author) => (
            <span key={author.documentId} className="-ml-[7px] rounded-full border-2 border-surface first:ml-0">
              <Avatar author={author} size="sm" />
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Card>
      <h3 className="flex items-center gap-2 font-display text-lg font-bold tracking-[-0.01em]">
        <SpaceIcon category={category} />
        {category.name}
      </h3>
      {category.description && <p className="mt-1.5 mb-3 text-sm text-ink-2">{category.description}</p>}
      <Link href={`/publier?espace=${category.slug}`} className="btn btn-secondary btn-sm">
        <Plus className="size-4" aria-hidden />
        Publier dans cet espace
      </Link>
    </Card>
  );
}
