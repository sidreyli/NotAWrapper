import type { ActionCenterState } from "@/types/api";

const KEY = "aid-compass-action-center";
const TTL_MS = 2 * 60 * 60 * 1000;

const EMPTY: ActionCenterState = {
  savedAt: 0,
  documentAnalyses: [],
  savedResources: [],
  timeline: null
};

export function loadActionCenter(): ActionCenterState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as ActionCenterState;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(KEY);
      return { ...EMPTY };
    }
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

export function saveActionCenter(patch: Partial<ActionCenterState>): ActionCenterState {
  const next = {
    ...loadActionCenter(),
    ...patch,
    savedAt: Date.now()
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // The Action Center remains usable when browser storage is unavailable.
  }
  return next;
}

export function clearActionCenter(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Best-effort local cleanup.
  }
}
