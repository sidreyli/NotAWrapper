"""Normalize raw OSM Overpass elements into the Resource model.

SKELETON: not yet implemented. See CLAUDE.md Module F for the amenity→category
mapping and tag extraction.
"""

from backend.schemas import Resource


def normalize_element(element: dict) -> Resource | None:
    """Map an OSM element's tags to a Resource (name, category, address, phone,
    website, lat, lon). Returns None if the element has no `name` tag."""
    raise NotImplementedError("TODO: implement OSM element normalization")
