from abc import ABC, abstractmethod

from backend.schemas import (
    UserProfile,
    EligibilityResult,
    EligibilityStatus,
    EligibilityFactor,
)
from backend.modules.data_layer.program_registry import program_registry

# Employment statuses that count as earned income for SNAP net-income math.
EARNED_STATUSES = {"employed_full", "employed_part", "self_employed"}


class ProgramRule(ABC):
    """Abstract base for all program eligibility rules."""

    @property
    @abstractmethod
    def program_id(self) -> str:
        """e.g. 'snap'"""

    @abstractmethod
    def check(self, profile: UserProfile) -> EligibilityResult:
        """
        Evaluate eligibility. MUST be purely deterministic.
        MUST NOT make any network calls.
        MUST NOT call any AI API.
        Returns EligibilityResult with all fields populated.
        """

    # --- Shared helpers (deterministic, no AI, no network) ---------------

    def _common_fields(self, profile: UserProfile) -> dict:
        """Program metadata common to every result for this program: name,
        required documents, state-specific apply URL, data source citation."""
        program = program_registry.get_program(self.program_id)
        try:
            state_program = program_registry.get_state_program(profile.state, self.program_id)
            apply_url = state_program.get("apply_url") or program.get("national_apply_url", "")
        except (ValueError, KeyError):
            apply_url = program.get("national_apply_url", "")
        return {
            "program_id": self.program_id,
            "program_name": program["name"],
            "required_documents": program.get("required_documents", []),
            "apply_url": apply_url,
            "more_info_url": program.get("more_info_url", ""),
            "data_source": program.get("data_source", ""),
            "data_as_of": program.get("data_as_of", ""),
        }

    def _result(
        self,
        profile: UserProfile,
        status: EligibilityStatus,
        confidence: float,
        reason: str,
        factors: list[EligibilityFactor] | None = None,
        estimated_monthly_benefit: str | None = None,
    ) -> EligibilityResult:
        return EligibilityResult(
            status=status,
            confidence=confidence,
            reason=reason,
            eligibility_factors=factors or [],
            estimated_monthly_benefit=estimated_monthly_benefit,
            **self._common_fields(profile),
        )

    def _unsupported_state(self, profile: UserProfile) -> EligibilityResult | None:
        """Return an UNABLE_TO_DETERMINE result if the state is not supported,
        otherwise None."""
        if not program_registry.is_state_supported(profile.state):
            return self._result(
                profile,
                EligibilityStatus.UNABLE_TO_DETERMINE,
                0.0,
                f"{profile.state} is not currently supported. Supported states: "
                f"{', '.join(program_registry.get_supported_states())}.",
            )
        return None
