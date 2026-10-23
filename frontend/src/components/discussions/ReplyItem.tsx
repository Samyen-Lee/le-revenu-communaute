import { Check } from 'lucide-react';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { cn } from '@/lib/cn';
import type { Reply } from '@/lib/strapi/types';
import { AuthorLine } from './AuthorLine';
import { Prose } from './Prose';

/** Une réponse ; celles de la rédaction ont un fond et un libellé distincts. */
export function ReplyItem({ reply }: { reply: Reply }) {
  const isRedaction = reply.author?.memberType === 'redaction';
  return (
    <article
      id={`reponse-${reply.documentId}`}
      className={cn(
        'scroll-mt-[90px] rounded-card border px-4 py-4 shadow-card md:px-5',
        isRedaction
          ? 'border-[color-mix(in_srgb,var(--redac)_35%,var(--line))] bg-redac-soft'
          : 'border-hairline bg-surface',
      )}
    >
      {isRedaction && (
        <div className="mb-2.5 inline-flex items-center gap-[5px] text-[12.5px] font-semibold text-redac">
          <Check className="size-3.5" aria-hidden />
          Réponse de la rédaction
        </div>
      )}
      <AuthorLine author={reply.author}>
        <RelativeTime date={reply.createdAt} />
      </AuthorLine>
      <Prose text={reply.content} className="mt-2.5 text-[15px]" />
    </article>
  );
}
