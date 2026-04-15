"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-mono uppercase tracking-wider text-sm ring-offset-[var(--color-background)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-titan-green)] text-[#243025] rounded-xl hover:bg-[#1e322e] hover:text-[var(--color-warm-50)]",
        secondary:
          "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] rounded-xl hover:bg-[#e5e5e5]",
        outline:
          "bg-white/65 text-[var(--color-foreground)] rounded-xl hover:bg-white/82",
        ghost:
          "text-[var(--color-muted-foreground)] hover:bg-[#f5f5f5] hover:text-[var(--color-foreground)] rounded-xl",
        destructive:
          "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] rounded-xl hover:bg-[#dc2626]",
        link:
          "text-[var(--color-foreground)] underline-offset-4 hover:underline",
        primary:
          "bg-[var(--color-primary)] text-[#243025] rounded-xl hover:bg-[#1e322e] hover:text-[var(--color-warm-50)]",
        green:
          "bg-[var(--color-titan-green)] text-[#243025] rounded-xl hover:bg-[var(--color-titan-green-light)]",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-8 text-sm",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
