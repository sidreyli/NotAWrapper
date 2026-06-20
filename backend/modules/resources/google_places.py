"""Google Places, Geocoding, and Routes adapter for public-service search."""

import logging
import math
import re

import httpx

from backend.schemas import Resource

logger = logging.getLogger(__name__)

PROGRAM_QUERIES = {
    "snap": "SNAP benefits office or food assistance enrollment",
    "wic": "WIC clinic",
    "medicaid": "Medicaid enrollment assistance office",
    "chip": "CHIP children's health insurance enrollment assistance",
    "liheap": "LIHEAP utility assistance office",
    "tanf": "TANF public assistance office",
    "food": "food bank or food pantry",
    "health": "community health clinic",
    "housing": "housing assistance or emergency shelter",
    "community": "social services community assistance",
}


class GooglePlacesClient:
    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    async def geocode_zip(self, zip_code: str) -> tuple[float, float] | None:
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(
                    "https://maps.googleapis.com/maps/api/geocode/json",
                    params={"address": zip_code, "components": "country:US", "key": self.api_key},
                )
                response.raise_for_status()
                payload = response.json()
                if payload.get("status") != "OK" or not payload.get("results"):
                    return None
                location = payload["results"][0]["geometry"]["location"]
                return float(location["lat"]), float(location["lng"])
        except (httpx.HTTPError, ValueError, KeyError, IndexError) as exc:
            logger.warning("Google ZIP geocoding failed: %s", exc)
            return None

    async def search(
        self,
        zip_code: str,
        lat: float,
        lon: float,
        program: str | None,
        radius_meters: int,
        travel_mode: str,
    ) -> list[Resource]:
        query = PROGRAM_QUERIES.get(program or "", "public benefits and social services")
        body = {
            "textQuery": f"{query} near {zip_code}",
            "maxResultCount": 12,
            "locationBias": {
                "circle": {
                    "center": {"latitude": lat, "longitude": lon},
                    "radius": float(max(1000, min(radius_meters, 20_000))),
                }
            },
        }
        fields = ",".join(
            (
                "places.id",
                "places.displayName",
                "places.formattedAddress",
                "places.location",
                "places.primaryTypeDisplayName",
                "places.nationalPhoneNumber",
                "places.websiteUri",
                "places.regularOpeningHours",
                "places.googleMapsUri",
            )
        )
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    "https://places.googleapis.com/v1/places:searchText",
                    json=body,
                    headers={"X-Goog-Api-Key": self.api_key, "X-Goog-FieldMask": fields},
                )
                response.raise_for_status()
                places = response.json().get("places", [])
        except (httpx.HTTPError, ValueError) as exc:
            logger.warning("Google Places search failed: %s", exc)
            return []

        resources = [self._normalize(place, program, lat, lon) for place in places]
        normalized = [resource for resource in resources if resource is not None]
        await self._add_routes(normalized[:5], lat, lon, travel_mode)
        return sorted(
            normalized,
            key=lambda item: (
                item.open_now is not True,
                item.travel_duration_minutes if item.travel_duration_minutes is not None else 10_000,
                item.distance_meters if item.distance_meters is not None else 10_000_000,
            ),
        )

    def _normalize(
        self, place: dict, program: str | None, origin_lat: float, origin_lon: float
    ) -> Resource | None:
        location = place.get("location") or {}
        if not place.get("id") or not place.get("displayName", {}).get("text"):
            return None
        place_lat = location.get("latitude")
        place_lon = location.get("longitude")
        hours = place.get("regularOpeningHours") or {}
        category = (place.get("primaryTypeDisplayName") or {}).get("text", "Social service")
        distance = None
        if place_lat is not None and place_lon is not None:
            distance = round(_haversine_meters(origin_lat, origin_lon, place_lat, place_lon))
        supported_programs = {"snap", "wic", "medicaid", "chip", "liheap", "tanf"}
        return Resource(
            id=f"google:{place['id']}",
            name=place["displayName"]["text"],
            category=category,
            address=place.get("formattedAddress"),
            phone=place.get("nationalPhoneNumber"),
            website=place.get("websiteUri"),
            lat=place_lat,
            lon=place_lon,
            open_now=hours.get("openNow"),
            hours=hours.get("weekdayDescriptions", []),
            directions_url=place.get("googleMapsUri"),
            distance_meters=distance,
            program_ids=[program] if program in supported_programs else [],
            source="Google Places",
        )

    async def _add_routes(
        self, resources: list[Resource], lat: float, lon: float, travel_mode: str
    ) -> None:
        destinations = [
            {"waypoint": {"location": {"latLng": {"latitude": item.lat, "longitude": item.lon}}}}
            for item in resources
            if item.lat is not None and item.lon is not None
        ]
        if not destinations:
            return
        body = {
            "origins": [{"waypoint": {"location": {"latLng": {"latitude": lat, "longitude": lon}}}}],
            "destinations": destinations,
            "travelMode": travel_mode if travel_mode in {"DRIVE", "WALK", "BICYCLE", "TRANSIT"} else "TRANSIT",
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix",
                    json=body,
                    headers={
                        "X-Goog-Api-Key": self.api_key,
                        "X-Goog-FieldMask": "destinationIndex,duration,distanceMeters,condition",
                    },
                )
                response.raise_for_status()
                rows = response.json()
            for row in rows:
                index = row.get("destinationIndex")
                if index is None or index >= len(resources) or row.get("condition") != "ROUTE_EXISTS":
                    continue
                seconds_match = re.match(r"([0-9.]+)s", row.get("duration", ""))
                resources[index].travel_duration_minutes = (
                    max(1, math.ceil(float(seconds_match.group(1)) / 60)) if seconds_match else None
                )
                resources[index].distance_meters = row.get("distanceMeters", resources[index].distance_meters)
        except (httpx.HTTPError, ValueError, TypeError) as exc:
            logger.warning("Google route matrix failed: %s", exc)


def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    value = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(value), math.sqrt(1 - value))
