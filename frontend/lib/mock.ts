import type {
  UserProfile,
  EligibilityResult,
  CliffResponse,
  CliffDataPoint,
  CliffZone,
  ActionPlanResponse,
} from "./types";

// A representative demo case so the experience is fully populated
// even when the backend is offline. Derived from the rules in CLAUDE.md.
export const MOCK_PROFILE: UserProfile = {
  session_id: "demo",
  state: "CA",
  household_size: 4,
  adults: 2,
  children_under_18: 2,
  infants_under_5: 1,
  pregnant_women: 0,
  elderly_members: 0,
  has_disability: false,
  monthly_gross_income: 2600,
  income_type: "wages",
  employment_status: "employed_part",
  housing_status: "rents",
  current_benefits: [],
  citizenship_status: "prefer_not_to_say",
  language: "en",
  zip_code: "94110",
  profile_complete: true,
};

export const MOCK_RESULTS: EligibilityResult[] = [
  {
    program_id: "snap",
    program_name: "SNAP",
    status: "likely_eligible",
    confidence: 0.85,
    reason:
      "Your household income is within the limit for a family of four in California. Based on standard deductions, you appear eligible for monthly grocery benefits.",
    eligibility_factors: [
      { factor_name: "Gross monthly income", user_value: "$2,600", threshold: "≤ $3,479", passes: true },
      { factor_name: "Net monthly income", user_value: "$1,876", threshold: "≤ $2,677", passes: true },
      { factor_name: "Household size", user_value: "4 people", threshold: "—", passes: true },
    ],
    estimated_monthly_benefit: "~$412/month (estimated)",
    required_documents: [
      "Photo ID (driver's license, state ID, or passport)",
      "Proof of residency (utility bill, lease, or recent mail)",
      "Social Security numbers for all household members applying",
      "Proof of income (recent pay stubs, employer letter, or most recent tax return)",
      "Proof of allowable expenses (rent/mortgage, utilities, childcare if claiming deductions)",
    ],
    apply_url: "https://www.getcalfresh.org/",
    more_info_url: "https://www.fns.usda.gov/snap/recipient/eligibility",
    data_source: "USDA Food and Nutrition Service",
    data_as_of: "FY2026 (October 2025)",
  },
  {
    program_id: "medicaid",
    program_name: "Medicaid",
    status: "likely_eligible",
    confidence: 0.9,
    reason:
      "California has expanded Medicaid (Medi-Cal). Your income is below 138% of the federal poverty level for your household, so the adults in your home appear to qualify.",
    eligibility_factors: [
      { factor_name: "State expansion", user_value: "Medi-Cal (expanded)", threshold: "Required", passes: true },
      { factor_name: "Income vs. limit", user_value: "$2,600", threshold: "≤ $3,041 (138% FPL)", passes: true },
    ],
    estimated_monthly_benefit: "~$400/month coverage value per adult (estimated)",
    required_documents: [
      "Photo ID",
      "Proof of income (pay stubs, tax return, or signed zero-income statement)",
      "Social Security number",
      "Proof of residency",
      "Immigration documentation if applicable",
    ],
    apply_url: "https://www.coveredca.com/medi-cal/",
    more_info_url: "https://www.medicaid.gov/medicaid/eligibility/index.html",
    data_source: "Centers for Medicare & Medicaid Services (CMS)",
    data_as_of: "2026",
  },
  {
    program_id: "chip",
    program_name: "CHIP",
    status: "likely_eligible",
    confidence: 0.85,
    reason:
      "Your two children are under 18 and household income is within California's CHIP limit (266% FPL), so they appear eligible for low-cost children's health coverage.",
    eligibility_factors: [
      { factor_name: "Children under 18", user_value: "2 children", threshold: "≥ 1", passes: true },
      { factor_name: "Income vs. limit", user_value: "$2,600", threshold: "≤ $5,862 (266% FPL)", passes: true },
    ],
    estimated_monthly_benefit: "~$400/month coverage value (estimated)",
    required_documents: [
      "Child's birth certificate",
      "Child's Social Security number",
      "Proof of household income",
      "Proof of residency",
      "Parent or guardian photo ID",
    ],
    apply_url: "https://www.coveredca.com/medi-cal/",
    more_info_url: "https://www.medicaid.gov/chip/index.html",
    data_source: "Centers for Medicare & Medicaid Services (CMS)",
    data_as_of: "2026",
  },
  {
    program_id: "wic",
    program_name: "WIC",
    status: "likely_eligible",
    confidence: 0.85,
    reason:
      "You have a child under 5. WIC provides supplemental food and nutrition support, and your household income is within the WIC limit (185% FPL).",
    eligibility_factors: [
      { factor_name: "Eligible person present", user_value: "1 child under 5", threshold: "≥ 1", passes: true },
      { factor_name: "Income vs. limit", user_value: "$2,600", threshold: "≤ $4,078 (185% FPL)", passes: true },
    ],
    estimated_monthly_benefit: "~$60/month (estimated)",
    required_documents: [
      "Proof of identity (photo ID or child's birth certificate)",
      "Proof of residency",
      "Proof of income or participation in SNAP/Medicaid/TANF",
      "Child's most recent immunization records (recommended)",
    ],
    apply_url: "https://www.fns.usda.gov/wic/wic-contacts",
    more_info_url: "https://www.fns.usda.gov/wic",
    data_source: "USDA Food and Nutrition Service",
    data_as_of: "2026",
  },
  {
    program_id: "liheap",
    program_name: "LIHEAP",
    status: "likely_eligible",
    confidence: 0.75,
    reason:
      "Your income is within the limit, but LIHEAP is funded seasonally and may have a waitlist. Apply as early as possible.",
    eligibility_factors: [
      { factor_name: "Responsible for energy bill", user_value: "Rents", threshold: "Required", passes: true },
      { factor_name: "Income vs. limit", user_value: "$2,600", threshold: "≤ $4,408 (200% FPL)", passes: true },
    ],
    estimated_monthly_benefit: "~$58/month avg (varies widely by state)",
    required_documents: [
      "Photo ID",
      "Proof of income for all household members (last 30 days)",
      "Most recent utility bills (heating and/or cooling)",
      "Social Security numbers for all household members",
      "Proof of residency (lease or utility bill in your name)",
    ],
    apply_url: "https://www.csd.ca.gov/Pages/Energy-Assistance.aspx",
    more_info_url: "https://www.acf.hhs.gov/ocs/programs/liheap",
    data_source: "HHS Office of Community Services",
    data_as_of: "2026",
  },
  {
    program_id: "tanf",
    program_name: "TANF",
    status: "possibly_eligible",
    confidence: 0.4,
    reason:
      "You may qualify for cash assistance through CalWORKs. TANF rules vary significantly by state — contact your local office to confirm. Federal lifetime limit is 60 months of cash assistance.",
    eligibility_factors: [
      { factor_name: "Children in household", user_value: "2 children", threshold: "≥ 1", passes: true },
      { factor_name: "Income screen", user_value: "$2,600", threshold: "State-determined", passes: true, note: "State office makes the final determination." },
    ],
    estimated_monthly_benefit: null,
    required_documents: [
      "Photo ID for all adults in household",
      "Birth certificates for all children",
      "Social Security numbers for all household members",
      "Proof of income (or zero-income statement)",
      "Proof of residency",
    ],
    apply_url: "https://benefitscal.com/",
    more_info_url: "https://www.acf.hhs.gov/ofa/programs/tanf",
    data_source: "HHS Administration for Children and Families",
    data_as_of: "2026",
  },
];

