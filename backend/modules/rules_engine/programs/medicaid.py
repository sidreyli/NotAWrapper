"""Medicaid (adult health coverage) eligibility rule.

Legal citation: 42 C.F.R. § 435 (CMS, 2026). Expansion vs non-expansion states
are modeled explicitly. Pure deterministic logic — no AI, no network calls.

SKELETON: check() is not yet implemented. See CLAUDE.md Module B for the full
expansion/non-expansion logic.
"""

from backend.modules.rules_engine.base import ProgramRule
from backend.schemas import UserProfile, EligibilityResult


class MedicaidRule(ProgramRule):
    @property
    def program_id(self) -> str:
        return "medicaid"

    def check(self, profile: UserProfile) -> EligibilityResult:
        raise NotImplementedError("TODO: implement Medicaid eligibility logic")
