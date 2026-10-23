import Link from 'next/link';
import { MainColumn } from '@/components/layout/PageColumns';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <MainColumn wide>
      <div className="rounded-card border border-hairline bg-surface shadow-card">
        <EmptyState
          title="Page introuvable"
          action={
            <Link href="/" className="btn btn-primary">
              Retour à l’accueil
            </Link>
          }
        >
          Cette discussion a peut-être été supprimée, ou l’adresse est incorrecte.
        </EmptyState>
      </div>
    </MainColumn>
  );
}
