"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@/components/wallet/ConnectButton";

const menuLinks = [
  { href: "/swap", label: "Swap" },
  { href: "/liquidity", label: "Liquidity" },
  { href: "/earn", label: "Earn" },
  { href: "/stitan", label: "sTitan" },
  { href: "/borrow", label: "Borrow" },
  { href: "/governance", label: "Governance" },
  { href: "/faucet", label: "Faucet" },
];

export function Navbar() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navbarRef = useRef<HTMLDivElement | null>(null);

  const isHomepage = pathname === "/";
  const isHeroVisible = isHomepage && !scrolled && !mobileMenuOpen;

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (navbarRef.current?.contains(target)) return;
      setMobileMenuOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [mobileMenuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        ref={navbarRef}
        className="mt-4 w-full px-4 md:px-6"
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.62, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={cn(
            "relative w-full rounded-xl p-2 transition-all duration-300",
            scrolled || mobileMenuOpen
              ? "bg-[var(--color-background)]/96 text-[var(--color-foreground)] shadow-[0_14px_28px_rgba(0,0,0,0.06)] backdrop-blur-sm"
              : isHomepage
                ? "bg-transparent text-[var(--color-warm-50)]"
                : "bg-transparent text-[var(--color-foreground)]"
          )}
        >
          <div className="grid grid-cols-[1fr_40px] items-center">
            <motion.div
              className="flex items-center"
              initial={{
                opacity: 0,
                y: prefersReducedMotion ? 0 : 28,
                scaleY: prefersReducedMotion ? 1 : 1.28,
                scaleX: prefersReducedMotion ? 1 : 0.94,
              }}
              animate={{ opacity: 1, y: 0, scaleY: 1, scaleX: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.9,
                ease: [0.16, 1, 0.3, 1],
                delay: prefersReducedMotion ? 0 : 0.08,
              }}
              style={{ transformOrigin: "center bottom" }}
            >
            <Link
              href="/"
              className="ml-2 inline-flex h-11 items-center justify-self-start sm:ml-3"
            >
              <Image
                src={isHeroVisible ? "/titan-logo.svg" : "/titan-logo-black.svg"}
                alt="Titan"
                width={48}
                height={48}
                className="block h-8 w-auto sm:h-9"
              />
            </Link>
            </motion.div>

            <motion.button
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Open menu"
              className={cn(
                "flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-colors duration-200",
                mobileMenuOpen
                  ? "border-[#213024] bg-[#213024] text-[#e1ded6]"
                  : isHeroVisible
                    ? "border-white/30 text-[var(--color-warm-50)]"
                    : "border-[color:color-mix(in_srgb,var(--color-foreground)_15%,transparent)] text-[var(--color-foreground)]"
              )}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.56,
                ease: [0.16, 1, 0.3, 1],
                delay: prefersReducedMotion ? 0 : 0.14,
              }}
            >
              {mobileMenuOpen ? (
                <X className="h-[18px] w-[18px]" />
              ) : (
                <Menu className="h-[18px] w-[18px]" />
              )}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mt-2 w-full rounded-xl bg-[var(--color-background)] px-4 py-4 text-[var(--color-foreground)] shadow-[0_14px_28px_rgba(0,0,0,0.06)] sm:ml-auto sm:max-w-[360px]"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -10, scale: prefersReducedMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8, scale: prefersReducedMotion ? 1 : 0.985 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid gap-y-1">
              {menuLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "inline-flex items-center justify-between rounded-xl px-3 py-2.5 text-[18px] leading-[1.25] tracking-[-0.02em] transition-colors duration-200",
                      isActive
                        ? "bg-[var(--color-secondary)] text-[var(--color-foreground)]"
                        : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]"
                    )}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {mounted && (
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                <ConnectButton inMobileMenu />
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
