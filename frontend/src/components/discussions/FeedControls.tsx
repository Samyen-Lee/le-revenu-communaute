'use client';

import { LayoutList, List, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/cn';
import { FEED_SORTS, type FeedSort } from '@/lib/feed-params';
import type { Density } from './DiscussionList';

/** Tri du fil : met à jour l'URL (?tri=…) ; le serveur relit les paramètres et refait la requête. */
export function SortSelect({ value, hrefs }: { value: FeedSort; hrefs: Record<FeedSort, string> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="relative inline-flex items-center gap-2 text-[13px] text-ink-3">
      <span className="hidden sm:inline">Trier</span>
      <select
        value={value}
        aria-label="Trier les discussions"
        onChange={(event) => {
          const next = event.target.value as FeedSort;
          startTransition(() => router.push(hrefs[next], { scroll: false }));
        }}
        className="h-9 rounded-control border border-hairline bg-surface pr-8 pl-3 text-[13.5px] font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,.05)]"
      >
        {FEED_SORTS.map((sort) => (
          <option key={sort.value} value={sort.value}>
            {sort.label}
          </option>
        ))}
      </select>
      {pending && <LoaderCircle className="absolute right-2 size-4 animate-spin text-ink-3" aria-label="Chargement" />}
    </label>
  );
}

/** Vue détaillée / compacte (préférence de l'appareil, stockée en cookie). */
export function DensityToggle({ value }: { value: Density }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const choose = (density: Density) => {
    document.cookie = `lr_density=${density}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  };

  const button = (density: Density, label: string, Icon: typeof List) => (
    <button
      type="button"
      onClick={() => choose(density)}
      aria-pressed={value === density}
      aria-label={label}
      title={label}
      className={cn(
        'grid h-[30px] w-[34px] place-items-center rounded-lg transition',
        value === density ? 'bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,.12)]' : 'text-ink-3 hover:text-ink',
      )}
    >
      <Icon className="size-[17px]" aria-hidden />
    </button>
  );

  return (
    <div role="group" aria-label="Affichage de la liste" className="inline-flex shrink-0 gap-0.5 rounded-control bg-fill p-[3px]">
      {button('comfy', 'Vue détaillée', LayoutList)}
      {button('compact', 'Vue compacte', List)}
    </div>
  );
}
