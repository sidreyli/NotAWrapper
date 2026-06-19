import type { ActionPlanResponse, CliffResponse, EligibilityResult, UserProfile } from "../types/api";

export const sampleProfile: UserProfile = {
  session_id: "demo-session",
  state: "CA",
  household_size: 3,
  adults: 1,
  children_under_18: 2,
  infants_under_5: 1,
  pregnant_women: 0,
  elderly_members: 0,
  has_disability: false,
  monthly_gross_income: 1500,
  income_type: "wages",
  employment_status: "employed_part",
  housing_status: "rents",
  current_benefits: [],
  citizenship_status: "prefer_not_to_say",
  language: "en",
  zip_code: null,
  profile_complete: true,
  collected_at: new Date().toISOString()
};

export const sampleResults: EligibilityResult[] = [
  {
    program_id: "snap",
    program_name: "SNAP",
    status: "likely_eligible",
    confidence: 0.9,
    reason:
      "Your household income is below the gross income limit for a family of three, and estimated net income clears the second test too.",
    eligibility_factors: [
      {
        factor_name: "Gross income test",
        user_value: "$1,500/month",
        threshold: "$2,885/month for a household of 3",
        passes: true
      },
      {
        factor_name: "Household size",
        user_value: "3 people",
        threshold: "SNAP tables include this household size",
        passes: true
      }
    ],
    estimated_monthly_benefit: "~$394 / mo",
    required_documents: [
      "Photo ID",
      "Proof of residency",
      "Proof of income",
      "Rent or utility bill",
      "Social Security numbers for household members applying"
    ],
    apply_url: "https://www.getcalfresh.org/",
    more_info_url: "https://www.fns.usda.gov/snap/recipient/eligibility",
    data_source: "USDA Food and Nutrition Service",
    data_as_of: "FY2026 (October 2025)"
  },
  {
    program_id: "medicaid",
    program_name: "Medicaid",
    status: "likely_eligible",
    confidence: 0.86,
    reason:
      "California is a Medicaid-expansion state and covers adults earning up to 138% of the federal poverty level. Your income falls under that line.",
    eligibility_factors: [
      {
        factor_name: "State expansion",
        user_value: "California",
        threshold: "ACA Medicaid expansion state",
        passes: true
      },
      {
        factor_name: "Income threshold",
        user_value: "$1,500/month",
        threshold: "138% FPL for household of 3",
        passes: true
      }
    ],
    estimated_monthly_benefit: "Full coverage",
    required_documents: ["Photo ID", "Proof of income", "Proof of residency", "Social Security number"],
    apply_url: "https://www.coveredca.com/medi-cal/",
    more_info_url: "https://www.medicaid.gov/medicaid/eligibility/index.html",
    data_source: "Centers for Medicare & Medicaid Services",
    data_as_of: "2026"
  },
  {
    program_id: "wic",
    program_name: "WIC",
    status: "likely_eligible",
    confidence: 0.74,
    reason:
      "You have a child under five, which meets WIC's category requirement, and your income is well under the 185% poverty limit.",
    eligibility_factors: [
      {
        factor_name: "Category requirement",
        user_value: "Child under 5",
        threshold: "Pregnancy, postpartum, breastfeeding, infant, or child under 5",
        passes: true
      }
    ],
    estimated_monthly_benefit: "~$60 / person",
    required_documents: ["Parent or guardian ID", "Child's birth certificate", "Proof of income", "Proof of residency"],
    apply_url: "https://www.fns.usda.gov/wic",
    more_info_url: "https://www.fns.usda.gov/wic/wic-eligibility-requirements",
    data_source: "USDA Food and Nutrition Service",
    data_as_of: "2026"
  },
  {
    program_id: "liheap",
    program_name: "LIHEAP",
    status: "possibly_eligible",
    confidence: 0.68,
    reason:
      "Your income appears to fit California's energy assistance limits, but LIHEAP depends on funding windows and local agency rules.",
    eligibility_factors: [
      {
        factor_name: "Energy bill responsibility",
        user_value: "Rents",
        threshold: "Applicant is responsible for home energy costs",
        passes: true
      }
    ],
    estimated_monthly_benefit: "Varies",
    required_documents: ["Photo ID", "Current utility bill", "Proof of income", "Proof of address"],
    apply_url: "https://www.csd.ca.gov/Pages/Energy-Assistance.aspx",
    more_info_url: "https://www.acf.hhs.gov/ocs/programs/liheap",
    data_source: "HHS Office of Community Services",
    data_as_of: "2026"
  },
  {
    program_id: "tanf",
    program_name: "TANF",
    status: "unable_to_determine",
    confidence: 0.45,
    reason:
      "You have children, which is the main requirement, but TANF rules differ so much by state that a caseworker should review this with you.",
    eligibility_factors: [
      {
        factor_name: "Children in household",
        user_value: "2 children",
        threshold: "Household includes children under 18",
        passes: true
      }
    ],
    estimated_monthly_benefit: "Varies",
    required_documents: ["Photo ID", "Proof of income", "Proof of residency", "Children's birth certificates"],
    apply_url: "https://benefitscal.com/",
    more_info_url: "https://www.acf.hhs.gov/ofa/programs/tanf",
    data_source: "HHS Administration for Children and Families",
    data_as_of: "2026"
  },
  {
    program_id: "chip",
    program_name: "CHIP",
    status: "likely_ineligible",
    confidence: 0.7,
    reason:
      "Your children likely qualify for Medicaid directly, which covers more than CHIP and usually costs your family nothing.",
    eligibility_factors: [
      {
        factor_name: "Medicaid first",
        user_value: "Income below Medicaid threshold",
        threshold: "CHIP generally serves children above Medicaid limits",
        passes: false
      }
    ],
    estimated_monthly_benefit: null,
    required_documents: ["Child's birth certificate", "Proof of household income", "Proof of residency"],
    apply_url: "https://www.coveredca.com/medi-cal/",
    more_info_url: "https://www.medicaid.gov/chip/index.html",
    data_source: "Centers for Medicare & Medicaid Services",
    data_as_of: "2026"
  }
];

