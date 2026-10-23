import { ArrowLeft, Book } from 'lucide-react';

export const SITE_URL = 'https://www.lerevenu.com';
const SITE_SECTIONS = ['Bourse', 'Économie', 'Placements', 'Immobilier', 'Impôts', 'Succession', 'Vie pratique'];

/** Barre de liaison avec lerevenu.com (non collante : l'en-tête reste seul en haut au défilement). */
export function SiteBar() {
  return (
    <div className="border-b border-hairline bg-surface text-[13px] text-ink-2">
      <div className="mx-auto flex h-[38px] max-w-[1260px] items-center gap-5 px-4">
        <a href={SITE_URL} className="inline-flex items-center gap-1.5 font-semibold whitespace-nowrap text-ink hover:text-brand-text">
          <ArrowLeft className="size-[15px]" aria-hidden />
          Retour sur lerevenu.com
        </a>
        <nav aria-label="Rubriques de lerevenu.com" className="hidden min-w-0 gap-4 overflow-hidden border-l border-line pl-5 links:flex">
          {SITE_SECTIONS.map((section) => (
            <a key={section} href={SITE_URL} className="whitespace-nowrap hover:text-brand-text">
              {section}
            </a>
          ))}
        </nav>
        <span className="ml-auto flex items-center gap-4">
          <a href={SITE_URL} className="hidden items-center gap-1.5 whitespace-nowrap hover:text-brand-text md:inline-flex">
            <Book className="size-[15px]" aria-hidden />
            Le magazine
          </a>
          <a href={SITE_URL} className="rounded-full bg-brand px-[11px] py-[3px] font-semibold whitespace-nowrap text-white hover:brightness-95">
            S’abonner
          </a>
        </span>
      </div>
    </div>
  );
}
