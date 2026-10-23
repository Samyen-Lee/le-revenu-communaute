import { type NextRequest, NextResponse } from 'next/server';

/**
 * Redirection optimiste vers la connexion pour les pages réservées aux membres, sans attendre le
 * rendu : on vérifie seulement la présence du cookie. La validité du jeton est contrôlée par la
 * page (getCurrentUser) puis, de toute façon, par Strapi à chaque écriture.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has('lr_session')) return NextResponse.next();

  const login = new URL('/connexion', request.url);
  login.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = { matcher: ['/publier'] };
