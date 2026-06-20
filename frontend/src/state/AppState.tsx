import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ActionPlanResponse, EligibilityResult, Language, UserProfile } from "../types/api";
import { makeSampleActionPlan, sampleProfile, sampleResults } from "../lib/sampleData";
import { clearSession, loadSession } from "../lib/sessionStore";
import { clearActionCenter } from "../lib/actionCenterStore";

interface AppState {
  language: Language;
  setLanguage: (language: Language) => void;
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  results: EligibilityResult[];
  setResults: (results: EligibilityResult[]) => void;
  actionPlan: ActionPlanResponse;
  setActionPlan: (plan: ActionPlanResponse) => void;
  selectedProgramId: string | null;
  setSelectedProgramId: (id: string | null) => void;
  reset: () => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const initialLanguage = (localStorage.getItem("notawrapper-language") as Language | null) ?? "en";
  // Rehydrate real results from a non-expired session (2h) so navigation and
  // refreshes keep the person's results instead of falling back to sample data.
  const persisted = loadSession();
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [profile, setProfile] = useState<UserProfile>(
    persisted?.profile ?? { ...sampleProfile, language: initialLanguage }
  );
  const [results, setResults] = useState<EligibilityResult[]>(persisted?.results ?? sampleResults);
  const [actionPlan, setActionPlan] = useState<ActionPlanResponse>(
    persisted?.actionPlan ?? makeSampleActionPlan(profile)
  );
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("notawrapper-language", language);
    setProfile((current) => ({ ...current, language }));
  }, [language]);

  const value = useMemo<AppState>(
    () => ({
      language,
      setLanguage: setLanguageState,
      profile,
      setProfile,
      results,
      setResults,
      actionPlan,
      setActionPlan,
      selectedProgramId,
      setSelectedProgramId,
      reset: () => {
        clearSession();
        clearActionCenter();
        const nextProfile = { ...sampleProfile, language };
        setProfile(nextProfile);
        setResults(sampleResults);
        setActionPlan(makeSampleActionPlan(nextProfile));
        setSelectedProgramId(null);
      }
    }),
    [actionPlan, language, profile, results, selectedProgramId]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
