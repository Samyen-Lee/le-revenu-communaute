/** État renvoyé par les Server Actions aux formulaires (useActionState). Importable côté client. */
export type FormState<Field extends string = string> = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Partial<Record<Field, string>>;
  /** Horodatage du dernier succès, pour réinitialiser un formulaire */
  submittedAt?: number;
};

export const idleState: FormState<never> = { status: 'idle' };
