import type { Language } from "@/types/api";

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
  return (
    <div
      className={`inline-flex items-center rounded-full border p-0.5 text-sm font-semibold ${
        light ? "border-white/25 bg-white/10 backdrop-blur" : "border-border bg-paper"
      }`}
    >
      {(["en", "es"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={`rounded-full px-3 py-1 uppercase tracking-wide transition ${
            language === lang
              ? light
                ? "bg-white text-emerald-800"
                : "bg-ink text-white"
              : light
                ? "text-white/70 hover:text-white"
                : "text-haze hover:text-ink"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
