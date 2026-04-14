"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { AnimatedWords } from "@/components/motion/AnimatedWords";
import { Reveal } from "@/components/motion/Reveal";

const stats = [
  {
    value: "6",
    label: "Routes",
    description: "Swap, liquidity, earn, sTitan, borrow, and governance.",
  },
  {
    value: "1",
    label: "One app",
    description: "Trading, staking, borrowing, and voting stay in one flow.",
  },
  {
    value: "24h",
    label: "Faucet",
    description: "Test tokens refresh every 24 hours.",
  },
  {
    value: "DAO",
    label: "Voting",
    description: "Read proposals, activate voting power, and vote in place.",
  },
];

const imageCards = [
  {
    title: "Swap",
    description: "Trade tokens.",
    href: "/swap",
    image: "/swap.jpg",
  },
  {
    title: "Liquidity",
    description: "Open and manage LP positions.",
    href: "/liquidity",
    image: "/liquidity.jpg",
  },
  {
    title: "Earn",
    description: "Stake and track rewards.",
    href: "/earn",
    image: "/earn.jpg",
  },
  {
    title: "Borrow",
    description: "Borrow tUSD against collateral.",
    href: "/borrow",
    image: "/borrow.jpg",
  },
];

const journalCards = [
  {
    title: "sTitan",
    description: "Stake TITAN for sTITAN.",
    href: "/stitan",
    image: "/stitan.jpg",
  },
  {
    title: "Governance",
    description: "Follow proposals and vote.",
    href: "/governance",
    image: "/governance.jpg",
  },
  {
    title: "Faucet",
    description: "Get test tokens before you start.",
    href: "/faucet",
    image: "/why-titan.jpg",
  },
];

