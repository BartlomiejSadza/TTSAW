'use client';

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              `
                w-full
                px-4 py-3
                bg-[var(--color-bg-elevated)]
                border border-[var(--color-border-default)]
                rounded-[var(--radius-md)]
                text-[var(--color-text-primary)]
                text-base
                placeholder:text-[var(--color-text-tertiary)]
                transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]
                focus:outline-none
                focus:border-[var(--color-accent-primary)]
                focus:shadow-[0_0_0_3px_var(--color-accent-primary-muted)]
                disabled:opacity-50
                disabled:cursor-not-allowed
              `,
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:shadow-[0_0_0_3px_var(--color-error-muted)]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-[var(--color-error)] flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
