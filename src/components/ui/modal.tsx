"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const ModalContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

function useModal() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("Modal components must be used within a Modal");
  }
  return context;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
};

export function Modal({
  open,
  onOpenChange,
  children,
  className,
  showCloseButton = true,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange, closeOnEscape]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <ModalContext.Provider value={{ open, onOpenChange }}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[var(--color-foreground)]/50 backdrop-blur-sm"
        onClick={() => closeOnOverlayClick && onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/5 ring-offset-[var(--color-background)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/30 focus:ring-offset-2 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {children}
      </div>
    </ModalContext.Provider>,
    document.body
  );
}

export function ModalContent({ children, className }: ModalContentProps) {
  return <div className={cn("", className)}>{children}</div>;
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
      {children}
    </div>
  );
}

export function ModalTitle({ children, className }: ModalTitleProps) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-[var(--color-foreground)]",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function ModalDescription({ children, className }: ModalDescriptionProps) {
  return (
    <p className={cn("text-sm text-[var(--color-muted-foreground)]", className)}>
      {children}
    </p>
  );
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export { useModal };