export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroTravel = useTransform(
    scrollYProgress,
    [0, 1],
    [0, prefersReducedMotion ? 0 : 260]
  );
  const heroYOffset = useSpring(heroTravel, {
    stiffness: 110,
    damping: 20,
    mass: 0.8,
  });

  return (
    <div className="bg-[var(--color-background)] text-[var(--color-foreground)]">
      <section
        ref={heroRef}
        className="relative mb-14 flex h-[100svh] min-h-[100svh] flex-col justify-center overflow-hidden bg-[var(--color-titan-green-dark)]"
      >
        <div className="relative z-10 h-[100svh] min-h-[100svh] w-full">
          <div className="relative h-full">
            <h1 className="sr-only">Titan</h1>
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 top-[var(--hero-navbar-clearance)] z-10 flex items-end justify-center overflow-hidden"
              initial={{
                opacity: 0,
                y: prefersReducedMotion ? 0 : 72,
                scaleY: prefersReducedMotion ? 1 : 1.16,
                scaleX: prefersReducedMotion ? 1 : 0.96,
              }}
              animate={{ opacity: 1, y: 0, scaleY: 1, scaleX: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0.01 : 1.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                y: heroYOffset,
                transformOrigin: "center bottom",
              }}
            >
              <img
                src="/titan-text.svg"
                alt=""
                className="block h-full w-full max-w-none object-fill object-center"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden pt-28 pb-40 md:pt-32 md:pb-44">
        <div className="px-4">
          <div className="section-shell grid w-full grid-cols-12 gap-x-2 gap-y-2">
            <Reveal className="col-span-12 px-[38px] text-center md:col-span-10 md:col-start-2 md:px-0">
              <h2 className="font-display text-[40px] leading-[0.95] font-[300] tracking-[-0.025em] md:text-[48px]">
                <AnimatedWords
                  words={[
                    { text: "Titan" },
                    { text: "brings" },
                    {
                      text: "swap,",
                      className: "text-[var(--color-primary)]",
                    },
                    {
                      text: "liquidity,",
                      className: "text-[var(--color-primary)]",
                    },
                    {
                      text: "earn,",
                      className: "text-[var(--color-primary)]",
                    },
                    { text: "and" },
                    {
                      text: "governance",
                      className: "text-[var(--color-primary)]",
                    },
                    { text: "into" },
                    { text: "one" },
                    { text: "place." },
                  ]}
                />
              </h2>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="pt-12 pb-24 md:pt-18 md:pb-30">
        <div className="px-4">
          <div className="section-shell grid grid-cols-12 gap-x-2 gap-y-2">
            <Reveal className="col-span-12">
              <p className="max-w-[1460px] font-display text-[34px] leading-[0.98] font-[300] tracking-[-0.03em] text-[var(--color-soil-80)] md:text-[52px] lg:text-[62px]">
                <AnimatedWords
                  words={[
                    { text: "Titan" },
                    { text: "keeps" },
                    { text: "the" },
                    { text: "whole" },
                    { text: "testnet" },
                    { text: "loop" },
                    { text: "in" },
                    { text: "one" },
                    { text: "place." },
                    { text: "Get" },
                    { text: "tokens," },
                    { text: "swap," },
                    { text: "add" },
                    { text: "liquidity," },
                    { text: "stake," },
                    { text: "borrow," },
                    { text: "and" },
                    { text: "vote" },
                    { text: "without" },
                    { text: "bouncing" },
                    { text: "between" },
                    { text: "separate" },
                    { text: "tools." },
                  ]}
                  delay={0.08}
                  stagger={0.032}
                />
              </p>
            </Reveal>

            {stats.map((stat, index) => (
              <Reveal
                key={stat.label}
                delay={index * 0.06}
                className="col-span-12 mt-10 flex min-h-[300px] flex-col justify-between rounded-xl bg-white/55 p-7 md:col-span-3 md:mt-12 md:min-h-[430px]"
              >
                <p className="font-display text-[72px] leading-[0.9] font-[300] tracking-[-0.04em] text-[var(--color-eigenpal-green)] md:text-[92px]">
                  {stat.value}
                </p>
                <div className="space-y-3">
                  <p className="text-[20px] leading-[1.15] font-[350] tracking-[-0.02em] text-[var(--color-soil-100)]">
                    {stat.label}
                  </p>
                  <p className="text-[17px] leading-[1.28] font-[350] tracking-[-0.02em] text-[var(--color-soil-70)]">
                    {stat.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pt-10 pb-22 md:pt-14 md:pb-24">
        <div className="px-4">
          <div className="section-shell grid grid-cols-12 gap-x-2 gap-y-2">
            <Reveal className="col-span-12 pt-4 text-center md:pt-6">
              <h2 className="font-display text-[40px] leading-[0.95] font-[300] uppercase tracking-[-0.025em] md:text-[48px]">
                Core flow
              </h2>
            </Reveal>
            {imageCards.map((card, index) => (
              <Reveal
                key={card.title}
                delay={index * 0.05}
                className="col-span-12 pt-10 md:col-span-3 md:pt-12"
              >
                <Link href={card.href} className="group block">
                  <article className="flex flex-col gap-y-4">
                    <div className="titan-media relative aspect-2/3 w-full overflow-hidden rounded-xl">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 ease-out group-hover:scale-[1.04] group-hover:opacity-50"
                      />
                    </div>
                    <div className="pt-4">
                      <h3 className="mb-2 font-display text-[30px] leading-[1.02] tracking-[-0.03em] text-[var(--color-soil-100)]">
                        {card.title}
                      </h3>
                      <p className="max-w-[26ch] text-[17px] leading-[1.24] font-[350] tracking-[-0.02em] text-[var(--color-soil-70)]">
                        {card.description}
                      </p>
                    </div>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pt-10 pb-22 md:pt-14 md:pb-24">
        <div className="px-4">
          <div className="section-shell grid grid-cols-12 gap-x-2 gap-y-2">
            <Reveal className="col-span-12 pt-4 text-center md:pt-6">
              <h2 className="font-display text-[40px] leading-[0.95] font-[300] uppercase tracking-[-0.025em] md:text-[48px]">
                Around Titan
              </h2>
            </Reveal>

            {journalCards.map((card, index) => (
              <Reveal
                key={card.title}
                delay={index * 0.06}
                className="col-span-12 pt-10 md:col-span-4 md:pt-12"
              >
                <Link href={card.href} className="group block">
                  <article className="flex flex-col gap-y-4">
                    <div className="titan-media relative aspect-4/5 w-full overflow-hidden rounded-xl">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 ease-out group-hover:scale-[1.04] group-hover:opacity-50"
                      />
                    </div>
                    <div>
                      <h3 className="mb-2 font-display text-[26px] leading-[1.1] tracking-[-0.02em] text-[var(--color-soil-100)]">
                        {card.title}
                      </h3>
                      <p className="text-[18px] leading-[1.25] font-[350] tracking-[-0.02em] text-[var(--color-soil-70)]">
                        {card.description}
                      </p>
                    </div>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pt-8 pb-18 md:pt-12 md:pb-22">
        <Reveal className="section-shell relative overflow-hidden rounded-xl bg-[var(--color-eigenpal-green)] px-4 py-20 md:px-10 md:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-[48%] overflow-hidden md:flex md:items-center"
          >
            <img
              src="/titan-logo.svg"
              alt=""
              className="ml-[-24%] block h-[184%] w-auto max-w-none shrink-0 object-contain object-left opacity-95"
            />
          </div>
          <div className="grid grid-cols-12 gap-x-2 gap-y-2">
            <div className="col-span-12 md:col-span-4 md:col-start-8 md:text-left">
              <h2 className="font-display text-[40px] leading-[0.95] font-[300] uppercase tracking-[-0.025em] text-[var(--color-warm-50)] md:text-[48px]">
                Start with
                <br />
                the faucet
              </h2>
              <p className="mt-3 text-[18px] leading-[1.25] font-[350] tracking-[-0.02em] text-[var(--color-warm-50)]/74">
                Get test tokens, then jump into the app.
              </p>
              <Link
                href="/faucet"
                className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-[16px] leading-[118%] font-[350] text-[#243025] transition-colors hover:bg-[var(--color-titan-green-light)]"
              >
                Open Faucet
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
