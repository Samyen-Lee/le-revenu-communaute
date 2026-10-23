import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { SideNav } from '@/components/layout/SideNav';
import { SiteBar } from '@/components/layout/SiteBar';
import { getCurrentUser } from '@/lib/session';
import './globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-playfair' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Communauté Le Revenu', template: '%s · Communauté Le Revenu' },
  description:
    'Posez vos questions d’argent, partagez vos expériences et échangez avec la rédaction du Revenu : Bourse, épargne, impôts, retraite, transmission.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#161618' },
  ],
};

async function MobileNav() {
  const user = await getCurrentUser();
  return <BottomNav username={user?.username ?? null} />;
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2"
        >
          Aller au contenu
        </a>
        <SiteBar />
        <Header />
        <div className="mx-auto max-w-[1260px] px-4">
          <div className="grid grid-cols-1 items-start gap-7 pt-4 pb-[100px] md:grid-cols-[200px_minmax(0,1fr)] md:pt-6 md:pb-24 wide:grid-cols-[212px_minmax(0,1fr)_304px]">
            <SideNav />
            {children}
          </div>
        </div>
        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>
      </body>
    </html>
  );
}
