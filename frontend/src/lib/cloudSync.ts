import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { clearActionCenter, loadActionCenter, saveActionCenter } from "./actionCenterStore";
import { clearSession, loadSession, saveSession, type PersistedSession } from "./sessionStore";
import type { ActionCenterState } from "@/types/api";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const cloudStorageConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export interface CloudCaseFilePayload {
  version: 1;
  saved_at: string;
  action_center: ActionCenterState;
  eligibility: PersistedSession | null;
}

export interface CloudCaseFileRow {
  user_id: string;
  schema_version: number;
  payload: CloudCaseFilePayload;
  updated_at: string;
}

interface ClerkSessionLike {
  getToken: () => Promise<string | null>;
}

export function createClerkSupabaseClient(session: ClerkSessionLike): SupabaseClient {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Cloud storage is not configured");
  }
  return createClient(supabaseUrl, supabasePublishableKey, {
    accessToken: async () => session.getToken()
  });
}

export function captureLocalCaseFile(): CloudCaseFilePayload {
  const actionCenter = loadActionCenter();
  const reviewedActionCenter: ActionCenterState = {
    ...actionCenter,
    documentAnalyses: actionCenter.documentAnalyses.map((analysis) => ({
      ...analysis,
      fields: analysis.fields.filter(
        (field) => !analysis.accepted_fields || analysis.accepted_fields.includes(field.key)
      ),
      deadlines: analysis.deadlines.filter(
        (_, index) => !analysis.accepted_deadlines || analysis.accepted_deadlines.includes(index)
      )
    }))
  };
  const eligibility = loadSession();
  return {
    version: 1,
    saved_at: new Date().toISOString(),
    action_center: reviewedActionCenter,
    eligibility: eligibility
      ? { ...eligibility, sessionId: null, messages: [], learnHistory: [] }
      : null
  };
}

export function restoreCloudCaseFile(payload: CloudCaseFilePayload): void {
  clearActionCenter();
  saveActionCenter(payload.action_center);
  clearSession();
  if (payload.eligibility) saveSession(payload.eligibility);
}
