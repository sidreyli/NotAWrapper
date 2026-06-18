from abc import ABC, abstractmethod
from backend.schemas import UserProfile, EligibilityResult


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
