import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { NewDiscussionForm } from '@/components/discussions/NewDiscussionForm';
import { MainColumn } from '@/components/layout/PageColumns';
import { getCurrentUser } from '@/lib/session';
import { getCategories } from '@/lib/strapi/queries';

export const metadata: Metadata = { title: 'Nouvelle publication', robots: { index: false } };

/** Publication d'une discussion, réservée aux membres connectés (vérifié ici et par Strapi). */
export default function PublishPage({ searchParams }: PageProps<'/publier'>) {
  return (
    <MainColumn wide className="mx-auto w-full max-w-[680px]">
      <Suspense fallback={<div aria-hidden className="skeleton h-[560px] rounded-2xl" />}>
        <PublishForm searchParams={searchParams} />
      </Suspense>
    </MainColumn>
  );
}

async function PublishForm({ searchParams }: Pick<PageProps<'/publier'>, 'searchParams'>) {
  const user = await getCurrentUser();
  if (!user) redirect('/connexion?next=/publier');

  const [{ type, espace }, categories] = await Promise.all([searchParams, getCategories()]);
  const initialCategory = categories.some((category) => category.slug === espace) ? String(espace) : '';

  return (
    <NewDiscussionForm
      categories={categories}
      initialType={type === 'discussion' ? 'discussion' : 'question'}
      initialCategory={initialCategory}
    />
  );
}
