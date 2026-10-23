import Link from 'next/link';

/** Logo reconstitué d'après la maquette (à remplacer par le SVG officiel). */
export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Le Revenu, accueil de la communauté"
      className="flex shrink-0 flex-col items-start gap-1 md:flex-row md:items-center md:gap-2.5"
    >
      <span aria-hidden className="inline-flex items-stretch bg-rev-red p-[.1em] text-[19px] md:text-[22px]">
        <span className="mr-[.12em] bg-rev-black px-[.1em] pt-[.1em] pb-[.12em] leading-none font-black tracking-[-0.02em] text-white">
          LE
        </span>
        <span className="px-[.1em] pt-[.1em] pb-[.12em] leading-none font-black tracking-[-0.02em] text-white">REVENU</span>
      </span>
      <span aria-hidden className="hidden h-5 w-px bg-line-strong md:block" />
      <span className="text-xs font-semibold text-ink-2 md:text-[15px]">Communauté</span>
    </Link>
  );
}
