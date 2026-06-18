"""LIHEAP (Low Income Home Energy Assistance Program) eligibility rule.

Legal citation: 42 U.S.C. § 8624 (HHS OCS, 2026). Federal minimum 150% FPL;
states may set higher thresholds. Confidence is always capped at 0.80 due to
seasonal funding variability. Pure deterministic logic — no AI, no network calls.

SKELETON: check() is not yet implemented. See CLAUDE.md Module B for the full
income-threshold + housing-status logic.
"""

from backend.modules.rules_engine.base import ProgramRule
from backend.schemas import UserProfile, EligibilityResult


class LIHEAPRule(ProgramRule):
    @property
    def program_id(self) -> str:
        return "liheap"

    def check(self, profile: UserProfile) -> EligibilityResult:
        raise NotImplementedError("TODO: implement LIHEAP eligibility logic")
