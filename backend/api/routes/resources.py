"""Resources route — local resource finder via OpenStreetMap.

Mounted at /api/resources (see main.py).

SKELETON: handler is stubbed. See CLAUDE.md "Module G → routes/resources.py".
"""

import math
import re

from fastapi import APIRouter, HTTPException, Request

from config import settings
from schemas import ResourcesResponse
from modules.resources.google_places import GooglePlacesClient
from modules.resources.normalizer import normalize_element
from modules.resources.overpass import OverpassClient

router = APIRouter()


@router.get("", response_model=ResourcesResponse)
async def get_resources(
    request: Request,
    zip_code: str | None = None,
    state: str | None = None,
    program: str | None = None,
    radius_meters: int = 8000,
    travel_mode: str = "TRANSIT",
) -> ResourcesResponse:
    """If zip_code is provided, geocode it and fetch OSM resources. Otherwise return
    an empty list with a note prompting for a zip code."""
    if not zip_code:
        return ResourcesResponse(resources=[], zip_code=None, message="Provide a ZIP code to find nearby help.")
    if not re.fullmatch(r"\d{5}", zip_code):
        raise HTTPException(status_code=400, detail="ZIP code must contain five digits")
    supported = {"snap", "wic", "medicaid", "chip", "liheap", "tanf", "food", "health", "housing", "community"}
    if program and program not in supported:
        raise HTTPException(status_code=400, detail="Unsupported resource category")

    radius = max(1000, min(radius_meters, 20_000))
    api_key = settings.google_maps_server_api_key or settings.google_places_api_key
    if api_key:
        google = GooglePlacesClient(api_key)
        center = await google.geocode_zip(zip_code)
        if center:
            resources = await google.search(zip_code, center[0], center[1], program, radius, travel_mode.upper())
            if resources:
                return ResourcesResponse(
                    resources=resources,
                    source="Google Places",
                    zip_code=zip_code,
                    center_lat=center[0],
                    center_lon=center[1],
                )

    osm = OverpassClient()
    center = await osm.geocode_zip(zip_code)
    if not center:
        return ResourcesResponse(
            resources=[], zip_code=zip_code, message="We could not locate that ZIP code. Check it and try again."
        )
    elements = await osm.fetch_resources(center[0], center[1], radius, [program] if program else None)
    resources = [resource for element in elements if (resource := normalize_element(element))]
    for resource in resources:
        if resource.lat is not None and resource.lon is not None:
            resource.distance_meters = round(_distance(center[0], center[1], resource.lat, resource.lon))
    resources.sort(key=lambda item: item.distance_meters or 10_000_000)
    return ResourcesResponse(
        resources=resources[:20],
        source="OpenStreetMap",
        zip_code=zip_code,
        center_lat=center[0],
        center_lon=center[1],
        message=None if resources else "No nearby resources were found. Try a larger search area or another category.",
    )


def _distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    value = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(value), math.sqrt(1 - value))
