'use client';

import { LoaderCircle } from 'lucide-react';
import { useActionState, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { createReplyAction } from '@/lib/actions/discussions';
import { type FormState, idleState } from '@/lib/actions/form-state';
import { REPLY_RULES, validateReply } from '@/lib/validation';
import type { SessionUser } from '@/lib/strapi/types';

/**
 * Formulaire de réponse : Client Component pour le retour immédiat (validation, état d'envoi).
 * L'envoi passe par une Server Action ; Strapi reste seul juge de la validité et de l'auteur.
 */
export function ReplyForm({
  discussionDocumentId,
  user,
  placeholder,
}: {
  discussionDocumentId: string;
  user: SessionUser;
  placeholder: string;
}) {
  const [state, formAction, pending] = useActionState<FormState<'content'>, FormData>(
    createReplyAction.bind(null, discussionDocumentId),
    idleState,
  );
  const [content, setContent] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  // Après une publication réussie, on vide le champ (une seule fois par succès).
  const [handledSuccess, setHandledSuccess] = useState(state.submittedAt);
  if (state.submittedAt !== handledSuccess) {
    setHandledSuccess(state.submittedAt);
    setContent('');
  }

  const error = clientError ?? state.fieldErrors?.content ?? (state.status === 'error' ? state.message : undefined);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const message = validateReply(content);
        setClientError(message);
        if (message) event.preventDefault();
      }}
      className="flex flex-col gap-2.5 rounded-card border border-hairline bg-surface px-4 py-4 shadow-card md:px-[22px] md:py-5"
      noValidate
    >
      <div className="flex items-center gap-[11px]">
        <Avatar author={user} size="sm" />
        <span className="text-[12.5px] text-ink-3">
          Répondre en tant que <b className="text-ink">{user.displayName}</b>
        </span>
      </div>
      <label htmlFor="reply-content" className="sr-only">
        Votre réponse
      </label>
      <textarea
        id="reply-content"
        name="content"
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          if (clientError) setClientError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) event.currentTarget.form?.requestSubmit();
        }}
        placeholder={placeholder}
        maxLength={REPLY_RULES.contentMax}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'reply-error' : 'reply-hint'}
        className="field-input min-h-[110px] resize-y px-3.5 py-3 leading-normal"
      />
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {error ? (
          <p id="reply-error" role="alert" className="text-[13px] text-alert">
            {error}
          </p>
        ) : (
          <p id="reply-hint" aria-live="polite" className="text-[12.5px] text-ink-3">
            {state.status === 'success' ? state.message : 'Ctrl + Entrée pour publier'}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {pending ? 'Publication…' : 'Publier ma réponse'}
        </button>
      </div>
    </form>
  );
}
