import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { type DemoAccount, LoginForm } from '@/components/auth/LoginForm';
import { MainColumn } from '@/components/layout/PageColumns';
import { safeRedirectPath } from '@/lib/actions/action-utils';
import { getCurrentUser } from '@/lib/session';

export const metadata: Metadata = { title: 'Connexion', robots: { index: false } };

/** Comptes de démonstration créés par le seed Strapi (désactivables avec DEMO_MODE=false). */
const DEMO_ACCOUNTS: DemoAccount[] = [
  { username: 'Camille_B', label: 'Camille (membre)' },
  { username: 'Thomas_PEA', label: 'Thomas (membre)' },
  { username: 'LaRedaction', label: 'La rédaction' },
];

export default function LoginPage({ searchParams }: PageProps<'/connexion'>) {
  return (
    <MainColumn wide className="mx-auto w-full max-w-[440px]">
      <div className="overflow-hidden rounded-2xl bg-surface shadow-pop">
        <div className="px-4 pt-[18px] md:px-[22px]">
          <h1 className="font-display text-[23px] font-bold tracking-[-0.01em]">Rejoindre la communauté</h1>
        </div>
        <div className="px-4 pt-4 pb-[22px] md:px-[22px]">
          <Suspense fallback={<div aria-hidden className="skeleton h-[380px]" />}>
            <Login searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </MainColumn>
  );
}

async function Login({ searchParams }: Pick<PageProps<'/connexion'>, 'searchParams'>) {
  const { next } = await searchParams;
  const target = safeRedirectPath(typeof next === 'string' ? next : '/');
  if (await getCurrentUser()) redirect(target);

  const demoMode = process.env.DEMO_MODE !== 'false';
  return (
    <LoginForm
      next={target}
      demoAccounts={demoMode ? DEMO_ACCOUNTS : []}
      demoPassword={demoMode ? process.env.DEMO_USER_PASSWORD : undefined}
    />
  );
}
