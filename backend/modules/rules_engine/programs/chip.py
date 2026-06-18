"""CHIP (Children's Health Insurance Program) eligibility rule.

Legal citation: 42 C.F.R. § 457 (CMS, 2026). Only relevant to households with
children under 18. Pure deterministic logic — no AI, no network calls.

SKELETON: check() is not yet implemented. See CLAUDE.md Module B for the full
income-threshold logic.
"""

from backend.modules.rules_engine.base import ProgramRule
from backend.schemas import UserProfile, EligibilityResult


class CHIPRule(ProgramRule):
    @property
    def program_id(self) -> str:
        return "chip"

    def check(self, profile: UserProfile) -> EligibilityResult:
        raise NotImplementedError("TODO: implement CHIP eligibility logic")
