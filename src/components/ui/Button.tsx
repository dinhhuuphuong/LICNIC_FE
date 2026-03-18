import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/utils/cn';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'primary' | 'secondary';
};

export function Button({
  children,
  className,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5',
        variant === 'secondary'
          ? 'border-sky-300 bg-white text-sky-800 hover:bg-sky-50'
          : 'border-sky-700 bg-sky-700 text-white hover:bg-sky-800',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
