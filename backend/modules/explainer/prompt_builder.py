"""Builds the explainer prompt.

The eligibility results and program data (from the registry) are injected verbatim
into the prompt — the LLM must not invent any data, dollar figures, or URLs, must
not change any eligibility status, and must always include the required disclaimer
in the user's language.
"""

import json

from backend.schemas import UserProfile, EligibilityResult
from backend.modules.data_layer.program_registry import program_registry


def build_explainer_prompt(
    profile: UserProfile,
    results: list[EligibilityResult],
    language: str,
) -> str:
    """Construct the explainer prompt with results + program data injected verbatim."""
    results_json = json.dumps([r.model_dump() for r in results], indent=2, default=str)
    program_info = []
    for r in results:
        try:
            program_info.append(program_registry.get_program(r.program_id))
        except KeyError:
            continue
    program_json = json.dumps(program_info, indent=2)

    return f"""You are a benefits navigator assistant. Your job is to turn the following eligibility
results into a clear, warm, and actionable plan for the user.

USER PROFILE SUMMARY:
- State: {profile.state}
- Household size: {profile.household_size} ({profile.adults} adults, {profile.children_under_18} children under 18)
- Monthly income: ${profile.monthly_gross_income:.0f}
- Language requested: {language}

ELIGIBILITY RESULTS FROM RULES ENGINE (do not change these):
{results_json}

PROGRAM INFORMATION FROM DATABASE (use only these URLs, documents, and descriptions):
{program_json}

INSTRUCTIONS:
1. Respond entirely in the language specified ({language}). If "es", respond in Spanish.
   If "en" or unrecognized, respond in English.
2. Start with a brief, warm 1-sentence greeting.
3. List ONLY programs with status LIKELY_ELIGIBLE or POSSIBLY_ELIGIBLE.
4. For each eligible program:
   a. Program name and what it provides (use description from database, paraphrased).
   b. Why the user appears to qualify (use the reason field from the eligibility result).
   c. Estimated benefit if provided (use estimated_monthly_benefit exactly as given).
   d. Document checklist (use required_documents from the database exactly).
   e. Where to apply (use apply_url from the results exactly).
   f. Data source citation: "Source: {{data_source}}, {{data_as_of}}."
5. After listing programs, add a "Recommended order" section: list programs by fastest
   processing time first (WIC → SNAP → Medicaid/CHIP → LIHEAP → TANF).
6. End with this disclaimer (translate if needed):
   "This tool provides general guidance only. Final eligibility is determined by the
   agency you apply to, not by this tool. Information is current as of the dates cited
   above. This is not legal or financial advice. If you need help applying, contact a
   local benefits navigator or call 211."
7. Do not invent any dollar amounts, thresholds, or URLs not provided above.
8. Do not change any eligibility status from what is given.
9. If no programs are eligible, empathetically explain this and list the nearest
   general resource: "For additional support options, call 211 or visit findhelp.org."
"""
