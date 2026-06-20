"""Federal Poverty Level (FPL) loader.

Loads the authoritative 2026 FPL guidelines from the static JSON fallback and,
optionally, attempts a live fetch from HHS ASPE. All eligibility math that depends
on FPL thresholds reads from this loader.

SKELETON: the static file is loaded so the module-level singleton constructs and
the app boots. The computed lookup methods are not yet implemented.
"""

import json
from pathlib import Path

_STATIC_DIR = Path(__file__).parent / "static"
_FPL_FILE = _STATIC_DIR / "fpl_2026.json"


class FPLLoader:
    """Loads FPL guidelines and answers threshold/percentage queries.

    The static `fpl_2026.json` file is the authoritative fallback. A live fetch
    from the HHS ASPE API may be attempted on first instantiation (3-second
    httpx timeout); on any failure the static file is used silently.
    """

    _data: dict | None = None

    def __init__(self) -> None:
        # Load the static fallback so the singleton always has data.
        # TODO: optionally attempt a 3s httpx fetch from
        # https://aspe.hhs.gov/poverty-guidelines and fall back silently.
        if FPLLoader._data is None:
            with open(_FPL_FILE, encoding="utf-8") as f:
                FPLLoader._data = json.load(f)
        self.data = FPLLoader._data

    def _table(self, state: str) -> dict:
        """Select the FPL table for a state (Alaska/Hawaii have their own)."""
        if state == "AK":
            return self.data["alaska"]
        if state == "HI":
            return self.data["hawaii"]
        return self.data["contiguous_48_and_dc"]

    def get_fpl(self, household_size: int, state: str) -> float:
        """Annual FPL for a household size and 2-letter state code."""
        if household_size < 1:
            household_size = 1
        table = self._table(state)
        by_size = table["by_size"]
        key = str(household_size)
        if key in by_size:
            return float(by_size[key])
        # Sizes beyond the published table: extend from the largest listed size.
        sizes = sorted(int(k) for k in by_size)
        largest = sizes[-1]
        extra = household_size - largest
        return float(by_size[str(largest)]) + extra * float(table["increment_per_person"])

    def get_fpl_monthly(self, household_size: int, state: str) -> float:
        return self.get_fpl(household_size, state) / 12.0

    def get_fpl_pct(self, income_annual: float, household_size: int, state: str) -> float:
        fpl = self.get_fpl(household_size, state)
        if fpl <= 0:
            return 0.0
        return (income_annual / fpl) * 100.0

    def get_fpl_pct_monthly(self, income_monthly: float, household_size: int, state: str) -> float:
        return self.get_fpl_pct(income_monthly * 12.0, household_size, state)

    def get_income_at_pct(self, pct: float, household_size: int, state: str) -> float:
        return self.get_fpl(household_size, state) * (pct / 100.0)

    def get_income_at_pct_monthly(self, pct: float, household_size: int, state: str) -> float:
        return self.get_income_at_pct(pct, household_size, state) / 12.0

    def get_source_info(self) -> dict:
        """Returns {source, url, effective_date} from the loaded data."""
        return {
            "source": self.data["source"],
            "url": self.data["url"],
            "effective_date": self.data["effective_date"],
        }


fpl_loader = FPLLoader()
