"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/30 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
        secondary:
          "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
        destructive:
          "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)]",
        outline:
          "bg-white/72 text-[var(--color-muted-foreground)]",
        success:
          "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
        warning:
          "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]",
        tag:
          "bg-white/72 text-[var(--color-muted-foreground)] text-[10px] px-3 py-1 font-mono uppercase tracking-wider",
        muted:
          "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
      },
      interactive: {
        true: "cursor-pointer hover:opacity-80",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, interactive, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, interactive }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
