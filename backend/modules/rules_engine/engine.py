"""
RESPONSIBLE AI DESIGN NOTE:
This rules engine is the sole source of eligibility determination.
The LLM (Claude) is never consulted for eligibility decisions.
All thresholds are sourced from official government publications (see static/).
Data freshness timestamps are included in all EligibilityResult objects.
Users are always directed to verify with the administering agency.
No PII is persisted beyond the in-memory session (2-hour TTL).
"""

from schemas import (
    UserProfile,
    EligibilityResult,
    EligibilityStatus,
)
from modules.data_layer.program_registry import program_registry
from modules.rules_engine.base import ProgramRule
from modules.rules_engine.programs.snap import SNAPRule
from modules.rules_engine.programs.medicaid import MedicaidRule
from modules.rules_engine.programs.chip import CHIPRule
from modules.rules_engine.programs.liheap import LIHEAPRule
from modules.rules_engine.programs.wic import WICRule
from modules.rules_engine.programs.tanf import TANFRule


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
        results: list[EligibilityResult] = []
        for program_id, rule in self.rules.items():
            if program_id in profile.current_benefits:
                results.append(self._already_receiving(program_id))
                continue
            try:
                results.append(rule.check(profile))
            except Exception as exc:  # noqa: BLE001 — never let one rule break the rest
                results.append(self._unable_to_determine(program_id, str(exc)))
        return results

    def check_program(self, program_id: str, profile: UserProfile) -> EligibilityResult:
        """Run a single rule by ID."""
        if program_id in profile.current_benefits:
            return self._already_receiving(program_id)
        try:
            return self.rules[program_id].check(profile)
        except KeyError:
            raise
        except Exception as exc:  # noqa: BLE001
            return self._unable_to_determine(program_id, str(exc))

    @staticmethod
    def _program_name(program_id: str) -> str:
        try:
            return program_registry.get_program(program_id)["name"]
        except KeyError:
            return program_id.upper()

    def _already_receiving(self, program_id: str) -> EligibilityResult:
        return EligibilityResult(
            program_id=program_id,
            program_name=self._program_name(program_id),
            status=EligibilityStatus.ALREADY_RECEIVING,
            confidence=1.0,
            reason="You told us you already receive this benefit.",
        )

    def _unable_to_determine(self, program_id: str, detail: str) -> EligibilityResult:
        return EligibilityResult(
            program_id=program_id,
            program_name=self._program_name(program_id),
            status=EligibilityStatus.UNABLE_TO_DETERMINE,
            confidence=0.0,
            reason=(
                "We couldn't automatically determine eligibility for this program. "
                "Please contact the administering agency or call 211."
            ),
        )
