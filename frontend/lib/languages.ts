// Languages offered in the UI. `code` is a BCP 47 tag sent to the backend as the
// `language` field; the explainer LLM responds in that language. `native` is shown
// in the picker so speakers recognize their own language; `english` is the latin
// label used for search/accessibility. Ordered roughly by US limited-English-
// proficiency prevalence (per ACS), English first.
export interface LanguageOption {
  code: string;
  native: string;
  english: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", native: "English", english: "English" },
  { code: "es", native: "Español", english: "Spanish" },
  { code: "zh", native: "中文", english: "Chinese" },
  { code: "vi", native: "Tiếng Việt", english: "Vietnamese" },
  { code: "tl", native: "Tagalog", english: "Tagalog" },
  { code: "ko", native: "한국어", english: "Korean" },
  { code: "ru", native: "Русский", english: "Russian" },
  { code: "ar", native: "العربية", english: "Arabic" },
  { code: "ht", native: "Kreyòl Ayisyen", english: "Haitian Creole" },
  { code: "fr", native: "Français", english: "French" },
  { code: "pt", native: "Português", english: "Portuguese" },
  { code: "hi", native: "हिन्दी", english: "Hindi" },
  { code: "bn", native: "বাংলা", english: "Bengali" },
  { code: "ur", native: "اردو", english: "Urdu" },
  { code: "pl", native: "Polski", english: "Polish" },
  { code: "so", native: "Soomaali", english: "Somali" },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

export function isLanguageCode(value: string): boolean {
  return LANGUAGE_CODES.includes(value);
}

export function languageByCode(code: string): LanguageOption {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
