import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { DiscussionSummary } from '@/lib/strapi/types';
import { DiscussionCard } from './DiscussionCard';
import { DiscussionRow, rowGrid } from './DiscussionRow';

export type Density = 'comfy' | 'compact';

const feedClass = 'overflow-hidden rounded-card border border-hairline bg-surface shadow-card';

/** Liste de discussions avec son état vide ; la densité est un choix d'affichage du lecteur. */
export function DiscussionList({
  discussions,
  density = 'comfy',
  empty,
}: {
  discussions: DiscussionSummary[];
  density?: Density;
  empty: ReactNode;
}) {
  if (discussions.length === 0) return <div className={feedClass}>{empty}</div>;

  if (density === 'compact') {
    return (
      <div className={feedClass}>
        <div className={cn(rowGrid, 'bg-surface-2 py-2 text-[11.5px] font-semibold text-ink-3')}>
          <span>Discussion</span>
          <span className="text-right">Réponses</span>
          <span className="text-right">Activité</span>
        </div>
        {discussions.map((discussion) => (
          <DiscussionRow key={discussion.documentId} discussion={discussion} />
        ))}
      </div>
    );
  }

  return (
    <div className={feedClass}>
      {discussions.map((discussion) => (
        <DiscussionCard key={discussion.documentId} discussion={discussion} />
      ))}
    </div>
  );
}
