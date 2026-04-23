import { PageCard } from '@/components/common/PageCard';
import { cn } from '@/utils/cn';
import type { PropsWithChildren, ReactNode } from 'react';

type StatePanelProps = PropsWithChildren<{
  title?: string;
  description?: string;
  action?: ReactNode;
  centered?: boolean;
  tone?: 'default' | 'warning' | 'danger' | 'muted' | 'success';
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}>;

export function StatePanel({
  title,
  description,
  action,
  centered = false,
  tone = 'default',
  className,
  titleClassName,
  descriptionClassName,
  children,
}: StatePanelProps) {
  return (
    <PageCard
      tone={tone}
      className={cn(centered && 'text-center', className)}
    >
      {title ? (
        <h1
          className={cn(
            'text-xl font-bold',
            tone === 'danger' ? 'text-red-900' : 'text-slate-900',
            titleClassName,
          )}
        >
          {title}
        </h1>
      ) : null}

      {description ? (
        <p
          className={cn(
            'mt-2 text-sm',
            tone === 'danger' ? 'text-red-800' : centered ? 'text-slate-700' : 'text-slate-600',
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}

      {children}

      {action ? <div className={cn(title || description || children ? 'mt-4' : undefined)}>{action}</div> : null}
    </PageCard>
  );
}
