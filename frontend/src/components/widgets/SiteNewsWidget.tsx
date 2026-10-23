import { ExternalLink, Newspaper } from 'lucide-react';
import { SITE_URL } from '@/components/layout/SiteBar';
import { Card, CardTitle } from '@/components/ui/Card';

/*
 * Pont vers le site éditorial, repris de la maquette. Contenu statique ici : en production,
 * il viendrait du flux des articles de lerevenu.com, pas de la communauté.
 */
const HEADLINES = [
  { kicker: 'Diversifier vos placements', title: 'Fonds euros : les rendements servis par les assureurs', premium: true },
  { kicker: 'Réussir en Bourse', title: 'Les valeurs à surveiller cette semaine', premium: true },
  { kicker: 'Réduire vos impôts', title: 'Déclaration de revenus : les cases à ne pas oublier', premium: false },
];

export function SiteNewsWidget() {
  return (
    <Card>
      <CardTitle>
        <Newspaper aria-hidden />À la une sur lerevenu.com
      </CardTitle>
      <ul className="flex flex-col">
        {HEADLINES.map((headline) => (
          <li key={headline.title} className="border-t border-line py-3 first:border-t-0 first:pt-0">
            <a href={SITE_URL} className="group block">
              <span className="mb-0.5 block text-xs font-semibold text-brand-text">{headline.kicker}</span>
              <b className="text-[14.5px] font-semibold group-hover:text-brand-text">
                {headline.premium && (
                  <span
                    title="Réservé aux abonnés"
                    className="mr-1.5 inline-grid size-4 place-items-center rounded bg-sub align-[1px] text-[10px] font-extrabold text-sub-ink"
                  >
                    R
                  </span>
                )}
                {headline.title}
              </b>
            </a>
          </li>
        ))}
      </ul>
      <a href={SITE_URL} className="btn btn-secondary btn-sm mt-3 w-full">
        Aller sur lerevenu.com <ExternalLink className="size-4" aria-hidden />
      </a>
    </Card>
  );
}
