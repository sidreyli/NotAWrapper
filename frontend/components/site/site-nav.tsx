"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "./logo";
import { LanguageToggle } from "./language-toggle";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/navigator", label: "Caseworker mode" },
  { href: "/cliff", label: "Benefits cliff" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-paper/85 backdrop-blur-md"
          : "border-b border-transparent"
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Benefits Navigator — home">
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                pathname === l.href
                  ? "text-navy"
                  : "text-muted hover:text-navy"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <ButtonLink href="/intake" size="sm" variant="primary">
            Start
          </ButtonLink>
        </div>

        {/* mobile */}
        <button
          className="grid h-10 w-10 place-items-center rounded-sm border border-line bg-surface md:hidden"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3 w-4">
            <span
              className={cn(
                "absolute left-0 h-[1.5px] w-4 bg-navy transition-all",
                open ? "top-1.5 rotate-45" : "top-0"
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1.5 h-[1.5px] w-4 bg-navy transition-all",
                open && "opacity-0"
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-[1.5px] w-4 bg-navy transition-all",
                open ? "top-1.5 -rotate-45" : "top-3"
              )}
            />
          </span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-paper px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-sm px-3 py-2.5 text-sm font-medium text-navy hover:bg-paper-2"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <LanguageToggle align="left" />
            <ButtonLink href="/intake" size="sm">
              Start
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
