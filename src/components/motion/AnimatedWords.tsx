"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedWord {
  text: string;
  className?: string;
}

interface AnimatedWordsProps {
  words: AnimatedWord[];
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

const wordEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function AnimatedWords({
  words,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.045,
  duration = 0.72,
  once = true,
  amount = 0.5,
}: AnimatedWordsProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span className={cn(className)}>
      {words.map((word, index) => (
        <motion.span
          key={`${word.text}-${index}`}
          className={cn("inline-block", wordClassName, word.className)}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once, amount }}
          transition={{
            duration: prefersReducedMotion ? 0.01 : duration,
            ease: wordEase,
            delay: prefersReducedMotion ? 0 : delay + index * stagger,
          }}
        >
          {word.text}
          {index < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
}
