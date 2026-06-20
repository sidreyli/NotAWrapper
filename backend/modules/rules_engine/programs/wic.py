"""WIC (Women, Infants, and Children) eligibility rule.

Legal citation: 7 C.F.R. § 246 (USDA FNS, 2026). Income limit 185% FPL;
categorical income eligibility via SNAP/Medicaid/TANF. Demographic eligibility
required (pregnant women, children under 5). Pure deterministic logic — no AI,
no network calls.
"""

from backend.modules.rules_engine.base import ProgramRule
from backend.modules.data_layer.program_registry import program_registry
from backend.modules.data_layer.fpl import fpl_loader
from backend.schemas import (
    UserProfile,
    EligibilityResult,
    EligibilityStatus,
    EligibilityFactor,
)

_WIC_INCOME_FPL_PCT = 185


class WICRule(ProgramRule):
    @property
    def program_id(self) -> str:
        return "wic"

    def check(self, profile: UserProfile) -> EligibilityResult:
        unsupported = self._unsupported_state(profile)
        if unsupported:
            return unsupported

        eligible_persons = profile.pregnant_women + profile.infants_under_5
        if eligible_persons <= 0:
            return self._result(
                profile,
                EligibilityStatus.LIKELY_INELIGIBLE,
                0.9,
                "WIC is available only to pregnant women, new mothers (up to 6 months "
                "postpartum), breastfeeding mothers (up to 1 year), and children under "
                "5. No one in your household currently meets these categories.",
            )

        # Categorical income eligibility via a linked program.
        categorical = any(
            b in profile.current_benefits for b in ("snap", "medicaid", "tanf")
        )
        limit = fpl_loader.get_income_at_pct_monthly(
            _WIC_INCOME_FPL_PCT, profile.household_size, profile.state
        )
        gross = profile.monthly_gross_income
        income_eligible = categorical or gross <= limit

        factors = [
            EligibilityFactor(
                factor_name="demographic_eligibility",
                user_value=f"{eligible_persons} eligible person(s)",
                threshold="Pregnant women or children under 5",
                passes=True,
            ),
            EligibilityFactor(
                factor_name="income_test",
                user_value="Auto-eligible via SNAP/Medicaid/TANF"
                if categorical
                else f"${gross:.0f}/month",
                threshold=f"${limit:.0f}/month (185% FPL for {profile.household_size})",
                passes=income_eligible,
            ),
        ]

        program = program_registry.get_program("wic")
        per_person = program.get("imputed_monthly_value_per_person", 0)
        estimate = f"~${per_person * eligible_persons}/month (estimated food benefit)"

        if income_eligible:
            return self._result(
                profile,
                EligibilityStatus.LIKELY_ELIGIBLE,
                0.85,
                "You have household members who qualify for WIC and your income "
                "appears to be within the WIC limit (or you are automatically "
                "income-eligible through another benefit).",
                factors,
                estimate,
            )
        return self._result(
            profile,
            EligibilityStatus.LIKELY_INELIGIBLE,
            0.85,
            f"Your income of ${gross:.0f}/month is above the WIC limit of "
            f"${limit:.0f}/month for a household of {profile.household_size}.",
            factors,
        )
