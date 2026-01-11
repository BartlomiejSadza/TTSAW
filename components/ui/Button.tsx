'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium
      rounded-[var(--radius-md)]
      transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]
      focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      cursor-pointer
    `;

    const variants = {
      primary: `
        bg-gradient-to-br from-[var(--color-accent-primary)] to-[#7C3AED]
        text-white
        shadow-[var(--shadow-md)]
        hover:from-[var(--color-accent-primary-hover)] hover:to-[#8B5CF6]
        hover:-translate-y-0.5
        hover:shadow-[var(--shadow-lg),var(--glow-primary)]
        active:translate-y-0
      `,
      secondary: `
        bg-[var(--color-bg-elevated)]
        text-[var(--color-text-primary)]
        border border-[var(--color-border-default)]
        hover:bg-[var(--color-bg-hover)]
        hover:border-[var(--color-border-strong)]
        active:bg-[var(--color-bg-elevated)]
      `,
      ghost: `
        bg-transparent
        text-[var(--color-text-secondary)]
        hover:bg-[var(--color-bg-hover)]
        hover:text-[var(--color-text-primary)]
        active:bg-[var(--color-bg-elevated)]
      `,
      danger: `
        bg-[var(--color-error)]
        text-white
        hover:bg-[#DC2626]
        hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]
        active:bg-[var(--color-error)]
      `,
      outline: `
        bg-transparent
        text-[var(--color-accent-primary)]
        border border-[var(--color-accent-primary)]
        hover:bg-[var(--color-accent-primary-muted)]
        active:bg-transparent
      `,
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="animate-spin" />
            <span>Ładowanie...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
