"""Normalize raw OSM Overpass elements into the Resource model.

SKELETON: not yet implemented. See CLAUDE.md Module F for the amenity→category
mapping and tag extraction.
"""

from backend.schemas import Resource


def normalize_element(element: dict) -> Resource | None:
    """Map an OSM element's tags to a Resource (name, category, address, phone,
    website, lat, lon). Returns None if the element has no `name` tag."""
    tags = element.get("tags") or {}
    name = tags.get("name") or tags.get("operator")
    if not name:
        return None

    amenity = tags.get("amenity", "")
    social = tags.get("social_facility", "")
    healthcare = tags.get("healthcare", "")
    office = tags.get("office", "")
    haystack = " ".join((name, amenity, social, healthcare, office)).lower()

    if any(word in haystack for word in ("food_bank", "food bank", "food pantry", "food_pantry")):
        category = "food"
    elif any(word in haystack for word in ("clinic", "health", "medical")):
        category = "health"
    elif any(word in haystack for word in ("shelter", "housing")):
        category = "housing"
    elif office == "government":
        category = "government"
    else:
        category = "community"

    address_parts = [
        " ".join(filter(None, (tags.get("addr:housenumber"), tags.get("addr:street")))).strip(),
        tags.get("addr:city"),
        tags.get("addr:state"),
        tags.get("addr:postcode"),
    ]
    address = ", ".join(part for part in address_parts if part) or None
    center = element.get("center") or {}
    lat = element.get("lat", center.get("lat"))
    lon = element.get("lon", center.get("lon"))
    element_type = element.get("type", "node")
    element_id = str(element.get("id", ""))

    program_ids: list[str] = []
    name_lower = name.lower()
    for program_id in ("snap", "wic", "medicaid", "chip", "liheap", "tanf"):
        if program_id in name_lower:
            program_ids.append(program_id)

    return Resource(
        id=f"osm:{element_type}:{element_id}",
        name=name,
        category=category,
        address=address,
        phone=tags.get("contact:phone") or tags.get("phone"),
        website=tags.get("contact:website") or tags.get("website"),
        lat=lat,
        lon=lon,
        directions_url=(
            f"https://www.openstreetmap.org/directions?to={lat}%2C{lon}"
            if lat is not None and lon is not None
            else None
        ),
        program_ids=program_ids,
        source="OpenStreetMap",
    )
