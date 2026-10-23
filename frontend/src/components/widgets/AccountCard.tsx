import { Check, PenLine } from 'lucide-react';
import Link from 'next/link';
import { LoginLink } from '@/components/layout/LoginLink';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorBadges } from '@/components/ui/AuthorBadges';
import { Card } from '@/components/ui/Card';
import { getCurrentUser } from '@/lib/session';

/** Carte « Rejoignez la communauté » pour un visiteur, carte de profil pour un membre connecté. */
export async function AccountCard() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Card className="join-card">
        <h3 className="mb-1.5 font-display text-[19px] font-bold tracking-[-0.01em]">Rejoignez la communauté</h3>
        <p className="text-sm text-ink-2">Avec votre compte lerevenu.com, gratuitement.</p>
        <ul className="mt-2.5 mb-3.5 flex flex-col gap-1.5 text-sm text-ink-2">
          {[
            'Posez vos questions d’argent à des milliers de lecteurs',
            'Recevez les réponses de la rédaction',
            'Partagez votre expérience avec les autres membres',
          ].map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-text" aria-hidden />
              {benefit}
            </li>
          ))}
        </ul>
        <LoginLink className="btn btn-primary w-full">Rejoindre la communauté</LoginLink>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-3.5 flex items-center gap-3">
        <Avatar author={user} size="md" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{user.displayName}</h3>
          <small className="text-[13px] text-ink-3">@{user.username}</small>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <AuthorBadges author={user} />
      </div>
      {user.bio && <p className="mt-2.5 text-sm text-ink-2">{user.bio}</p>}
      <div className="mt-3.5 flex gap-2">
        <Link href="/publier" className="btn btn-primary btn-sm">
          <PenLine className="size-4" aria-hidden /> Publier
        </Link>
        <Link href={`/membres/${encodeURIComponent(user.username)}`} className="btn btn-secondary btn-sm">
          Mon profil
        </Link>
      </div>
    </Card>
  );
}
