import { LoginLink } from '@/components/layout/LoginLink';
import { getCurrentUser } from '@/lib/session';
import type { Discussion } from '@/lib/strapi/types';
import { ReplyForm } from './ReplyForm';

/** Zone de réponse : formulaire pour un membre connecté, invitation à se connecter sinon. */
export async function ReplyBox({ discussion }: { discussion: Discussion }) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-2.5 rounded-card border border-hairline bg-surface px-5 py-[26px] text-center shadow-card">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.01em]">Vous avez un avis ou une expérience à partager ?</h3>
        <p className="text-ink-3">Rejoignez la communauté avec votre compte lerevenu.com.</p>
        <LoginLink className="btn btn-primary">Se connecter pour répondre</LoginLink>
      </div>
    );
  }

  const placeholder =
    discussion.type === 'question'
      ? `Partagez votre expérience pour aider ${discussion.author?.displayName ?? 'ce membre'}…`
      : 'Votre avis sur la question…';
  return <ReplyForm discussionDocumentId={discussion.documentId} user={user} placeholder={placeholder} />;
}

export function ReplyBoxSkeleton() {
  return <div aria-hidden className="skeleton h-[170px] rounded-card" />;
}
