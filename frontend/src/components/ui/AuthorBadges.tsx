import { BadgeCheck, Check, Shield } from 'lucide-react';
import type { Author } from '@/lib/strapi/types';
import { Tag } from './Tag';

/** Étiquettes de statut d'un membre : rédaction, modération, expert vérifié, abonné. */
export function AuthorBadges({ author }: { author: Pick<Author, 'memberType' | 'isSubscriber'> }) {
  if (author.memberType === 'redaction') return <Tag variant="redac" icon={Check}>Rédaction</Tag>;
  if (author.memberType === 'moderator') return <Tag icon={Shield}>Modération</Tag>;
  return (
    <>
      {author.memberType === 'expert' && (
        <Tag variant="pro" icon={BadgeCheck}>
          Expertise vérifiée
        </Tag>
      )}
      {author.isSubscriber && <Tag variant="sub">Abonné</Tag>}
    </>
  );
}
