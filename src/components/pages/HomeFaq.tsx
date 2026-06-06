"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { homeFaqItems } from "@/components/pages/home-faq";

/**
 * Visible homepage FAQ. The question and answer copy here is the single source
 * of truth shared with the FAQPage JSON-LD (homeFaqItems), so the rendered text
 * and structured data match exactly. Styling reuses the home design tokens.
 *
 * Each row is a button (click anywhere to toggle) and the answer expands with a
 * smooth height/opacity animation.
 */
export function HomeFaq() {
  const [openItems, setOpenItems] = useState<ReadonlySet<number>>(new Set());

  const toggle = (index: number) => {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section className="pt-10 pb-22 md:pt-14 md:pb-24">
      <div className="px-4">
        <div className="section-shell grid grid-cols-12 gap-x-2 gap-y-2">
          <Reveal className="col-span-12 pt-4 text-center md:pt-6">
            <h2 className="font-display text-[40px] leading-[0.95] font-[300] uppercase tracking-[-0.025em] md:text-[48px]">
              FAQ
            </h2>
          </Reveal>

          <div className="col-span-12 mt-10 md:col-span-10 md:col-start-2 md:mt-12">
            {homeFaqItems.map((item, index) => {
              const isOpen = openItems.has(index);
              const panelId = `home-faq-panel-${index}`;

              return (
                <Reveal key={item.question} delay={index * 0.04}>
                  <div className="group border-b border-[var(--color-soil-100)]/12 py-6">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(index)}
                      className="flex w-full cursor-pointer items-start justify-between gap-6 text-left"
                    >
                      <h3 className="font-display text-[24px] leading-[1.08] font-[350] tracking-[-0.02em] text-[var(--color-soil-100)] md:text-[28px]">
                        {item.question}
                      </h3>
                      <span
                        aria-hidden="true"
                        className={`mt-1 shrink-0 text-[26px] leading-none font-[300] text-[var(--color-soil-70)] transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          key="answer"
                          id={panelId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="mt-4 max-w-[68ch] text-[18px] leading-[1.4] font-[350] tracking-[-0.02em] text-[var(--color-soil-70)]">
                            {item.answer}
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
