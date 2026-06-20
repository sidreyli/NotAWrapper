"""SNAP eligibility rule.

Legal citation: 7 C.F.R. § 273.9 (USDA FNS FY2026 SNAP income limits).
Pure deterministic logic — no AI, no network calls.
"""

from backend.modules.rules_engine.base import ProgramRule, EARNED_STATUSES
from backend.modules.data_layer.program_registry import program_registry
from backend.modules.data_layer.snap_tables import snap_tables
from backend.schemas import (
    UserProfile,
    EligibilityResult,
    EligibilityStatus,
    EligibilityFactor,
)


class SNAPRule(ProgramRule):
    @property
    def program_id(self) -> str:
        return "snap"

    def check(self, profile: UserProfile) -> EligibilityResult:
        unsupported = self._unsupported_state(profile)
        if unsupported:
            return unsupported

        size = profile.household_size
        gross = profile.monthly_gross_income
        factors: list[EligibilityFactor] = []

        gross_limit = snap_tables.get_gross_limit_monthly(size)
        exempt_from_gross = profile.elderly_members > 0 or profile.has_disability

        # Check 1 — Gross income test (waived for elderly/disabled households).
        gross_passes = gross <= gross_limit
        factors.append(
            EligibilityFactor(
                factor_name="gross_income_test",
                user_value=f"${gross:.0f}/month",
                threshold=f"${gross_limit:.0f}/month (130% FPL for {size})",
                passes=gross_passes or exempt_from_gross,
                note="Waived — elderly or disabled household" if exempt_from_gross else None,
            )
        )
        if not gross_passes and not exempt_from_gross:
            return self._result(
                profile,
                EligibilityStatus.LIKELY_INELIGIBLE,
                0.9,
                f"Your gross monthly income of ${gross:.0f} is above the SNAP gross "
                f"income limit of ${gross_limit:.0f} for a household of {size}.",
                factors,
            )

        # Net income.
        earned = gross if profile.employment_status in EARNED_STATUSES else 0.0
        net = snap_tables.calculate_net_income(gross, earned, size)
        net_limit = snap_tables.get_net_limit_monthly(size)
        net_passes = net <= net_limit
        factors.append(
            EligibilityFactor(
                factor_name="net_income_test",
                user_value=f"${net:.0f}/month (after deductions)",
                threshold=f"${net_limit:.0f}/month (100% FPL for {size})",
                passes=net_passes,
            )
        )

        estimate = snap_tables.estimate_benefit(net, size)
        estimate_str = f"~${estimate:.0f}/month (estimated)"

        # Check 3 — Broad-based categorical eligibility via an existing benefit.
        state_program = program_registry.get_state_program(profile.state, "snap")
        categorical = bool(state_program.get("broad_categorical_eligibility")) and any(
            b in profile.current_benefits for b in ("tanf", "ssi", "medicaid")
        )
        if categorical:
            factors.append(
                EligibilityFactor(
                    factor_name="categorical_eligibility",
                    user_value="Receives TANF, SSI, or Medicaid",
                    threshold="State uses broad-based categorical eligibility",
                    passes=True,
                )
            )
            return self._result(
                profile,
                EligibilityStatus.LIKELY_ELIGIBLE,
                0.9,
                "You are likely categorically eligible for SNAP through an existing "
                "benefit (TANF, SSI, or Medicaid) in a state that uses broad-based "
                "categorical eligibility.",
                factors,
                estimate_str,
            )

        if not net_passes:
            return self._result(
                profile,
                EligibilityStatus.LIKELY_INELIGIBLE,
                0.85,
                f"Your net monthly income of ${net:.0f} (after standard deductions) is "
                f"above the SNAP net income limit of ${net_limit:.0f} for a household "
                f"of {size}.",
                factors,
            )

        return self._result(
            profile,
            EligibilityStatus.LIKELY_ELIGIBLE,
            0.85,
            f"Your income appears to be within SNAP limits for a household of {size}. "
            f"You may receive an estimated {estimate_str}.",
            factors,
            estimate_str,
        )
