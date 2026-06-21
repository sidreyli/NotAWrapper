import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAppState } from "@/state/AppState";
import type { Language } from "@/types/api";
import en from "./locales/en.json";
import languages from "./languages.json";

// The dropdown options. `code` is a BCP 47 tag; `label` is the language's own
// endonym so speakers recognise it without translation.
export const LANGUAGES: { code: Language; label: string }[] = languages;

export type Messages = typeof en;
export type MessageKey = keyof Messages;

// Right-to-left scripts get `dir="rtl"` on <html>.
const RTL = new Set(["ar", "ur", "fa"]);

// One lazily-loaded, code-split JSON bundle per locale (Vite glob import).
const loaders = import.meta.glob("./locales/*.json");
const cache: Record<string, Record<string, string>> = { en: en as Record<string, string> };

async function loadMessages(code: string): Promise<Record<string, string>> {
  if (cache[code]) return cache[code];
  const loader = loaders[`./locales/${code}.json`];
  if (!loader) return cache.en;
  try {
    const mod = (await loader()) as { default: Record<string, string> };
    cache[code] = mod.default;
    return mod.default;
  } catch {
    return cache.en;
  }
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`));
}

export type TFunction = (key: MessageKey, vars?: Record<string, string | number>) => string;

interface I18nValue {
  language: Language;
  t: TFunction;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { language } = useAppState();
  const [messages, setMessages] = useState<Record<string, string>>(cache[language] ?? cache.en);

  // Load the active locale's strings (English is bundled and instant; the rest
  // stream in and swap, falling back to English per-key until they arrive).
  useEffect(() => {
    let active = true;
    loadMessages(language).then((next) => {
      if (active) setMessages(next);
    });
    return () => {
      active = false;
    };
  }, [language]);

  const dir: "ltr" | "rtl" = RTL.has(language) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const value = useMemo<I18nValue>(() => {
    const t: TFunction = (key, vars) => {
      const raw = messages[key] ?? (en as Record<string, string>)[key] ?? (key as string);
      return interpolate(raw, vars);
    };
    return { language, t, dir };
  }, [language, messages, dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useT(): TFunction {
  return useI18n().t;
}

// Maps an EligibilityStatus to its translated label (keys live under `status.*`).
export function useStatusLabel(): (status: string) => string {
  const t = useT();
  return (status: string) => t(`status.${status}` as MessageKey);
}
