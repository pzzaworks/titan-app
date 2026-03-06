"use client";

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
  if (isLoading) {
    return (
      <div className={cn("bg-white border border-[var(--color-border)] rounded-2xl p-5", className)}>
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white border border-[var(--color-border)] rounded-2xl p-5 hover:border-[var(--color-foreground)]/20 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[var(--color-muted-foreground)]">{title}</p>
        {Icon && (
          <Icon className="h-5 w-5 text-[var(--color-muted-foreground)]" />
        )}
      </div>
      <p className="text-2xl font-medium text-[var(--color-foreground)]">{value}</p>
      <div className="flex items-center gap-2 mt-1">
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
          <span className="text-xs text-[var(--color-muted-foreground)]">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
