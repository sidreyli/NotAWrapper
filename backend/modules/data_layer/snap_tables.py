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

    def _lookup_with_increment(self, table: dict, household_size: int) -> float:
        """Look up a value by household size, extending past the table using
        `increment_per_additional` for the largest listed size."""
        if household_size < 1:
            household_size = 1
        key = str(household_size)
        if key in table:
            return float(table[key])
        sizes = sorted(int(k) for k in table if k.isdigit())
        largest = sizes[-1]
        increment = float(table.get("increment_per_additional", 0))
        return float(table[str(largest)]) + (household_size - largest) * increment

    def get_gross_limit_monthly(self, household_size: int) -> float:
        return self._lookup_with_increment(
            self.data["gross_income_limits_monthly"], household_size
        )

    def get_net_limit_monthly(self, household_size: int) -> float:
        return self._lookup_with_increment(
            self.data["net_income_limits_monthly"], household_size
        )

    def get_max_allotment_monthly(self, household_size: int) -> float:
        return self._lookup_with_increment(
            self.data["maximum_allotments_monthly"], household_size
        )

    def get_standard_deduction_monthly(self, household_size: int) -> float:
        table = self.data["standard_deductions_monthly"]
        if household_size < 1:
            household_size = 1
        key = str(household_size)
        if key in table:
            return float(table[key])
        # Deduction table tops out at 6; larger households use the 6+ value.
        sizes = sorted(int(k) for k in table if k.isdigit())
        return float(table[str(sizes[-1])])

    def get_asset_limit(self, has_elderly_or_disabled: bool) -> float:
        limits = self.data["asset_limits"]
        if has_elderly_or_disabled:
            return float(limits["elderly_or_disabled_member"])
        return float(limits["standard_households"])

    def calculate_net_income(
        self, gross_monthly: float, earned_monthly: float, household_size: int
    ) -> float:
        """gross - (earned * earned_income_deduction_rate) - standard_deduction.

        Never returns negative.
        """
        rate = float(self.data["earned_income_deduction_rate"])
        net = (
            gross_monthly
            - (earned_monthly * rate)
            - self.get_standard_deduction_monthly(household_size)
        )
        return max(0.0, net)

    def estimate_benefit(self, net_monthly: float, household_size: int) -> float:
        """max(0, max_allotment - (net_monthly * 0.3))."""
        allotment = self.get_max_allotment_monthly(household_size)
        return max(0.0, allotment - (net_monthly * 0.3))

    def get_source_info(self) -> dict:
        """Returns source metadata from the loaded data."""
        return {
            "source": self.data["source"],
            "url": self.data["url"],
            "data_as_of": self.data["fiscal_year"],
        }


snap_tables = SNAPTables()
