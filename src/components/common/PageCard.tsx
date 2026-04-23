import { cn } from '@/utils/cn';
import type { HTMLAttributes, PropsWithChildren } from 'react';

type PageCardProps = PropsWithChildren<
  HTMLAttributes<HTMLElement> & {
    as?: 'div' | 'section' | 'article' | 'header';
    tone?: 'default' | 'warning' | 'danger' | 'muted' | 'success';
  }
>;

const toneClassNames: Record<NonNullable<PageCardProps['tone']>, string> = {
  default: 'border-slate-200 bg-white shadow-sm',
  warning: 'border-amber-200 bg-amber-50',
  danger: 'border-red-200 bg-red-50',
  muted: 'border-dashed border-slate-200 bg-slate-50',
  success: 'border-emerald-100 bg-white shadow-sm',
};

export function PageCard({
  as = 'section',
  tone = 'default',
  className,
  children,
  ...props
}: PageCardProps) {
  const Component = as;

  return (
    <Component className={cn('rounded-2xl border p-6', toneClassNames[tone], className)} {...props}>
      {children}
    </Component>
  );
}
