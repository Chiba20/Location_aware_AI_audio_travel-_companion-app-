import os

from utils.api_utils import ApiError, success
from utils.file_utils import read_json

BASE = os.path.dirname(os.path.dirname(__file__))
FILE = os.path.join(BASE, "data/walks.json")
PLACES_FILE = os.path.join(BASE, "data/places.json")


def get_walks():
    walks = read_json(FILE, [])
    return success(walks, meta={"count": len(walks)})


def get_walk(walk_id):
    walks = read_json(FILE, [])
    walk = next((item for item in walks if item.get("id") == walk_id), None)
    if not walk:
        raise ApiError("Walk not found", 404)

    places = read_json(PLACES_FILE, [])
    place_lookup = {place.get("id"): place for place in places}
    ordered_places = [
        place_lookup[place_id]
        for place_id in walk.get("placeIds", [])
        if place_id in place_lookup
    ]

    return success({**walk, "places": ordered_places})
