"""OpenStreetMap Overpass + Nominatim client for finding local resources.

Best-effort: failures return empty/None rather than raising.

SKELETON: methods are not yet implemented. The exact Overpass QL query and the
Nominatim request shape will be verified against the live OSM API docs during the
implementation pass (see CLAUDE.md Module F).
"""

import logging

import httpx

from config import settings

logger = logging.getLogger(__name__)


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
        radius = max(500, min(radius_meters, 20_000))
        query = f"""
[out:json][timeout:10];
(
  nwr["amenity"~"social_facility|community_centre|social_centre|clinic"](around:{radius},{lat},{lon});
  nwr["social_facility"~"food_bank|food_pantry|shelter"](around:{radius},{lat},{lon});
  nwr["office"="government"](around:{radius},{lat},{lon});
  nwr["healthcare"~"clinic|centre"](around:{radius},{lat},{lon});
);
out center tags 60;
"""
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.post(
                    self.OVERPASS_URL,
                    content=query,
                    headers={"User-Agent": settings.resource_user_agent},
                )
                response.raise_for_status()
                return response.json().get("elements", [])
        except (httpx.HTTPError, ValueError) as exc:
            logger.warning("OSM resource query failed: %s", exc)
            return []

    async def geocode_zip(self, zip_code: str) -> tuple[float, float] | None:
        """Geocode a US zip code via Nominatim. Returns (lat, lon) or None on failure."""
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(
                    "https://nominatim.openstreetmap.org/search",
                    params={
                        "postalcode": zip_code,
                        "country": "United States",
                        "countrycodes": "us",
                        "format": "jsonv2",
                        "limit": 1,
                    },
                    headers={"User-Agent": settings.resource_user_agent},
                )
                response.raise_for_status()
                results = response.json()
                if not results:
                    return None
                return float(results[0]["lat"]), float(results[0]["lon"])
        except (httpx.HTTPError, ValueError, KeyError, IndexError) as exc:
            logger.warning("Nominatim ZIP geocoding failed: %s", exc)
            return None
