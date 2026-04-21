import os
from utils.file_utils import read_json
from utils.api_utils import ApiError, success

BASE = os.path.dirname(os.path.dirname(__file__))
FILE = os.path.join(BASE, "data/cities.json")
PLACES_FILE = os.path.join(BASE, "data/places.json")
WALKS_FILE = os.path.join(BASE, "data/walks.json")


def get_cities():
    cities = read_json(FILE, [])
    return success(cities, meta={"count": len(cities)})


def get_city(city_id):
    cities = read_json(FILE, [])
    city = next((c for c in cities if c.get("id") == city_id), None)
    if not city:
        raise ApiError("City not found", 404)

    places = [place for place in read_json(PLACES_FILE, []) if place.get("cityId") == city_id]
    walks = [walk for walk in read_json(WALKS_FILE, []) if walk.get("cityId") == city_id]
    enriched_city = {
        **city,
        "places": places,
        "walks": walks,
        "availableSections": ["History", "Hidden Gems", "Heritage Walks", "Food Streets", "Did You Know"],
    }
    return success(enriched_city)
