import type {
  ActionPlanResponse,
  ActionTimeline,
  CalendarAuthorizeResponse,
  CalendarEventsResponse,
  ApiErrorBody,
  ChatTurn,
  CliffResponse,
  EligibilityResponse,
  EligibilityResult,
  IntakeResponse,
  Language,
  ResourcesResponse,
  ProgramChatResponse,
  UserProfile
} from "../types/api";
import type { DocumentAnalysis } from "../types/api";
import { makeSampleActionPlan, makeSampleCliff, sampleResults } from "./sampleData";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init
  });

  if (!response.ok) {
    let body: ApiErrorBody | undefined;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    throw new Error(body?.error ?? body?.detail ?? `Request failed: ${response.status}`);
  }

  return response.json();
}

export async function buildTimeline(input: {
  program_ids: string[];
  document_analyses: DocumentAnalysis[];
  selected_resources: import("../types/api").LocalResource[];
  target_date: string;
}): Promise<ActionTimeline> {
  return requestJson<ActionTimeline>("/api/timeline/build", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function getCalendarStatus(): Promise<CalendarAuthorizeResponse> {
  return requestJson<CalendarAuthorizeResponse>("/api/calendar/google/status");
}

export async function getCalendarAuthorization(): Promise<CalendarAuthorizeResponse> {
  return requestJson<CalendarAuthorizeResponse>("/api/calendar/google/authorize");
}

export async function createCalendarEvents(
  authorizationCode: string,
  state: string,
  tasks: import("../types/api").ActionTask[]
): Promise<CalendarEventsResponse> {
  return requestJson<CalendarEventsResponse>("/api/calendar/google/events", {
    method: "POST",
    body: JSON.stringify({ authorization_code: authorizationCode, state, tasks })
  });
}

export async function findResources(
  zipCode: string,
  program: string,
  travelMode: string
): Promise<ResourcesResponse> {
  const params = new URLSearchParams({ zip_code: zipCode, travel_mode: travelMode });
  if (program) params.set("program", program);
  return requestJson<ResourcesResponse>(`/api/resources?${params.toString()}`);
}

export async function analyzeDocument(file: File, programIds: string[]): Promise<DocumentAnalysis> {
  const form = new FormData();
  form.append("file", file);
  form.append("program_ids", programIds.join(","));
  const response = await fetch(apiUrl("/api/documents/analyze"), { method: "POST", body: form });
  if (!response.ok) {
    let message = `Document analysis failed: ${response.status}`;
    try {
      const body = await response.json() as { detail?: string; error?: string };
      message = body.detail ?? body.error ?? message;
    } catch {
      // Use the status-based message.
    }
    throw new Error(message);
  }
  return response.json();
}

// --- Intake chat (no sample fallback: a live conversation must surface errors) ---

export async function startIntake(): Promise<IntakeResponse> {
  return requestJson<IntakeResponse>("/api/intake/start", { method: "POST" });
}

export async function sendIntakeMessage(
  sessionId: string | null,
  message: string,
  history: ChatTurn[]
): Promise<IntakeResponse> {
  return requestJson<IntakeResponse>("/api/intake/message", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, message, history })
  });
}

export async function programChat(
  profile: UserProfile,
  results: EligibilityResult[],
  language: Language,
  history: ChatTurn[],
  message: string
): Promise<string> {
  const response = await requestJson<ProgramChatResponse>("/api/explain/chat", {
    method: "POST",
    body: JSON.stringify({ profile, results, language, history, message })
  });
  return response.reply;
}

export async function checkEligibility(profile: UserProfile): Promise<EligibilityResult[]> {
  try {
    const response = await requestJson<EligibilityResponse>("/api/eligibility/check", {
      method: "POST",
      body: JSON.stringify(profile)
    });
    return response.results;
  } catch {
    return sampleResults;
  }
}

export async function getActionPlan(
  profile: UserProfile,
  results: EligibilityResult[],
  language: Language
): Promise<ActionPlanResponse> {
  try {
    return await requestJson<ActionPlanResponse>("/api/explain/action-plan", {
      method: "POST",
      body: JSON.stringify({ profile, results, language })
    });
  } catch {
    return makeSampleActionPlan(profile, results);
  }
}

export async function calculateCliff(profile: UserProfile, maxIncome = 5000): Promise<CliffResponse> {
  try {
    return await requestJson<CliffResponse>("/api/cliff/calculate", {
      method: "POST",
      body: JSON.stringify({ profile, min_income: 0, max_income: maxIncome, step: 50 })
    });
  } catch {
    return makeSampleCliff(profile);
  }
}
