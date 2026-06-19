"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type {
  UserProfile,
  EligibilityResult,
  ActionPlanResponse,
} from "./types";
import { isLanguageCode } from "./languages";

// BCP 47 code (e.g. "en", "es", "zh"). See lib/languages.ts for the offered set.
export type Language = string;

interface AppState {
  language: Language;
  setLanguage: (l: Language) => void;
  profile: UserProfile | null;
  results: EligibilityResult[] | null;
  actionPlan: ActionPlanResponse | null;
  setCase: (data: {
    profile: UserProfile;
    results: EligibilityResult[];
    actionPlan: ActionPlanResponse | null;
  }) => void;
  reset: () => void;
}

const AppContext = createContext<AppState | null>(null);

const KEY = "bn:case";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [results, setResults] = useState<EligibilityResult[] | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlanResponse | null>(null);

  // hydrate from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setProfile(parsed.profile ?? null);
        setResults(parsed.results ?? null);
        setActionPlan(parsed.actionPlan ?? null);
      }
      const lang = localStorage.getItem("bn:lang");
      if (lang && isLanguageCode(lang)) setLanguageState(lang);
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    try {
      localStorage.setItem("bn:lang", l);
    } catch {
      // ignore
    }
  }, []);

  const setCase = useCallback(
    (data: {
      profile: UserProfile;
      results: EligibilityResult[];
      actionPlan: ActionPlanResponse | null;
    }) => {
      setProfile(data.profile);
      setResults(data.results);
      setActionPlan(data.actionPlan);
      try {
        sessionStorage.setItem(KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
    },
    []
  );

  const reset = useCallback(() => {
    setProfile(null);
    setResults(null);
    setActionPlan(null);
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        profile,
        results,
        actionPlan,
        setCase,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
