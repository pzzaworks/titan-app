"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, disabled, ...props }, ref) => {
    const percentage = ((value[0] - min) / (max - min)) * 100;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newValue = Math.round((percentage * (max - min) + min) / step) * step;
      onValueChange([Math.max(min, Math.min(max, newValue))]);
    };

    const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.buttons !== 1 || disabled) return;
      handleClick(e);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={handleClick}
        onMouseMove={handleDrag}
        {...props}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-[var(--color-foreground)]/10">
          <div
            className="absolute h-full bg-[var(--color-primary)] transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className={cn(
            "absolute h-5 w-5 rounded-full border-2 border-[var(--color-primary)] bg-white shadow-md transition-all",
            !disabled && "cursor-grab active:cursor-grabbing"
          )}
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
