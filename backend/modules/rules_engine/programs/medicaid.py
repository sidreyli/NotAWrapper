"""Medicaid (adult health coverage) eligibility rule.

Legal citation: 42 C.F.R. § 435 (CMS, 2026). Expansion vs non-expansion states
are modeled explicitly. Pure deterministic logic — no AI, no network calls.
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


class MedicaidRule(ProgramRule):
    @property
    def program_id(self) -> str:
        return "medicaid"

    def check(self, profile: UserProfile) -> EligibilityResult:
        unsupported = self._unsupported_state(profile)
        if unsupported:
            return unsupported

        state_program = program_registry.get_state_program(profile.state, "medicaid")
        state_name = state_program.get("state_name", profile.state)

        if state_program.get("expansion"):
            pct = state_program["adult_fpl_pct"]
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
            if passes:
                return self._result(
                    profile,
                    EligibilityStatus.LIKELY_ELIGIBLE,
                    0.9,
                    f"Your income appears to be within the Medicaid limit ({pct}% of "
                    f"the Federal Poverty Level) for adults in {state_name}.",
                    [factor],
                    "~$400/month (estimated coverage value)",
                )
            return self._result(
                profile,
                EligibilityStatus.LIKELY_INELIGIBLE,
                0.85,
                f"Your income of ${gross:.0f}/month is above the Medicaid limit of "
                f"${limit:.0f}/month for a household of {profile.household_size} in "
                f"{state_name}.",
                [factor],
            )

        # Non-expansion state (TX, FL).
        note = state_program.get("nonexpansion_note", "")
        if profile.children_under_18 > 0 or profile.pregnant_women > 0:
            return self._result(
                profile,
                EligibilityStatus.UNABLE_TO_DETERMINE,
                0.4,
                f"{state_name} has not expanded Medicaid. Children are typically "
                "covered through CHIP and pregnant women through pregnancy Medicaid — "
                "eligibility for them is determined separately. Contact your state "
                "Medicaid office.",
            )
        if profile.has_disability:
            return self._result(
                profile,
                EligibilityStatus.POSSIBLY_ELIGIBLE,
                0.4,
                "Disability-based Medicaid may be available. Eligibility rules are "
                "complex — contact your state Medicaid office.",
            )
        return self._result(
            profile,
            EligibilityStatus.LIKELY_INELIGIBLE,
            0.9,
            f"{state_name} has not expanded Medicaid. {note}",
        )
