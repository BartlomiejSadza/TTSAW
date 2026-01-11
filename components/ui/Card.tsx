"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "glass" | "bordered";
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = "default", padding = "md", children, ...props },
    ref
  ) => {
    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    const variants = {
      default: `
        bg-[var(--color-bg-surface)]
        border border-[var(--color-border-subtle)]
        rounded-[var(--radius-lg)]
      `,
      interactive: `
        bg-[var(--color-bg-surface)]
        border border-[var(--color-border-subtle)]
        rounded-[var(--radius-lg)]
        cursor-pointer
        transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]
        hover:bg-[var(--color-bg-elevated)]
        hover:border-[var(--color-border-default)]
        hover:-translate-y-0.5
        hover:shadow-[var(--shadow-lg)]
      `,
      glass: `
        bg-[rgba(28,28,33,0.8)]
        backdrop-blur-xl
        border border-[rgba(255,255,255,0.1)]
        rounded-[var(--radius-xl)]
      `,
      bordered: `
        bg-[var(--color-bg-surface)]
        border border-[var(--color-border-default)]
        rounded-[var(--radius-lg)]
      `,
    };

    return (
      <div
        ref={ref}
        className={cn(variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
