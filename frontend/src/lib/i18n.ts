import type { EligibilityStatus, Language } from "../types/api";

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

export function t(language: Language, key: keyof typeof copy.en): string {
  const value = copy[language][key];
  return typeof value === "string" ? value : key;
}

export function statusLabel(language: Language, status: EligibilityStatus): string {
  return copy[language].status[status];
}
