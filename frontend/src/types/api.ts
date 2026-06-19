export type Language = "en" | "es";

export type EligibilityStatus =
  | "likely_eligible"
  | "possibly_eligible"
  | "likely_ineligible"
  | "unable_to_determine"
  | "already_receiving";

export type IncomeType = "wages" | "self_employment" | "no_income" | "variable" | "mixed";
export type EmploymentStatus =
  | "employed_full"
  | "employed_part"
  | "unemployed"
  | "self_employed"
  | "not_seeking";
export type HousingStatus = "owns" | "rents" | "subsidized" | "shelter" | "unhoused" | "other";
export type CitizenshipStatus =
  | "citizen"
  | "permanent_resident"
  | "qualified_alien"
  | "undocumented"
  | "prefer_not_to_say";

export interface UserProfile {
  session_id: string;
  state: string;
  household_size: number;
  adults: number;
  children_under_18: number;
  infants_under_5: number;
  pregnant_women: number;
  elderly_members: number;
  has_disability: boolean;
  monthly_gross_income: number;
  income_type: IncomeType;
  employment_status: EmploymentStatus;
  housing_status: HousingStatus;
  current_benefits: string[];
  citizenship_status: CitizenshipStatus;
  language: Language;
  zip_code?: string | null;
  profile_complete: boolean;
  collected_at?: string | null;
}

export interface EligibilityFactor {
  factor_name: string;
  user_value: string;
  threshold: string;
  passes: boolean;
  note?: string | null;
}

export interface EligibilityResult {
  program_id: string;
  program_name: string;
  status: EligibilityStatus;
  confidence: number;
  reason: string;
  eligibility_factors: EligibilityFactor[];
  estimated_monthly_benefit?: string | null;
  required_documents: string[];
  apply_url: string;
  more_info_url: string;
  data_source: string;
  data_as_of: string;
}

export interface EligibilityResponse {
  results: EligibilityResult[];
  checked_at: string;
}

export interface ActionPlanResponse {
  action_plan_text: string;
  profile: UserProfile;
  results: EligibilityResult[];
  generated_at: string;
  disclaimer: string;
}

export interface CliffDataPoint {
  monthly_income: number;
  snap_benefit: number;
  medicaid_value: number;
  chip_value: number;
  liheap_value: number;
  wic_value: number;
  total_benefit_value: number;
  net_resources: number;
}

export interface CliffZone {
  income_start: number;
  income_end: number;
  description: string;
  benefit_lost: string;
  net_change: number;
}

export interface CliffResponse {
  profile: UserProfile;
  data_points: CliffDataPoint[];
  cliff_zones: CliffZone[];
  calculated_at: string;
}

export interface ApiErrorBody {
  error: string;
  code: string;
  status: number;
}
