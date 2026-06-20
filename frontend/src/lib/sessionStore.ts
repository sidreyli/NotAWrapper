import type { ActionPlanResponse, ChatTurn, EligibilityResult, UserProfile } from "../types/api";

// A single persisted bundle for the eligibility experience. Kept for 2 hours so a
// person can leave the page (or refresh) and come back to their results and chat
// exactly where they left off. No PII guarantees change here — this is the same
// non-sensitive profile the user already shared in-session.

const KEY = "notawrapper-session";
const TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export type Phase = "intake" | "checking" | "learn";

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export interface PersistedSession {
  savedAt: number;
  phase: Phase;
  sessionId: string | null;
  messages: ChatMessage[];
  learnHistory: ChatTurn[];
  profile?: UserProfile;
  results?: EligibilityResult[];
  actionPlan?: ActionPlanResponse;
}

const EMPTY: Omit<PersistedSession, "savedAt"> = {
  phase: "intake",
  sessionId: null,
  messages: [],
  learnHistory: []
};

export function loadSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(patch: Partial<PersistedSession>): void {
  try {
    const existing = loadSession();
    const next: PersistedSession = {
      ...EMPTY,
      ...(existing ?? {}),
      ...patch,
      savedAt: Date.now()
    };
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable or full — persistence is best-effort, never fatal.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
