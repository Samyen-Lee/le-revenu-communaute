import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/*
 * La grille (barre latérale | fil | colonne droite) est posée par le layout racine ;
 * chaque page fournit sa colonne principale et, si besoin, sa colonne droite.
 * Sous 1180 px, la colonne droite passe sous le fil ; sous 760 px, tout tient sur une colonne.
 */

export function MainColumn({ wide = false, className, ...props }: ComponentProps<'main'> & { wide?: boolean }) {
  return (
    <main
      id="contenu"
      className={cn('flex min-w-0 flex-col gap-[18px] md:col-start-2', wide && 'wide:col-span-2', className)}
      {...props}
    />
  );
}

export function SideColumn({ className, ...props }: ComponentProps<'aside'>) {
  return <aside className={cn('flex min-w-0 flex-col gap-[18px] md:col-start-2 wide:col-start-3 wide:row-start-1', className)} {...props} />;
}
