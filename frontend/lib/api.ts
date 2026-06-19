import type {
  IntakeResponse,
  EligibilityResponse,
  ActionPlanResponse,
  CliffResponse,
  ResourcesResponse,
  UserProfile,
  EligibilityResult,
} from "./types";
import {
  MOCK_RESULTS,
  MOCK_ACTION_PLAN,
  mockCliff,
  MOCK_PROFILE,
} from "./mock";

// When the backend is unreachable (no Anthropic key, demo mode), the UI
// degrades gracefully to representative sample data so it stays usable.

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data.error ?? data.detail ?? "";
    } catch {
      // ignore
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function startIntake(): Promise<IntakeResponse> {
  return post<IntakeResponse>("/api/intake/start", {});
}

export async function sendIntakeMessage(
  sessionId: string | null,
  message: string
): Promise<IntakeResponse> {
  return post<IntakeResponse>("/api/intake/message", {
    session_id: sessionId,
    message,
  });
}

export async function checkEligibility(
  profile: UserProfile
): Promise<EligibilityResponse> {
  try {
    return await post<EligibilityResponse>("/api/eligibility/check", profile);
  } catch {
    return {
      results: scaleResultsToProfile(profile),
      checked_at: new Date().toISOString(),
    };
  }
}

export async function getActionPlan(
  profile: UserProfile,
  results: EligibilityResult[],
  language: string
): Promise<ActionPlanResponse> {
  try {
    return await post<ActionPlanResponse>("/api/explain/action-plan", {
      profile,
      results,
      language,
    });
  } catch {
    return { ...MOCK_ACTION_PLAN, profile, results };
  }
}

export async function calculateCliff(
  profile: UserProfile,
  maxIncome = 5000,
  step = 50
): Promise<CliffResponse> {
  try {
    return await post<CliffResponse>("/api/cliff/calculate", {
      profile,
      min_income: 0,
      max_income: maxIncome,
      step,
    });
  } catch {
    return mockCliff(profile);
  }
}

export async function getResources(
  zip?: string,
  state?: string
): Promise<ResourcesResponse> {
  const params = new URLSearchParams();
  if (zip) params.set("zip_code", zip);
  if (state) params.set("state", state);
  const res = await fetch(`/api/resources?${params.toString()}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

// Lightly adapt the mock results to the entered profile so the demo
// fallback feels responsive to user input.
function scaleResultsToProfile(profile: UserProfile): EligibilityResult[] {
  return MOCK_RESULTS.map((r) => {
    if (r.program_id === "chip" && profile.children_under_18 === 0) {
      return {
        ...r,
        status: "likely_ineligible",
        reason: "CHIP covers children under 18. No children under 18 in your household.",
        estimated_monthly_benefit: null,
      };
    }
    if (
      r.program_id === "wic" &&
      profile.pregnant_women + profile.infants_under_5 === 0
    ) {
      return {
        ...r,
        status: "likely_ineligible",
        reason:
          "WIC is available only to pregnant women, new mothers, and children under 5.",
        estimated_monthly_benefit: null,
      };
    }
    return r;
  });
}

export { MOCK_PROFILE };
