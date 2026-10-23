import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const VARIANTS = {
  neutral: 'bg-fill text-ink-2',
  ok: 'bg-ok-soft text-ok',
  redac: 'bg-redac text-surface',
  sub: 'bg-sub text-sub-ink',
  pro: 'bg-[color-mix(in_srgb,var(--pro)_13%,transparent)] text-pro',
  brand: 'bg-brand text-brand-ink',
  alert: 'bg-alert-soft text-alert',
} as const;

export function Tag({
  variant = 'neutral',
  icon: Icon,
  children,
  className,
}: {
  variant?: keyof typeof VARIANTS;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-px text-[11.5px] font-semibold whitespace-nowrap',
        VARIANTS[variant],
        className,
      )}
    >
      {Icon && <Icon className="size-3" aria-hidden strokeWidth={2.4} />}
      {children}
    </span>
  );
}
