import Link from 'next/link';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorBadges } from '@/components/ui/AuthorBadges';
import type { Author } from '@/lib/strapi/types';

/** Auteur d'un message : avatar, nom (lien vers le profil), statut, puis une ligne secondaire. */
export function AuthorLine({ author, size = 'sm', children }: { author: Author | null; size?: 'sm' | 'md'; children: ReactNode }) {
  return (
    <div className="flex items-center gap-[11px]">
      <Avatar author={author} size={size} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-[7px] font-semibold">
          {author ? (
            <Link href={`/membres/${encodeURIComponent(author.username)}`} className="hover:text-brand-text">
              {author.displayName}
            </Link>
          ) : (
            <span>Membre supprimé</span>
          )}
          {author?.memberType === 'expert' && author.expertTitle && (
            <span className="text-[12.5px] font-medium text-pro">{author.expertTitle}</span>
          )}
          {author && <AuthorBadges author={author} />}
        </div>
        <div className="text-[12.5px] text-ink-3">{children}</div>
      </div>
    </div>
  );
}
