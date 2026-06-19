"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { LANGUAGES, languageByCode } from "@/lib/languages";
import { cn } from "@/lib/utils";

export function LanguageToggle({
  className,
  align = "right",
}: {
  className?: string;
  align?: "left" | "right";
}) {
  const { language, setLanguage } = useApp();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = languageByCode(language);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Choose language"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border bg-surface px-3 text-sm font-medium transition-colors",
          open
            ? "border-navy/40 text-navy"
            : "border-line text-muted hover:border-navy/30 hover:text-navy"
        )}
      >
        <Globe className="h-4 w-4 text-brass" strokeWidth={1.8} />
        <span className="text-navy">{current.native}</span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-faint">
          {current.code}
        </span>
        <svg
          width="11"
          height="7"
          viewBox="0 0 12 8"
          fill="none"
          className={cn(
            "text-faint transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          <path
            d="M1 1l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
            aria-label="Language"
            className={cn(
              "absolute z-50 mt-2 w-60 overflow-hidden rounded-lg border border-line bg-surface shadow-lift",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-faint">
                Language
              </span>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-faint">
                {LANGUAGES.length} available
              </span>
            </div>
            <ul className="max-h-72 overflow-y-auto py-1">
              {LANGUAGES.map((l) => {
                const selected = l.code === language;
                return (
                  <li key={l.code} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage(l.code);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-3.5 py-2 text-left transition-colors",
                        selected ? "bg-paper" : "hover:bg-paper-2"
                      )}
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span
                          className={cn(
                            "truncate text-sm",
                            selected
                              ? "font-semibold text-navy"
                              : "font-medium text-ink"
                          )}
                        >
                          {l.native}
                        </span>
                        <span className="truncate text-xs text-faint">
                          {l.english}
                        </span>
                      </span>
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-faint">
                        {l.code}
                      </span>
                      <span className="grid w-4 place-items-center">
                        {selected && (
                          <Check
                            className="h-3.5 w-3.5 text-brass"
                            strokeWidth={3}
                          />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
