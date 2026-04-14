"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isLoading,
  className,
}: StatsCardProps) {
  const prefersReducedMotion = useReducedMotion();

  if (isLoading) {
    return (
      <div className={cn("rounded-xl bg-white/60 p-6", className)}>
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="mb-3 h-12 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "min-w-0 overflow-hidden rounded-xl bg-white/60 p-5 transition-colors duration-200 hover:bg-white/72 sm:p-6",
        className
      )}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: prefersReducedMotion ? 0.01 : 0.76,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
        <p className="min-w-0 text-[12px] uppercase tracking-[0.08em] text-[var(--color-muted-foreground)] sm:text-[13px]">
          {title}
        </p>
        {Icon && (
          <Icon className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)]/72 sm:h-5 sm:w-5" />
        )}
      </div>
      <p className="min-w-0 break-words font-display text-[clamp(2rem,10vw,2.75rem)] leading-[0.92] font-[300] tracking-[-0.04em] text-[var(--color-eigenpal-green)]">
        {value}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {trend && (
          <span
            className={cn(
              "text-xs font-medium font-mono",
              trend.isPositive ? "text-[var(--color-primary)]" : "text-red-500"
            )}
          >
            {trend.isPositive ? "+" : "-"}
            {Math.abs(trend.value)}%
          </span>
        )}
        {subtitle && (
          <span className="text-sm text-[var(--color-muted-foreground)]">
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
}
