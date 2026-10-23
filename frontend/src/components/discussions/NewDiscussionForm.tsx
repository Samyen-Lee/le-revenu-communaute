'use client';

import { CircleQuestionMark, LoaderCircle, type LucideIcon, MessageCircle, Shield } from 'lucide-react';
import { type ReactNode, useActionState, useState } from 'react';
import { createDiscussionAction, type DiscussionField } from '@/lib/actions/discussions';
import { type FormState, idleState } from '@/lib/actions/form-state';
import { cn } from '@/lib/cn';
import type { Category, DiscussionType } from '@/lib/strapi/types';
import { DISCUSSION_RULES, type DiscussionFormValues, type FieldErrors, validateDiscussionForm } from '@/lib/validation';

const TYPES: { value: DiscussionType; icon: LucideIcon; label: string; hint: string; placeholder: string }[] = [
  {
    value: 'question',
    icon: CircleQuestionMark,
    label: 'Poser une question',
    hint: 'Obtenez l’aide des membres et de la rédaction',
    placeholder: 'Ex. : Faut-il ouvrir un PER à 45 ans ?',
  },
  {
    value: 'discussion',
    icon: MessageCircle,
    label: 'Lancer une discussion',
    hint: 'Partagez une expérience, un avis, une actualité',
    placeholder: 'Ex. : Mon retour d’expérience sur la renégociation de mon crédit',
  },
];

function Field({ id, label, error, hint, children }: { id: string; label: ReactNode; error?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[13px] text-alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-[12.5px] text-ink-3">{hint}</p>
      )}
    </div>
  );
}

/**
 * Formulaire de publication. Les contrôles ici ne servent qu'au confort de saisie ; la Server Action
 * transmet à Strapi qui revalide tout et renvoie ses erreurs par champ, affichées au même endroit.
 * En cas de succès, la Server Action redirige vers la nouvelle discussion.
 */
export function NewDiscussionForm({
  categories,
  initialType,
  initialCategory,
}: {
  categories: Category[];
  initialType: DiscussionType;
  initialCategory: string;
}) {
  const [state, formAction, pending] = useActionState<FormState<DiscussionField>, FormData>(
    createDiscussionAction,
    idleState,
  );
  const [values, setValues] = useState<DiscussionFormValues>({
    title: '',
    content: '',
    type: initialType,
    category: initialCategory,
  });
  const [clientErrors, setClientErrors] = useState<FieldErrors<DiscussionFormValues>>({});
  // Une erreur renvoyée par Strapi disparaît dès que le champ concerné est modifié.
  const [editedSinceSubmit, setEditedSinceSubmit] = useState<Set<DiscussionField>>(new Set());

  const errorFor = (field: DiscussionField) =>
    clientErrors[field] ?? (editedSinceSubmit.has(field) ? undefined : state.fieldErrors?.[field]);

  const update = (field: DiscussionField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setClientErrors((current) => ({ ...current, [field]: undefined }));
    setEditedSinceSubmit((current) => new Set(current).add(field));
  };

  const currentType = TYPES.find((type) => type.value === values.type) ?? TYPES[0];
  const titleLength = values.title.trim().length;

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(event) => {
        const errors = validateDiscussionForm(values);
        setClientErrors(errors);
        setEditedSinceSubmit(new Set());
        if (Object.keys(errors).length > 0) event.preventDefault();
      }}
      className="overflow-hidden rounded-2xl bg-surface shadow-pop"
    >
      <div className="flex flex-col gap-4 px-4 pt-[18px] pb-[22px] md:px-[22px]">
        <h1 className="font-display text-[23px] font-bold tracking-[-0.01em]">Nouvelle publication</h1>

        {state.status === 'error' && state.message && (
          <p role="alert" className="rounded-sm bg-alert-soft px-3.5 py-2.5 text-sm text-ink">
            {state.message}
          </p>
        )}

        <fieldset>
          <legend className="sr-only">Type de publication</legend>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {TYPES.map(({ value, icon: Icon, label, hint }) => (
              <label
                key={value}
                className={cn(
                  'relative flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] px-3 py-[11px] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand md:flex-col md:items-start md:gap-1 md:py-3.5',
                  values.type === value ? 'border-brand bg-brand-soft' : 'border-line hover:border-line-strong',
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value={value}
                  checked={values.type === value}
                  onChange={() => update('type', value)}
                  className="absolute opacity-0"
                />
                <Icon className="size-[22px] text-brand-text md:mb-1" aria-hidden />
                <b className="text-[14.5px]">{label}</b>
                <small className="hidden text-[12.5px] leading-[1.35] text-ink-3 md:block">{hint}</small>
              </label>
            ))}
          </div>
          {errorFor('type') && <p className="mt-1.5 text-[13px] text-alert">{errorFor('type')}</p>}
        </fieldset>

        <Field
          id="title"
          label="Titre"
          error={errorFor('title')}
          hint={
            <>
              Un titre clair, formulé comme une question, obtient plus vite des réponses.{' '}
              <span className={cn('tabular-nums', titleLength > 0 && titleLength < DISCUSSION_RULES.titleMin && 'text-alert')}>
                ({titleLength}/{DISCUSSION_RULES.titleMax}, {DISCUSSION_RULES.titleMin} minimum)
              </span>
            </>
          }
        >
          <input
            id="title"
            name="title"
            value={values.title}
            onChange={(event) => update('title', event.target.value)}
            maxLength={DISCUSSION_RULES.titleMax}
            autoComplete="off"
            placeholder={currentType.placeholder}
            aria-invalid={Boolean(errorFor('title'))}
            aria-describedby={errorFor('title') ? 'title-error' : undefined}
            className="field-input h-10"
          />
        </Field>

        <Field id="category" label="Espace" error={errorFor('category')}>
          <select
            id="category"
            name="category"
            value={values.category}
            onChange={(event) => update('category', event.target.value)}
            aria-invalid={Boolean(errorFor('category'))}
            aria-describedby={errorFor('category') ? 'category-error' : undefined}
            className="field-input h-10"
          >
            <option value="">Choisissez un espace…</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="content"
          label="Détails"
          error={errorFor('content')}
          hint="Votre situation, ce que vous avez déjà envisagé… Plus le contexte est précis, meilleures sont les réponses."
        >
          <textarea
            id="content"
            name="content"
            rows={6}
            value={values.content}
            onChange={(event) => update('content', event.target.value)}
            maxLength={DISCUSSION_RULES.contentMax}
            aria-invalid={Boolean(errorFor('content'))}
            aria-describedby={errorFor('content') ? 'content-error' : undefined}
            className="field-input resize-y py-2.5 leading-normal"
          />
        </Field>

        <p className="flex items-start gap-2.5 rounded-sm bg-surface-2 px-3 py-2.5 text-[13px] text-ink-2">
          <Shield className="mt-px size-4 shrink-0 text-ink-3" aria-hidden />
          Partagez votre expérience : pas de conseil personnalisé ni de sollicitation.
        </p>
      </div>

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2.5 border-t border-hairline bg-surface px-4 py-3.5 md:px-[22px]">
        <span className="text-[12.5px] text-ink-3">Tous les champs sont obligatoires.</span>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {pending ? 'Publication…' : 'Publier'}
        </button>
      </div>
    </form>
  );
}
