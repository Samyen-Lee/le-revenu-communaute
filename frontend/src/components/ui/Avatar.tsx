import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import type { Author } from '@/lib/strapi/types';

const SIZES = {
  xs: 'size-[22px] text-[9.5px]',
  sm: 'size-[30px] text-[11.5px]',
  md: 'size-10 text-sm',
  lg: 'size-14 text-xl',
} as const;

type AvatarAuthor = Pick<Author, 'displayName' | 'avatarColor' | 'memberType'>;

export function initials(author: AvatarAuthor) {
  if (author.memberType === 'redaction') return 'R';
  return author.displayName
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Monogramme coloré ; la rédaction a une tuile carrée, les experts une pastille « vérifié ». */
export function Avatar({ author, size = 'sm' }: { author: AvatarAuthor | null; size?: keyof typeof SIZES }) {
  const shown = author ?? { displayName: '?', avatarColor: '#8e8e93', memberType: 'member' as const };
  const label = initials(shown);
  return (
    <span
      aria-hidden
      title={shown.displayName}
      style={{ '--c': shown.avatarColor ?? '#6e6e73' } as CSSProperties}
      className={cn(
        'avatar',
        SIZES[size],
        shown.memberType === 'redaction' && 'rounded-[28%] font-display font-black',
        shown.memberType === 'expert' && (size === 'md' || size === 'lg') && 'avatar-verified',
      )}
    >
      {size === 'xs' ? label[0] : label}
    </span>
  );
}
