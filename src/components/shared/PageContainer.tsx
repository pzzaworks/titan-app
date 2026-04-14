"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-7xl",
};

export function PageContainer({
  children,
  className,
  maxWidth = "full",
}: PageContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.main
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16",
        maxWidthClasses[maxWidth],
        className
      )}
      initial={{
        opacity: 0,
        y: prefersReducedMotion ? 0 : 28,
        scaleY: prefersReducedMotion ? 1 : 1.03,
        scaleX: prefersReducedMotion ? 1 : 0.99,
      }}
      animate={{ opacity: 1, y: 0, scaleY: 1, scaleX: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0.01 : 0.82,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ transformOrigin: "center bottom" }}
    >
      {children}
    </motion.main>
  );
}