export const MOCK_ACTION_PLAN_TEXT = `Hi — based on what you shared, you appear to qualify for several programs that can meaningfully help your household of four. Here's where to start.

**SNAP (Food assistance) — Likely eligible**
SNAP provides a monthly electronic benefit to help buy groceries. Your household income is within the limit for a family of four in California. Estimated benefit: ~$412/month.
Where to apply: getcalfresh.org
Source: USDA Food and Nutrition Service, FY2026 (October 2025).

**Medi-Cal (Medicaid health coverage) — Likely eligible**
Free or low-cost comprehensive health coverage for the adults in your home. California has expanded Medicaid and your income is within the limit.
Where to apply: coveredca.com/medi-cal
Source: Centers for Medicare & Medicaid Services, 2026.

**CHIP (Children's health coverage) — Likely eligible**
Low-cost health coverage for your two children. Your income is within California's CHIP limit.
Where to apply: coveredca.com/medi-cal
Source: Centers for Medicare & Medicaid Services, 2026.

**WIC (Food & nutrition for young children) — Likely eligible**
Supplemental food, nutrition education, and healthcare referrals for your child under 5. Same-day enrollment is often possible at a WIC clinic.
Where to apply: fns.usda.gov/wic
Source: USDA Food and Nutrition Service, 2026.

**Recommended order**
Start with WIC (often same-day), then SNAP, then Medi-Cal and CHIP together, then LIHEAP before the season's funds run out.

This tool provides general guidance only. Final eligibility is determined by the agency you apply to, not by this tool. This is not legal or financial advice. If you need help applying, contact a local benefits navigator or call 211.`;

