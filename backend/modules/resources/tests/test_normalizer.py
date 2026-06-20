from modules.resources.normalizer import normalize_element


def test_normalizes_named_food_bank() -> None:
    resource = normalize_element(
        {
            "type": "node",
            "id": 42,
            "lat": 34.0,
            "lon": -118.0,
            "tags": {
                "name": "Neighborhood Food Bank",
                "amenity": "social_facility",
                "social_facility": "food_bank",
                "addr:housenumber": "12",
                "addr:street": "Main Street",
            },
        }
    )

    assert resource is not None
    assert resource.id == "osm:node:42"
    assert resource.category == "food"
    assert resource.address == "12 Main Street"
    assert resource.source == "OpenStreetMap"


def test_ignores_unnamed_elements() -> None:
    assert normalize_element({"type": "node", "id": 1, "tags": {"amenity": "clinic"}}) is None
