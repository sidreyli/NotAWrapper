"""TANF (Temporary Assistance for Needy Families) eligibility rule.

Legal citation: 42 U.S.C. § 601 (HHS ACF, 2026). TANF rules are highly
state-variable; this rule only screens candidates and returns POSSIBLY_ELIGIBLE
or LIKELY_INELIGIBLE with a directive to contact the state agency. Federal
lifetime limit is 60 months. Pure deterministic logic — no AI, no network calls.

SKELETON: check() is not yet implemented. See CLAUDE.md Module B for the full
candidate-screening logic.
"""

from backend.modules.rules_engine.base import ProgramRule
from backend.schemas import UserProfile, EligibilityResult


class TANFRule(ProgramRule):
    @property
    def program_id(self) -> str:
        return "tanf"

    def check(self, profile: UserProfile) -> EligibilityResult:
        raise NotImplementedError("TODO: implement TANF candidate screening logic")
