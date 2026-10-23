import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('rounded-card border border-hairline bg-surface p-[18px] shadow-card', className)} {...props} />;
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink [&>svg]:size-[18px] [&>svg]:text-brand-text">
      {children}
      {action && <span className="ml-auto text-[13px] font-medium text-brand-text">{action}</span>}
    </h2>
  );
}