export function makeSampleActionPlan(profile: UserProfile, results = sampleResults): ActionPlanResponse {
  return {
    action_plan_text:
      "Based on what you shared, you may have strong matches for SNAP, Medicaid, and WIC. LIHEAP is worth a look because energy assistance depends on local funding windows. Review each program, prepare documents, and apply through the official state links.",
    profile,
    results,
    generated_at: new Date().toISOString(),
    disclaimer:
      "This tool provides general guidance only. Final eligibility is determined by the agency you apply to. This is not legal or financial advice."
  };
}

export function makeSampleCliff(profile: UserProfile): CliffResponse {
  const points = [
    [0, 1426],
    [500, 1850],
    [1000, 2240],
    [1500, 2550],
    [2000, 2960],
    [2800, 3580],
    [3000, 3310],
    [3500, 3560],
    [5000, 5000]
  ].map(([monthly_income, net_resources]) => ({
    monthly_income,
    snap_benefit: monthly_income < 2900 ? Math.max(0, 768 - monthly_income * 0.18) : 0,
    medicaid_value: monthly_income < 3200 ? 400 : 0,
    chip_value: monthly_income < 5000 ? 400 : 0,
    liheap_value: monthly_income < 2800 ? 58 : 0,
    wic_value: monthly_income < 4200 ? 60 : 0,
    total_benefit_value: Math.max(0, net_resources - monthly_income),
    net_resources
  }));

  return {
    profile,
    data_points: points,
    cliff_zones: [
      {
        income_start: 2800,
        income_end: 3100,
        description: "Some benefits phase down around this range, so total monthly resources dip briefly.",
        benefit_lost: "SNAP / LIHEAP",
        net_change: -270
      }
    ],
    calculated_at: new Date().toISOString()
  };
}
