// BCP 47 language code (e.g. "en", "es", "zh", "vi"). The backend explainer
// LLM responds in whichever code we send, so this is intentionally open-ended.
// The full list of options offered in the UI lives in `i18n/languages.json` (LANGUAGES).
export type Language = string;

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

export interface IntakeResponse {
  session_id: string;
  reply: string;
  is_complete: boolean;
  profile?: UserProfile | null;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ProgramChatResponse {
  reply: string;
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
  error?: string;
  detail?: string;
  code?: string;
  status?: number;
}

export interface ExtractedDocumentField {
  key: string;
  label: string;
  value: string;
  confidence: number;
  evidence: string;
  page?: number | null;
  sensitive?: boolean;
}

export interface DetectedDeadline {
  label: string;
  date?: string | null;
  evidence: string;
  confidence: number;
  page?: number | null;
}

export interface DocumentChecklistMatch {
  program_id: string;
  requirement: string;
  status: "matched" | "possible" | "missing";
  reason: string;
}

export interface DocumentAnalysis {
  id: string;
  file_name: string;
  document_type: string;
  summary: string;
  fields: ExtractedDocumentField[];
  deadlines: DetectedDeadline[];
  checklist_matches: DocumentChecklistMatch[];
  warnings: string[];
  processed_at: string;
  accepted_fields?: string[];
  accepted_deadlines?: number[];
}

export interface LocalResource {
  id: string;
  name: string;
  category: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  lat?: number | null;
  lon?: number | null;
  open_now?: boolean | null;
  hours?: string[];
  directions_url?: string | null;
  distance_meters?: number | null;
  travel_duration_minutes?: number | null;
  program_ids?: string[];
  source: string;
}

export interface ResourcesResponse {
  resources: LocalResource[];
  source: string;
  zip_code?: string | null;
  center_lat?: number | null;
  center_lon?: number | null;
  message?: string | null;
}

export type TimelineDateSource = "official" | "extracted" | "suggested";

export interface ActionTask {
  id: string;
  title: string;
  description: string;
  kind: "document" | "call" | "visit" | "apply" | "follow_up" | "deadline";
  due_at: string;
  date_source: TimelineDateSource;
  program_id?: string | null;
  duration_minutes?: number | null;
  location?: string | null;
  url?: string | null;
  completed: boolean;
}

export interface ActionTimeline {
  tasks: ActionTask[];
  generated_at: string;
}

export interface ActionCenterState {
  savedAt: number;
  documentAnalyses: DocumentAnalysis[];
  savedResources: LocalResource[];
  timeline: ActionTimeline | null;
}

export interface CalendarAuthorizeResponse {
  configured: boolean;
  authorization_url?: string | null;
}

export interface CalendarEventsResponse {
  created: number;
  skipped: number;
  errors: string[];
}
