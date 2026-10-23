'use client';

import { useSyncExternalStore } from 'react';
import { formatDate, formatDateTime, formatRelative } from '@/lib/format';

/*
 * « il y a 3 h » dépend de l'heure de consultation : ce texte n'est calculé que dans le navigateur.
 * Le serveur (et le cache Next.js) rendent une date absolue stable, remplacée après hydratation,
 * puis rafraîchie chaque minute.
 */
const subscribe = (onChange: () => void) => {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
};
const getMinute = () => Math.floor(Date.now() / 60_000) * 60_000;
const getServerMinute = () => null;

export function RelativeTime({ date, prefix }: { date: string; prefix?: string }) {
  const now = useSyncExternalStore(subscribe, getMinute, getServerMinute);
  const label = now === null ? `le ${formatDate(date)}` : formatRelative(date, now);
  return (
    <time dateTime={date} title={formatDateTime(date)}>
      {prefix ? `${prefix} ${label}` : label}
    </time>
  );
}
