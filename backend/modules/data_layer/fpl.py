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

    def get_fpl(self, household_size: int, state: str) -> float:
        """Annual FPL for a household size and 2-letter state code."""
        raise NotImplementedError("TODO: implement FPL lookup")

    def get_fpl_monthly(self, household_size: int, state: str) -> float:
        raise NotImplementedError("TODO: get_fpl / 12")

    def get_fpl_pct(self, income_annual: float, household_size: int, state: str) -> float:
        raise NotImplementedError("TODO: (income_annual / fpl) * 100")

    def get_fpl_pct_monthly(self, income_monthly: float, household_size: int, state: str) -> float:
        raise NotImplementedError("TODO: convert monthly to annual then get_fpl_pct")

    def get_income_at_pct(self, pct: float, household_size: int, state: str) -> float:
        raise NotImplementedError("TODO: annual income equivalent to pct of FPL")

    def get_income_at_pct_monthly(self, pct: float, household_size: int, state: str) -> float:
        raise NotImplementedError("TODO: get_income_at_pct / 12")

    def get_source_info(self) -> dict:
        """Returns {source, url, effective_date} from the loaded data."""
        return {
            "source": self.data["source"],
            "url": self.data["url"],
            "effective_date": self.data["effective_date"],
        }


fpl_loader = FPLLoader()
