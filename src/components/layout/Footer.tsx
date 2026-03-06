"use client";

import Link from "next/link";
import Image from "next/image";
import { config } from "@/config";

const links = [
  { href: config.links.docs, label: "Docs" },
  { href: config.links.github, label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="bg-[var(--color-background)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 py-6 md:flex-row md:justify-between">
          {/* Left: Brand */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/titan-logo-black.svg"
              alt="Titan"
              width={32}
              height={32}
            />
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              Titan
            </span>
          </Link>

          {/* Center: Links */}
          <nav className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Built by */}
          <span className="text-sm text-[var(--color-muted-foreground)]">
            Built by{" "}
            <a
              href="https://pzza.works"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-foreground)] hover:underline"
            >
              Berke
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
