'use client';

import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { MainColumn } from '@/components/layout/PageColumns';
import { EmptyState } from '@/components/ui/EmptyState';

/** Erreur inattendue (Strapi injoignable, réponse invalide…) : message clair et nouvelle tentative. */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MainColumn wide>
      <div className="rounded-card border border-hairline bg-surface shadow-card">
        <EmptyState
          title="La communauté est momentanément indisponible"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => retry()} className="btn btn-primary">
                <RefreshCw className="size-4" aria-hidden /> Réessayer
              </button>
              <Link href="/" className="btn btn-secondary">
                Retour à l’accueil
              </Link>
            </div>
          }
        >
          Nous n’avons pas pu charger cette page. Vérifiez votre connexion ou réessayez dans un instant.
        </EmptyState>
      </div>
    </MainColumn>
  );
}
