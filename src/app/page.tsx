"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowLeftRight,
  Landmark,
  Sprout,
  Vote,
  Zap,
  ChevronRight,
  Code,
  Blocks,
} from "lucide-react";
import Image from "next/image";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ArrowLeftRight,
    title: "Swap",
    description:
      "Trade tokens instantly with minimal slippage and best rates across multiple liquidity pools.",
    description2:
      "Powered by Uniswap V4 hooks for advanced trading features and MEV protection.",
    href: "/swap",
    badge: "Exchange",
    image: "/swap.jpg",
  },
  {
    icon: Landmark,
    title: "Stake",
    description:
      "Stake TITAN to earn rewards and gain governance power over protocol decisions.",
    description2:
      "Flexible staking periods with auto-compounding rewards and no lock-up requirements.",
    href: "/stake",
    badge: "Staking",
    image: "/stake.jpg",
  },
  {
    icon: Sprout,
    title: "Farm",
    description:
      "Provide liquidity to earn yield on your assets with competitive APRs.",
    description2:
      "Concentrated liquidity positions for maximized capital efficiency and higher returns.",
    href: "/farm",
    badge: "Yield",
    image: "/farm.jpg",
  },
  {
    icon: Vote,
    title: "Governance",
    description:
      "Vote on proposals and shape the future of the Titan protocol.",
    description2:
      "On-chain voting with delegation support and transparent proposal execution.",
    href: "/governance",
    badge: "DAO",
    image: "/governance.jpg",
  },
];

const stats = [
  {
    label: "Swap",
    value: "Instant",
    change: "Uniswap V4",
    icon: ArrowLeftRight,
  },
  {
    label: "Staking",
    value: "Live",
    change: "Earn TITAN",
    icon: Landmark,
  },
  {
    label: "Farming",
    value: "Active",
    change: "LP Rewards",
    icon: Sprout,
  },
  {
    label: "Governance",
    value: "DAO",
    change: "Vote",
    icon: Vote,
  },
];

const benefits = [
  {
    icon: Blocks,
    title: "Uniswap V4",
    description: "Built on the latest Uniswap V4 protocol with hooks support",
  },
  {
    icon: Code,
    title: "Open Source",
    description: "Fully open source smart contracts and frontend code",
  },
  {
    icon: Zap,
    title: "Gas Efficient",
    description:
      "Optimized transactions with minimal gas fees using singleton architecture",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section - Full Width */}
      <section className="relative min-h-screen flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-left sm:bg-center bg-no-repeat rounded-b-3xl"
          style={{ backgroundImage: "url('/hero.jpg')" }}
        />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text Content */}
            <div>
              <span className="inline-flex items-center font-mono uppercase tracking-wider text-xs text-white/80 mb-6 px-3 py-1.5 rounded-full border border-white/30 bg-white/10">
                DeFi Protocol
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight text-white mb-6 [text-shadow:_0_2px_12px_rgb(0_0_0_/_40%)]">
                The all-in-one DeFi
                <br />
                protocol for Titans.
              </h1>
              <p className="text-lg text-white mb-8 max-w-lg leading-relaxed [text-shadow:_0_1px_8px_rgb(0_0_0_/_50%)]">
                Swap, stake, farm, and govern - all in one elegant interface. A
                DeFi protocol built with Uniswap V4.
              </p>
              <Link href="/swap">
                <Button
                  size="lg"
                  className="group cursor-pointer bg-white text-[var(--color-primary)] hover:bg-white/90"
                >
                  Launch App
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Right - Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="mb-3">
                      <Icon className="h-5 w-5 text-[var(--color-muted-foreground)]" />
                    </div>
                    <p className="text-2xl md:text-3xl font-medium text-[var(--color-foreground)] mb-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        {stat.label}
                      </p>
                      <span className="text-xs text-[var(--color-primary)] font-medium font-mono">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <PageContainer className="pt-0">
        {/* Features Section */}
        <section className="py-20">
          <div className="mb-12">
            <span className="inline-flex items-center font-mono uppercase tracking-wider text-xs text-[var(--color-muted-foreground)] mb-4 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.15] tracking-tight text-[var(--color-foreground)]">
              Everything you need,
              <br />
              nothing you don&apos;t.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} href={feature.href}>
                  <div className="bg-white border border-[var(--color-border)] rounded-2xl p-2 h-full cursor-pointer group hover:border-[var(--color-foreground)]/20 transition-all duration-200 flex flex-col sm:flex-row">
                    <div className="flex-1 p-6 order-1 sm:order-1">
                      <div className="flex items-start justify-between mb-6">
                        <Icon className="h-6 w-6 text-[var(--color-muted-foreground)]" />
                        <span className="font-mono uppercase tracking-wider text-xs text-[var(--color-muted-foreground)]">
                          {feature.badge}
                        </span>
                      </div>
                      <h3 className="text-xl font-medium text-[var(--color-foreground)] mb-2 flex items-center gap-2">
                        {feature.title}
                        <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] group-hover:translate-x-1 group-hover:text-[var(--color-foreground)] transition-all duration-300" />
                      </h3>
                      <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-3">
                        {feature.description}
                      </p>
                      <p className="text-[var(--color-muted-foreground)] leading-relaxed opacity-60 text-sm">
                        {feature.description2}
                      </p>
                    </div>
                    <div className="order-2 sm:order-2 w-full sm:w-44 h-128 sm:h-auto rounded-xl overflow-hidden shrink-0 sm:self-stretch">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={176}
                        height={264}
                        className="w-full h-full object-cover object-top sm:object-center"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Benefits Section - Dark Green */}
        <section className="py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-[var(--color-primary)] rounded-3xl my-12 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover sm:bg-right bg-no-repeat"
            style={{ backgroundImage: "url('/why-titan.jpg')" }}
          />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="max-w-xl">
              <div className="mb-12">
                <span className="inline-flex items-center font-mono uppercase tracking-wider text-xs text-white/60 mb-4 px-3 py-1.5 rounded-full border border-white/20 bg-white/5">
                  Why Titan
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.15] tracking-tight text-white">
                  Built for the future
                  <br />
                  of decentralized finance.
                </h2>
              </div>

              <div className="space-y-6">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0">
                        <Icon className="h-6 w-6 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white mb-1">
                          {benefit.title}
                        </h3>
                        <p className="text-white/70 leading-relaxed text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <span className="inline-flex items-center font-mono uppercase tracking-wider text-xs text-[var(--color-muted-foreground)] mb-4 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white">
              Get Started
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.15] tracking-tight text-[var(--color-foreground)] mb-6">
              Ready to become
              <br />a Titan?
            </h2>
            <p className="text-[var(--color-muted-foreground)] mb-8 text-lg leading-relaxed">
              Get test tokens from the faucet and start exploring all the
              features Titan has to offer.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/faucet">
                <Button size="lg" variant="outline" className="cursor-pointer">
                  Get Test Tokens
                </Button>
              </Link>
              <Link href="/swap">
                <Button size="lg" className="group cursor-pointer">
                  Start Trading
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
