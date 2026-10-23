import { CircleQuestionMark, MessageCircle, User } from 'lucide-react';
import Link from 'next/link';

/** Point d'entrée unique pour publier, toujours visible en haut du fil (maquette : « composer »). */
export function QuickComposer({ category }: { category?: string }) {
  const href = (type: 'question' | 'discussion') =>
    `/publier?type=${type}${category ? `&espace=${encodeURIComponent(category)}` : ''}`;

  return (
    <div className="flex w-full items-center gap-3 rounded-card border border-hairline bg-surface px-3 py-2.5 shadow-card">
      <span aria-hidden className="avatar size-10 text-sm" style={{ '--c': 'var(--ink-3)' } as React.CSSProperties}>
        <User className="size-[18px]" />
      </span>
      <Link
        href={href('question')}
        className="min-w-0 flex-1 truncate rounded-control bg-fill px-3.5 py-[9px] text-ink-3 hover:bg-fill-2"
      >
        Posez votre question à la communauté…
      </Link>
      <div className="hidden gap-1 md:flex">
        <Link href={href('question')} className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-[7px] text-[13.5px] font-medium text-ink-2 hover:bg-fill">
          <CircleQuestionMark className="size-[18px]" aria-hidden /> Question
        </Link>
        <Link href={href('discussion')} className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-[7px] text-[13.5px] font-medium text-ink-2 hover:bg-fill">
          <MessageCircle className="size-[18px]" aria-hidden /> Discussion
        </Link>
      </div>
    </div>
  );
}
