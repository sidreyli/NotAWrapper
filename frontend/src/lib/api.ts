import type {
  ActionPlanResponse,
  ApiErrorBody,
  CliffResponse,
  EligibilityResponse,
  EligibilityResult,
  Language,
  UserProfile
} from "../types/api";
import { makeSampleActionPlan, makeSampleCliff, sampleResults } from "./sampleData";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
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
    throw new Error(body?.error ?? `Request failed: ${response.status}`);
  }

  return response.json();
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
