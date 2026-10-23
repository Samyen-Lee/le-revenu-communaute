'use client';

/** Dernier filet de sécurité si le layout racine lui-même échoue (ex. : espaces illisibles). */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 32, textAlign: 'center' }}>
        <h1>La communauté du Revenu est momentanément indisponible</h1>
        <p>Nous n’avons pas pu joindre le service. Réessayez dans un instant.</p>
        <button type="button" onClick={() => retry()} style={{ marginTop: 16, padding: '8px 16px' }}>
          Réessayer
        </button>
      </body>
    </html>
  );
}
