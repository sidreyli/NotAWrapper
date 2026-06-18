"""SNAP eligibility rule.

Legal citation: 7 C.F.R. § 273.9 (USDA FNS FY2026 SNAP income limits).
Pure deterministic logic — no AI, no network calls.

SKELETON: check() is not yet implemented. See CLAUDE.md Module B for the full
gross-income / net-income / categorical-eligibility logic.
"""

from backend.modules.rules_engine.base import ProgramRule
from backend.schemas import UserProfile, EligibilityResult


class SNAPRule(ProgramRule):
    @property
    def program_id(self) -> str:
        return "snap"

    def check(self, profile: UserProfile) -> EligibilityResult:
        raise NotImplementedError("TODO: implement SNAP eligibility logic")
