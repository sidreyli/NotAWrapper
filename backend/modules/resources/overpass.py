"""OpenStreetMap Overpass + Nominatim client for finding local resources.

Best-effort: failures return empty/None rather than raising.

SKELETON: methods are not yet implemented. The exact Overpass QL query and the
Nominatim request shape will be verified against the live OSM API docs during the
implementation pass (see CLAUDE.md Module F).
"""

import httpx  # noqa: F401  (used in the implementation pass)


class OverpassClient:
    OVERPASS_URL = "https://overpass-api.de/api/interpreter"

    async def fetch_resources(
        self,
        lat: float,
        lon: float,
        radius_meters: int = 5000,
        categories: list[str] | None = None,
    ) -> list[dict]:
        """Query Overpass for social facilities, food banks, community centres,
        clinics, and government offices within `radius_meters`. Returns the raw
        `elements` array, or [] on any failure (does not raise)."""
        raise NotImplementedError("TODO: build Overpass QL query (10s httpx timeout)")

    async def geocode_zip(self, zip_code: str) -> tuple[float, float] | None:
        """Geocode a US zip code via Nominatim. Returns (lat, lon) or None on failure."""
        raise NotImplementedError("TODO: Nominatim geocode (User-Agent header required)")
