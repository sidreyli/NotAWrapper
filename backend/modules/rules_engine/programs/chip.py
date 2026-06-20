"""CHIP (Children's Health Insurance Program) eligibility rule.

Legal citation: 42 C.F.R. § 457 (CMS, 2026). Only relevant to households with
children under 18. Pure deterministic logic — no AI, no network calls.
"""

from modules.rules_engine.base import ProgramRule
from modules.data_layer.program_registry import program_registry
from modules.data_layer.fpl import fpl_loader
from schemas import (
    UserProfile,
    EligibilityResult,
    EligibilityStatus,
    EligibilityFactor,
)


class CHIPRule(ProgramRule):
    @property
    def program_id(self) -> str:
        return "chip"

    def check(self, profile: UserProfile) -> EligibilityResult:
        unsupported = self._unsupported_state(profile)
        if unsupported:
            return unsupported

        if profile.children_under_18 <= 0:
            return self._result(
                profile,
                EligibilityStatus.LIKELY_INELIGIBLE,
                0.95,
                "CHIP covers children under 18. There are no children under 18 in "
                "your household.",
            )

        state_program = program_registry.get_state_program(profile.state, "chip")
        pct = state_program["fpl_pct"]
        limit = fpl_loader.get_income_at_pct_monthly(
            pct, profile.household_size, profile.state
        )
        gross = profile.monthly_gross_income
        passes = gross <= limit
        factor = EligibilityFactor(
            factor_name="income_test",
            user_value=f"${gross:.0f}/month",
            threshold=f"${limit:.0f}/month ({pct}% FPL for {profile.household_size})",
            passes=passes,
        )

        program = program_registry.get_program("chip")
        per_child = program.get("imputed_monthly_value_per_child", 0)
        estimate = f"~${per_child * profile.children_under_18}/month (estimated coverage value)"

        if passes:
            return self._result(
                profile,
                EligibilityStatus.LIKELY_ELIGIBLE,
                0.85,
                f"Your household income appears to be within the CHIP limit ({pct}% "
                f"FPL) for {state_program.get('program_name', 'CHIP')} in your state.",
                [factor],
                estimate,
            )
        return self._result(
            profile,
            EligibilityStatus.LIKELY_INELIGIBLE,
            0.85,
            f"Your income of ${gross:.0f}/month is above the CHIP limit of "
            f"${limit:.0f}/month for a household of {profile.household_size}.",
            [factor],
        )
