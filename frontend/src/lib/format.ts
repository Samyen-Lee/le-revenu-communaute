/**
 * Formatage des dates et des nombres. Le fuseau est fixé pour que le rendu serveur et le rendu
 * navigateur produisent exactement le même texte (pas d'écart d'hydratation).
 */
const TIME_ZONE = 'Europe/Paris';

const absoluteDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TIME_ZONE });
const absoluteDateTime = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: TIME_ZONE,
});
const numberFormat = new Intl.NumberFormat('fr-FR');

export const formatDate = (iso: string) => absoluteDate.format(new Date(iso));
export const formatDateTime = (iso: string) => absoluteDateTime.format(new Date(iso));
export const formatNumber = (value: number) => numberFormat.format(value);

/** « à l'instant », « il y a 5 min », « il y a 3 h », « hier », « il y a 4 j », puis la date. */
export function formatRelative(iso: string, now: number) {
  const minutes = (now - new Date(iso).getTime()) / 60_000;
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${Math.round(minutes)} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days} j`;
  return `le ${formatDate(iso)}`;
}

export const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${formatNumber(count)} ${count > 1 ? pluralForm : singular}`;
