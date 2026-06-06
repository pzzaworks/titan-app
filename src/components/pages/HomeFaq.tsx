"use client";

import { Reveal } from "@/components/motion/Reveal";
import { homeFaqItems } from "@/components/pages/home-faq";

/**
 * Visible homepage FAQ. The question and answer copy here is the single source
 * of truth shared with the FAQPage JSON-LD (homeFaqItems), so the rendered text
 * and structured data match exactly. Styling reuses the home design tokens.
 */
export function HomeFaq() {
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
            {homeFaqItems.map((item, index) => (
              <Reveal key={item.question} delay={index * 0.04}>
                <details className="group border-b border-[var(--color-soil-100)]/12 py-6">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                    <h3 className="font-display text-[24px] leading-[1.08] font-[350] tracking-[-0.02em] text-[var(--color-soil-100)] md:text-[28px]">
                      {item.question}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[26px] leading-none font-[300] text-[var(--color-soil-70)] transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-[68ch] text-[18px] leading-[1.4] font-[350] tracking-[-0.02em] text-[var(--color-soil-70)]">
                    {item.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
