"""LIHEAP (Low Income Home Energy Assistance Program) eligibility rule.

Legal citation: 42 U.S.C. § 8624 (HHS OCS, 2026). Federal minimum 150% FPL;
states may set higher thresholds. Confidence is always capped at 0.80 due to
seasonal funding variability. Pure deterministic logic — no AI, no network calls.
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


class LIHEAPRule(ProgramRule):
    @property
    def program_id(self) -> str:
        return "liheap"

    def check(self, profile: UserProfile) -> EligibilityResult:
        unsupported = self._unsupported_state(profile)
        if unsupported:
            return unsupported

        # Must be responsible for a home energy bill.
        if profile.housing_status in ("unhoused", "shelter"):
            return self._result(
                profile,
                EligibilityStatus.LIKELY_INELIGIBLE,
                0.8,
                "LIHEAP requires you to be responsible for paying a home energy bill. "
                "Based on your housing situation, you may not currently qualify, but a "
                "local agency can advise on other emergency options.",
            )

        state_program = program_registry.get_state_program(profile.state, "liheap")
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

        program = program_registry.get_program("liheap")
        estimate = (
            f"~${program.get('imputed_monthly_value', 0)}/month avg "
            "(varies widely by state)"
        )

        if passes:
            return self._result(
                profile,
                EligibilityStatus.LIKELY_ELIGIBLE,
                0.75,
                "Your income is within the LIHEAP limit, but LIHEAP is funded "
                "seasonally and may have a waitlist. Apply as early as possible.",
                [factor],
                estimate,
            )
        return self._result(
            profile,
            EligibilityStatus.LIKELY_INELIGIBLE,
            0.8,
            f"Your income of ${gross:.0f}/month is above the "
            f"{state_program.get('program_name', 'LIHEAP')} limit of ${limit:.0f}/month "
            f"for a household of {profile.household_size}.",
            [factor],
        )
