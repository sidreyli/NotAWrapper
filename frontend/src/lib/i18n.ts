import type { EligibilityStatus, Language } from "../types/api";

// Languages offered in the header dropdown. `code` is a BCP 47 tag sent to the
// backend explainer (the LLM answers the action plan in that language); `label`
// is the language's own endonym so speakers recognise it without translation.
// Static UI chrome is fully translated for `en` and `es` and falls back to
// English for the rest (the personalised action plan is always localised).
export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "tl", label: "Tagalog" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
  { code: "ht", label: "Kreyòl Ayisyen" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "ur", label: "اردو" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "pl", label: "Polski" },
  { code: "ja", label: "日本語" },
  { code: "km", label: "ខ្មែរ" },
  { code: "hmn", label: "Hmoob" },
  { code: "so", label: "Soomaali" },
  { code: "am", label: "አማርኛ" },
  { code: "fa", label: "فارسی" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" }
];

const copy = {
  en: {
    navHow: "How it works",
    navPrograms: "Programs",
    navWhy: "Why Aid Compass",
    navFaq: "FAQ",
    navAll: "All screens",
    checkEligibility: "Check eligibility",
    getStarted: "Get started",
    seeHow: "How it works",
    results: "Results",
    back: "Back",
    continue: "Continue",
    startOver: "Start over",
    viewDetails: "View details",
    whyResult: "Why this result?",
    documents: "Documents",
    print: "Print plan",
    benefitsCliff: "See your benefits cliff",
    status: {
      likely_eligible: "Likely eligible",
      possibly_eligible: "Worth a look",
      likely_ineligible: "Probably not a fit",
      unable_to_determine: "Needs review",
      already_receiving: "Already receiving"
    }
  },
  es: {
    navHow: "Como funciona",
    navPrograms: "Programas",
    navWhy: "Por que confiar",
    navFaq: "Preguntas",
    navAll: "Pantallas",
    checkEligibility: "Revisar elegibilidad",
    getStarted: "Empezar",
    seeHow: "Ver como funciona",
    results: "Resultados",
    back: "Atras",
    continue: "Continuar",
    startOver: "Empezar de nuevo",
    viewDetails: "Ver detalles",
    whyResult: "Por que este resultado?",
    documents: "Documentos",
    print: "Imprimir plan",
    benefitsCliff: "Ver cambios por ingreso",
    status: {
      likely_eligible: "Probablemente elegible",
      possibly_eligible: "Vale la pena revisar",
      likely_ineligible: "Probablemente no aplica",
      unable_to_determine: "Necesita revision",
      already_receiving: "Ya lo recibe"
    }
  }
} satisfies Record<Language, Record<string, unknown>>;

// UI chrome is only fully authored for en/es; everything else falls back to
// English so an unfinished translation never blanks out a label.
function table(language: Language): (typeof copy)[keyof typeof copy] {
  return copy[language as keyof typeof copy] ?? copy.en;
}

export function t(language: Language, key: keyof typeof copy.en): string {
  const value = table(language)[key] ?? copy.en[key];
  return typeof value === "string" ? value : key;
}

export function statusLabel(language: Language, status: EligibilityStatus): string {
  return table(language).status[status] ?? copy.en.status[status];
}
