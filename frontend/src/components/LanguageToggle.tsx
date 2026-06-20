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
      className={`inline-flex items-center rounded-full border p-1 text-sm font-semibold ${
        light ? "border-white/20 bg-white/10 backdrop-blur" : "border-border bg-paper"
      }`}
    >
      {(["en", "es"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={`rounded-full px-3.5 py-1.5 uppercase tracking-wide transition ${
            language === lang
              ? light
                ? "bg-white text-emerald-800 shadow-sm"
                : "bg-ink text-white"
              : light
                ? "text-white/75 hover:text-white"
                : "text-haze hover:text-ink"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
