import Link from 'next/link';
import { LoginLink } from '@/components/layout/LoginLink';
import { getCurrentUser } from '@/lib/session';

/** Bandeau d'accueil : présentation pour un visiteur, salutation pour un membre connecté. */
export async function Welcome() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[26px] font-bold tracking-[-0.01em]">Bonjour {user.displayName}</h1>
      </div>
    );
  }

  return (
    <section className="hero relative grid grid-cols-1 items-end gap-x-6 gap-y-[18px] overflow-hidden rounded-2xl px-5 py-[22px] text-white shadow-pop md:grid-cols-[minmax(0,1fr)_auto] md:rounded-[18px] md:px-7 md:pt-7 md:pb-6">
      <div>
        <h1 className="max-w-[22ch] font-display text-[25px] leading-[1.12] font-bold tracking-[-0.01em] md:text-[32px]">
          La communauté des lecteurs du Revenu
        </h1>
        <p className="mt-2 max-w-[52ch] text-white/80">
          Posez vos questions d’argent, partagez vos expériences et échangez avec la rédaction. Bourse, épargne, impôts,
          retraite, transmission.
        </p>
      </div>
      <div className="flex flex-row flex-wrap gap-2 md:flex-col">
        <LoginLink className="btn btn-primary hover:brightness-110">Rejoindre gratuitement</LoginLink>
        <Link
          href="/espaces"
          className="btn border-white/20 bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
        >
          Explorer les espaces
        </Link>
      </div>
    </section>
  );
}

export function WelcomeSkeleton() {
  return <div aria-hidden className="skeleton h-[180px] rounded-[18px]" />;
}
