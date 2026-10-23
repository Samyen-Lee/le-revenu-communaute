'use client';

import { Check, LoaderCircle } from 'lucide-react';
import { useActionState, useState } from 'react';
import { type LoginField, loginAction } from '@/lib/actions/auth';
import { type FormState, idleState } from '@/lib/actions/form-state';

export type DemoAccount = { username: string; label: string };

/** Connexion avec un compte Users & Permissions (comptes de démonstration proposés en un clic). */
export function LoginForm({ next, demoAccounts, demoPassword }: { next: string; demoAccounts: DemoAccount[]; demoPassword?: string }) {
  const [state, formAction, pending] = useActionState<FormState<LoginField>, FormData>(loginAction, idleState);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />

      <ul className="flex flex-col gap-[7px] text-sm text-ink-2">
        {['Posez vos questions d’argent aux lecteurs et à la rédaction', 'Répondez et partagez votre expérience'].map((benefit) => (
          <li key={benefit} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden />
            {benefit}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 rounded-sm border border-line bg-surface-2 px-3.5 py-3">
        <span aria-hidden className="grid size-[38px] shrink-0 place-items-center rounded-[9px] bg-rev-red text-xl font-black text-white">
          R
        </span>
        <div>
          <b>Votre compte lerevenu.com</b>
          <small className="block text-[12.5px] text-ink-3">Le même identifiant que pour le site et le magazine</small>
        </div>
      </div>

      {state.status === 'error' && state.message && (
        <p role="alert" className="rounded-sm bg-alert-soft px-3.5 py-2.5 text-sm text-ink">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="identifier" className="text-sm font-semibold">
          Pseudo ou adresse e-mail
        </label>
        <input
          id="identifier"
          name="identifier"
          autoComplete="username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          aria-invalid={Boolean(state.fieldErrors?.identifier)}
          className="field-input h-10"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          className="field-input h-10"
        />
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        {pending ? 'Connexion…' : 'Continuer'}
      </button>

      {demoAccounts.length > 0 && (
        <div className="rounded-sm border border-dashed border-line-strong px-3.5 py-3">
          <p className="mb-2 text-[12.5px] font-semibold text-ink-3">Comptes de démonstration</p>
          <div className="flex flex-wrap gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.username}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setIdentifier(account.username);
                  if (demoPassword) setPassword(demoPassword);
                }}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