export const MOCK_ACTION_PLAN: ActionPlanResponse = {
  action_plan_text: MOCK_ACTION_PLAN_TEXT,
  profile: MOCK_PROFILE,
  results: MOCK_RESULTS,
  generated_at: new Date().toISOString(),
  disclaimer:
    "This tool provides general guidance only. Final eligibility is determined by the agency you apply to. This is not legal or financial advice.",
};

// --- Cliff modelling (mirrors cliff/calculator.py logic, CA family of 4) ---
function buildCliff(profile: UserProfile): CliffResponse {
  const size = profile.household_size;
  const adults = profile.adults;
  const children = profile.children_under_18;
  const wicPersons = profile.pregnant_women + profile.infants_under_5;

  const grossLimit = 3479; // SNAP gross limit, size 4
  const stdDed = 217;
  const maxAllot = 975;
  const medicaidLimit = 3041; // 138% FPL monthly, size 4
  const chipLimit = 5862; // 266% FPL
  const liheapLimit = 4408; // 200% FPL
  const wicLimit = 4078; // 185% FPL

  const points: CliffDataPoint[] = [];
  for (let income = 0; income <= 5000; income += 50) {
    let snap = 0;
    if (income <= grossLimit) {
      const earned = income; // employed
      const net = Math.max(0, income - earned * 0.2 - stdDed);
      snap = Math.max(0, maxAllot - net * 0.3);
    }
    const medicaid = income <= medicaidLimit ? 400 * adults : 0;
    const chip = income <= chipLimit ? 200 * children : 0;
    const liheap = income <= liheapLimit ? 58 : 0;
    const wic = wicPersons > 0 && income <= wicLimit ? 60 * wicPersons : 0;
    const total = snap + medicaid + chip + liheap + wic;
    points.push({
      monthly_income: income,
      snap_benefit: Math.round(snap),
      medicaid_value: medicaid,
      chip_value: chip,
      liheap_value: liheap,
      wic_value: wic,
      total_benefit_value: Math.round(total),
      net_resources: Math.round(income + total),
    });
  }

  const zones: CliffZone[] = [
    {
      income_start: 3000,
      income_end: 3100,
      description: "Medicaid (Medi-Cal) phases out for adults near 138% of the poverty line.",
      benefit_lost: "Adult Medicaid coverage (~$800/mo value)",
      net_change: -740,
    },
    {
      income_start: 3450,
      income_end: 3500,
      description: "SNAP food benefits end once gross income passes the limit for your household.",
      benefit_lost: "SNAP (~$400/mo)",
      net_change: -360,
    },
  ];

  return {
    profile,
    data_points: points,
    cliff_zones: zones,
    calculated_at: new Date().toISOString(),
  };
}

export function mockCliff(profile: UserProfile): CliffResponse {
  return buildCliff(profile);
}

export const MOCK_CLIFF = buildCliff(MOCK_PROFILE);
