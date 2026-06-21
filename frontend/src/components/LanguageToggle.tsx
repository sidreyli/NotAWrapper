import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe } from "lucide-react";
import type { Language } from "@/types/api";
import { LANGUAGES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function LanguageToggle({
  language,
  onChange,
  tone = "dark"
}: {
  language: Language;
  onChange: (language: Language) => void;
  tone?: "dark" | "light";
}) {
  const light = tone === "light";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const active = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          light
            ? "border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/[0.18] focus-visible:ring-white/40 focus-visible:ring-offset-transparent"
            : "border-border bg-paper text-ink hover:border-emerald-200 hover:bg-mint/60 focus-visible:ring-emerald-300 focus-visible:ring-offset-background"
        )}
      >
        <Globe className="h-4 w-4 opacity-80" strokeWidth={1.8} aria-hidden />
        <span className="sr-only">Language</span>
        <span className="min-w-[2.5rem] text-left leading-none">{active.label}</span>
        <ChevronDown
          className={cn("h-4 w-4 opacity-70 transition-transform duration-200", open && "rotate-180")}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease }}
            className={cn(
              "absolute right-0 z-50 mt-2 max-h-[min(20rem,60vh)] w-52 origin-top-right overflow-y-auto rounded-2xl border p-1.5 shadow-2xl",
              light
                ? "glass-emerald border-white/12 text-emerald-50"
                : "border-border bg-paper text-ink shadow-[0_24px_60px_-24px_rgba(10,28,22,0.45)]"
            )}
          >
            {LANGUAGES.map((lang) => {
              const selected = lang.code === language;
              return (
                <li key={lang.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(lang.code);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      light
                        ? selected
                          ? "bg-white/15 text-white"
                          : "text-emerald-50/80 hover:bg-white/10 hover:text-white"
                        : selected
                          ? "bg-mint text-emerald-700"
                          : "text-haze hover:bg-mint/60 hover:text-ink"
                    )}
                  >
                    <span className="truncate">{lang.label}</span>
                    {selected && (
                      <Check
                        className={cn("h-4 w-4 shrink-0", light ? "text-gold-300" : "text-emerald-600")}
                        strokeWidth={2.4}
                        aria-hidden
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
