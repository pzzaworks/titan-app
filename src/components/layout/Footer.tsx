"use client";

import Link from "next/link";
import Image from "next/image";
import { config } from "@/config";
import { Reveal } from "@/components/motion/Reveal";

const productLinks = [
  { href: "/swap", label: "Swap" },
  { href: "/liquidity", label: "Liquidity" },
  { href: "/earn", label: "Earn" },
  { href: "/borrow", label: "Borrow" },
  { href: "/stitan", label: "sTitan" },
  { href: "/faucet", label: "Faucet" },
  { href: "/governance", label: "Governance" },
];

const productColumns = [
  productLinks.slice(0, 4),
  productLinks.slice(4),
];

const resourceLinks = [
  { href: config.links.github, label: "GitHub" },
];

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

const footerSections = [
  { title: "Product", links: productColumns[0] },
  { title: "More", links: productColumns[1] },
  { title: "Resources", links: resourceLinks },
  { title: "Legal", links: legalLinks },
];

export function Footer() {
  return (
    <footer className="bg-[var(--color-titan-green-dark)] text-[var(--color-warm-50)]">
      <div className="min-h-[360px] px-4 pt-12 pb-5 sm:px-5 md:min-h-[430px] md:px-6 md:pt-14 md:pb-6 lg:px-8">
        <div className="mx-auto flex min-h-[inherit] max-w-[1880px] flex-col justify-between pt-4 sm:pt-6 md:pt-8 xl:pt-12">
          <div className="flex flex-col gap-10 md:gap-12 xl:grid xl:grid-cols-[max-content_minmax(0,1fr)] xl:items-start xl:gap-y-14">
            <Reveal className="space-y-8" y={40}>
              <Link href="/" className="inline-flex max-w-full items-center gap-2.5 md:gap-2">
                <Image
                  src="/titan-logo.svg"
                  alt="Titan"
                  width={196}
                  height={196}
                  className="h-[58px] w-auto shrink-0 sm:h-[64px] md:h-[74px] xl:h-[126px]"
                />
                <Image
                  src="/titan-text.svg"
                  alt="Titan"
                  width={520}
                  height={180}
                  className="h-[34px] w-auto max-w-[min(52vw,168px)] shrink sm:h-[38px] sm:max-w-[200px] md:h-[44px] md:max-w-[240px] xl:h-[98px] xl:max-w-none xl:-translate-x-1 2xl:h-[112px]"
                />
              </Link>
            </Reveal>
            <Reveal
              className="grid grid-cols-2 gap-x-8 gap-y-8 pt-1 min-[540px]:grid-cols-4 md:gap-x-10 md:gap-y-10 md:pt-2 xl:justify-self-center xl:pt-4 xl:[grid-template-columns:160px_160px_170px_170px] xl:gap-16"
              delay={0.08}
              y={40}
            >
              {footerSections.map((section) => (
                <div key={section.title} className="space-y-5">
                  <p className="text-[17px] leading-[1.18] uppercase text-white/52">
                    {section.title}
                  </p>
                  <nav className="flex flex-col gap-4">
                    {section.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          link.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="text-[17px] leading-[1.18] font-[350] tracking-[-0.03em] text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              ))}
            </Reveal>
            <Reveal
              className="mt-auto flex flex-col gap-3 pt-10 text-[17px] leading-[1.18] font-[350] tracking-[-0.03em] text-white/68 sm:pt-12 xl:col-span-2 xl:flex-row xl:items-center xl:justify-between xl:gap-3 xl:pt-24"
              delay={0.14}
              y={34}
            >
              <p>Swap, stake, borrow, add liquidity, and vote.</p>
              <p>
                Built by{" "}
                <a
                  href="https://pzza.works"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/84 transition-colors hover:text-white"
                >
                  Berke
                </a>
                .
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </footer>
  );
}
