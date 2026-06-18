"""
RESPONSIBLE AI DESIGN NOTE:
This rules engine is the sole source of eligibility determination.
The LLM (Claude) is never consulted for eligibility decisions.
All thresholds are sourced from official government publications (see static/).
Data freshness timestamps are included in all EligibilityResult objects.
Users are always directed to verify with the administering agency.
No PII is persisted beyond the in-memory session (2-hour TTL).
"""

from backend.schemas import (
    UserProfile,
    EligibilityResult,
    EligibilityStatus,
)
from backend.modules.rules_engine.base import ProgramRule
from backend.modules.rules_engine.programs.snap import SNAPRule
from backend.modules.rules_engine.programs.medicaid import MedicaidRule
from backend.modules.rules_engine.programs.chip import CHIPRule
from backend.modules.rules_engine.programs.liheap import LIHEAPRule
from backend.modules.rules_engine.programs.wic import WICRule
from backend.modules.rules_engine.programs.tanf import TANFRule


class EligibilityEngine:
    """Orchestrates all program eligibility checks.

    Must not import or reference anything from modules/intake/, modules/explainer/,
    or modules/cliff/.
    """

    def __init__(self) -> None:
        rules: list[ProgramRule] = [
            SNAPRule(),
            MedicaidRule(),
            CHIPRule(),
            LIHEAPRule(),
            WICRule(),
            TANFRule(),
        ]
        self.rules: dict[str, ProgramRule] = {rule.program_id: rule for rule in rules}

    def check_all(self, profile: UserProfile) -> list[EligibilityResult]:
        """Run all rules.

        Skips programs the user already receives (ALREADY_RECEIVING), catches any
        per-rule exception and returns UNABLE_TO_DETERMINE with the message, never
        raises.
        """
        raise NotImplementedError("TODO: iterate self.rules with per-rule guards")

    def check_program(self, program_id: str, profile: UserProfile) -> EligibilityResult:
        """Run a single rule by ID."""
        raise NotImplementedError("TODO: dispatch to self.rules[program_id].check")
