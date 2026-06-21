import { Globe } from "lucide-react";
import type { Language } from "@/types/api";
import { LANGUAGES } from "@/lib/i18n";

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
    <label
      className={`relative inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${
        light ? "border-white/20 bg-white/10 text-white backdrop-blur" : "border-border bg-paper text-ink"
      }`}
    >
      <Globe className="h-4 w-4 opacity-80" aria-hidden />
      <span className="sr-only">Language</span>
      <select
        value={language}
        onChange={(event) => onChange(event.target.value)}
        className={`cursor-pointer appearance-none bg-transparent pr-4 font-semibold outline-none ${
          light ? "text-white" : "text-ink"
        }`}
      >
        {LANGUAGES.map((lang) => (
          // option text always renders on the native menu's own surface, so
          // force readable colors regardless of the trigger's tone.
          <option key={lang.code} value={lang.code} className="text-ink">
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
