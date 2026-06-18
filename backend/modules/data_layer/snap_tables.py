"""SNAP income/benefit table lookups (USDA FNS FY2026).

Loads `snap_2026.json` and exposes deterministic lookups for the SNAP rule and the
cliff calculator. No AI, no network calls.

SKELETON: the static file is loaded so the module-level singleton constructs. The
computed lookup/estimation methods are not yet implemented.
"""

import json
from pathlib import Path

_STATIC_DIR = Path(__file__).parent / "static"
_SNAP_FILE = _STATIC_DIR / "snap_2026.json"


class SNAPTables:
    """SNAP FY2026 income limits, allotments, deductions, and benefit estimation."""

    _data: dict | None = None

    def __init__(self) -> None:
        if SNAPTables._data is None:
            with open(_SNAP_FILE, encoding="utf-8") as f:
                SNAPTables._data = json.load(f)
        self.data = SNAPTables._data

    def get_gross_limit_monthly(self, household_size: int) -> float:
        raise NotImplementedError("TODO: 130% FPL gross income limit lookup")

    def get_net_limit_monthly(self, household_size: int) -> float:
        raise NotImplementedError("TODO: 100% FPL net income limit lookup")

    def get_max_allotment_monthly(self, household_size: int) -> float:
        raise NotImplementedError("TODO: maximum allotment lookup")

    def get_standard_deduction_monthly(self, household_size: int) -> float:
        raise NotImplementedError("TODO: standard deduction lookup")

    def get_asset_limit(self, has_elderly_or_disabled: bool) -> float:
        raise NotImplementedError("TODO: asset limit by elderly/disabled flag")

    def calculate_net_income(
        self, gross_monthly: float, earned_monthly: float, household_size: int
    ) -> float:
        """gross - (earned * earned_income_deduction_rate) - standard_deduction.

        Never returns negative.
        """
        raise NotImplementedError("TODO: net income calculation")

    def estimate_benefit(self, net_monthly: float, household_size: int) -> float:
        """max(0, max_allotment - (net_monthly * 0.3))."""
        raise NotImplementedError("TODO: benefit estimation")

    def get_source_info(self) -> dict:
        """Returns source metadata from the loaded data."""
        return {
            "source": self.data["source"],
            "url": self.data["url"],
            "data_as_of": self.data["fiscal_year"],
        }


snap_tables = SNAPTables()
