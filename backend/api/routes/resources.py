"""Resources route — local resource finder via OpenStreetMap.

Mounted at /api/resources (see main.py).

SKELETON: handler is stubbed. See CLAUDE.md "Module G → routes/resources.py".
"""

from fastapi import APIRouter, Request

from backend.schemas import ResourcesResponse

router = APIRouter()


@router.get("", response_model=ResourcesResponse)
async def get_resources(
    request: Request,
    zip_code: str | None = None,
    state: str | None = None,
) -> ResourcesResponse:
    """If zip_code is provided, geocode it and fetch OSM resources. Otherwise return
    an empty list with a note prompting for a zip code."""
    raise NotImplementedError("TODO: implement /api/resources")
