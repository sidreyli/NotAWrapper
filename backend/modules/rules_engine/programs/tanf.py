"""TANF (Temporary Assistance for Needy Families) eligibility rule.

Legal citation: 42 U.S.C. § 601 (HHS ACF, 2026). TANF rules are highly
state-variable; this rule only screens candidates and returns POSSIBLY_ELIGIBLE
or LIKELY_INELIGIBLE with a directive to contact the state agency. Federal
lifetime limit is 60 months. Pure deterministic logic — no AI, no network calls.
"""

from modules.rules_engine.base import ProgramRule
from modules.data_layer.fpl import fpl_loader
from schemas import (
    UserProfile,
    EligibilityResult,
    EligibilityStatus,
    EligibilityFactor,
)

_LIMIT_NOTE = "Federal lifetime limit is 60 months of TANF cash assistance."


class TANFRule(ProgramRule):
    @property
    def program_id(self) -> str:
        return "tanf"

    def check(self, profile: UserProfile) -> EligibilityResult:
        unsupported = self._unsupported_state(profile)
        if unsupported:
            return unsupported

        if profile.children_under_18 <= 0:
            return self._result(
                profile,
                EligibilityStatus.LIKELY_INELIGIBLE,
                0.85,
                "TANF provides cash assistance to families with children under 18. "
                f"There are no children under 18 in your household. {_LIMIT_NOTE}",
            )

        # Rough candidate screen using 50% FPL as a conservative indicator.
        limit = fpl_loader.get_income_at_pct_monthly(50, profile.household_size, profile.state)
        gross = profile.monthly_gross_income
        within = gross <= limit
        factor = EligibilityFactor(
            factor_name="income_indicator",
            user_value=f"${gross:.0f}/month",
            threshold=f"~${limit:.0f}/month (50% FPL indicator for {profile.household_size})",
            passes=within,
        )

        if within:
            return self._result(
                profile,
                EligibilityStatus.POSSIBLY_ELIGIBLE,
                0.4,
                "You may qualify for cash assistance. TANF rules vary significantly by "
                f"state. Contact your local office to determine exact eligibility. {_LIMIT_NOTE}",
                [factor],
            )
        return self._result(
            profile,
            EligibilityStatus.POSSIBLY_ELIGIBLE,
            0.3,
            "TANF rules vary by state and your income may still be within range. "
            f"Contact your local office to confirm. {_LIMIT_NOTE}",
            [factor],
        )
