"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@/components/wallet/ConnectButton";

const navLinks = [
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
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHomepage = pathname === "/";
  const isHeroVisible = isHomepage && !scrolled && !mobileMenuOpen;

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "mt-4 pl-6 pr-3 py-3 rounded-full transition-colors duration-300",
            scrolled || mobileMenuOpen
              ? "bg-white/95 backdrop-blur-sm shadow-[var(--shadow-subtle)]"
              : "bg-transparent"
          )}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={isHeroVisible ? "/titan-logo.svg" : "/titan-logo-black.svg"}
                alt="Titan"
                width={32}
                height={32}
              />
              <span className={cn(
                "text-lg font-semibold transition-colors duration-300",
                isHeroVisible ? "text-white" : "text-[var(--color-foreground)]"
              )}>
                Titan
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <div
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
                        isActive
                          ? isHeroVisible
                            ? "bg-white text-[var(--color-foreground)]"
                            : "bg-[var(--color-foreground)] text-white"
                          : isHeroVisible
                            ? "text-white/70 hover:text-white hover:bg-white/10"
                            : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/5"
                      )}
                    >
                      {link.label}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Wallet Connect Button - Desktop only */}
              {mounted && (
                <div className="hidden md:block">
                  <ConnectButton isHeroVisible={isHeroVisible} />
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className={cn(
                  "md:hidden p-2 rounded-full transition-colors cursor-pointer",
                  isHeroVisible
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-foreground)]/5"
                )}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Separate container */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 mx-2 p-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-[var(--shadow-subtle)]">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <div
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                        isActive
                          ? "bg-[var(--color-titan-green)] text-white"
                          : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/5"
                      )}
                    >
                      {link.label}
                    </div>
                  </Link>
                );
              })}
              {/* Wallet Connect Button - Mobile */}
              {mounted && (
                <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                  <ConnectButton inMobileMenu />
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
