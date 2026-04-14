"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedWords } from "@/components/motion/AnimatedWords";
import { PageContainer } from "@/components/shared/PageContainer";

export interface LegalSection {
  title: string;
  paragraphs: ReactNode[];
  bullets?: ReactNode[];
}

interface LegalPageProps {
  title: string;
  intro: ReactNode;
  updatedOn: string;
  sections: LegalSection[];
}

export function LegalPage({
  title,
  intro,
  updatedOn,
  sections,
}: LegalPageProps) {
  return (
    <PageContainer maxWidth="full">
      <div className="mx-auto max-w-4xl pt-4 pb-20 sm:pt-6 sm:pb-28">
        <Reveal className="mb-12" y={28}>
          <h1 className="font-display text-[42px] leading-[0.94] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[56px]">
            <AnimatedWords
              words={title.split(" ").map((word) => ({ text: word }))}
              delay={0.04}
              stagger={0.06}
              duration={0.78}
              amount={0.7}
            />
          </h1>
          <div className="mt-5 max-w-3xl text-[17px] leading-[1.55] text-[var(--color-muted-foreground)]">
            {intro}
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.08em] text-[var(--color-muted-foreground)]/82">
            Last updated {updatedOn}
          </p>
        </Reveal>

        <div className="space-y-10 sm:space-y-12">
          {sections.map((section, index) => (
            <Reveal
              key={section.title}
              delay={index * 0.04}
              className=""
              y={24}
            >
              <h2 className="font-display text-[28px] leading-[1] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[34px]">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-[16px] leading-[1.65] text-[var(--color-muted-foreground)] sm:text-[17px]">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-5 space-y-3 text-[16px] leading-[1.6] text-[var(--color-muted-foreground)] sm:text-[17px]">
                  {section.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="flex gap-3">
                      <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={sections.length * 0.04 + 0.06}
          className="mt-12 pb-8 sm:mt-14 sm:pb-10"
          y={20}
        >
          <h2 className="font-display text-[28px] leading-[1] font-[300] tracking-[-0.03em] text-[var(--color-foreground)] sm:text-[34px]">
            Project Links
          </h2>
          <p className="mt-4 max-w-3xl text-[16px] leading-[1.65] text-[var(--color-muted-foreground)] sm:text-[17px]">
            Titan is an open-source project. For code, issues, and updates, visit the{" "}
            <Link
              href="https://github.com/pzzaworks/titan-app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-foreground)] underline decoration-[var(--color-border)] underline-offset-4 transition-colors hover:text-[var(--color-foreground)]/78"
            >
              GitHub repository
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </PageContainer>
  );
}
