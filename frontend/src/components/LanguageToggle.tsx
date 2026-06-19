import type { Language } from "../types/api";

export function LanguageToggle({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return (
    <div className="inline-flex rounded-full border border-border bg-surface p-1 text-sm font-extrabold" aria-label="Language">
      {(["en", "es"] as const).map((item) => (
        <button
          key={item}
          className={`rounded-full px-4 py-2 transition ${
            language === item ? "bg-dark text-white" : "text-muted hover:bg-softAqua"
          }`}
          onClick={() => onChange(item)}
          type="button"
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
