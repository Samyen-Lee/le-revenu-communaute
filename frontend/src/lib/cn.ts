/** Concatène des classes en ignorant les valeurs falsy. */
export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');
