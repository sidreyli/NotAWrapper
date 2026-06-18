"""Benefits cliff calculator.

Computes how net resources (income + imputed benefit value) change as monthly income
rises, and detects "cliff zones" where net resources decrease. Uses only the data
layer — no AI, no rules_engine import (to avoid circular deps), no network calls.
Synchronous.

SKELETON: calculate / get_current_position are not yet implemented. See CLAUDE.md
Module E and ARCHITECTURE.md "Benefits Cliff Algorithm" for the per-income-level math.
"""

from backend.schemas import UserProfile, CliffResponse, CliffDataPoint
from backend.modules.data_layer.fpl import fpl_loader
from backend.modules.data_layer.snap_tables import snap_tables
from backend.modules.data_layer.program_registry import program_registry


class CliffCalculator:
    def __init__(self) -> None:
        # Reuse data-layer singletons; do NOT import rules_engine (circular dep).
        self.fpl_loader = fpl_loader
        self.snap_tables = snap_tables
        self.program_registry = program_registry

    def calculate(
        self,
        profile: UserProfile,
        min_income: float = 0,
        max_income: float = 5000,
        step: float = 50,
    ) -> CliffResponse:
        """Iterate income from min to max in `step` increments, computing benefit
        values and net resources at each level, then detect cliff zones."""
        raise NotImplementedError("TODO: implement cliff calculation")

    def get_current_position(self, profile: UserProfile) -> CliffDataPoint:
        """Single data point at the profile's current monthly_gross_income."""
        raise NotImplementedError("TODO: implement single-point calculation")


cliff_calculator = CliffCalculator()
