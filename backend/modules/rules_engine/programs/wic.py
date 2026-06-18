"""WIC (Women, Infants, and Children) eligibility rule.

Legal citation: 7 C.F.R. § 246 (USDA FNS, 2026). Income limit 185% FPL;
categorical income eligibility via SNAP/Medicaid/TANF. Demographic eligibility
required (pregnant/postpartum women, children under 5). Pure deterministic logic
— no AI, no network calls.

SKELETON: check() is not yet implemented. See CLAUDE.md Module B for the full
demographic + income logic.
"""

from backend.modules.rules_engine.base import ProgramRule
from backend.schemas import UserProfile, EligibilityResult


class WICRule(ProgramRule):
    @property
    def program_id(self) -> str:
        return "wic"

    def check(self, profile: UserProfile) -> EligibilityResult:
        raise NotImplementedError("TODO: implement WIC eligibility logic")
