import os
from utils.file_utils import read_json
from utils.api_utils import ApiError, success
from utils.place_data import read_place_catalog

BASE = os.path.dirname(os.path.dirname(__file__))
FILE = os.path.join(BASE, "data/cities.json")
WALKS_FILE = os.path.join(BASE, "data/walks.json")


def get_cities():
    cities = read_json(FILE, [])
    return success(cities, meta={"count": len(cities)})


def get_city(city_id):
    cities = read_json(FILE, [])
    city = next((c for c in cities if c.get("id") == city_id), None)
    if not city:
        raise ApiError("City not found", 404)

    places = [place for place in read_place_catalog(BASE) if place.get("cityId") == city_id]
    walks = [walk for walk in read_json(WALKS_FILE, []) if walk.get("cityId") == city_id]
    categories = sorted({place.get("category") for place in places if place.get("category")})
    enriched_city = {
        **city,
        "places": places,
        "walks": walks,
        "availableSections": ["History", "Hidden Gems", "Heritage Walks", "Food Streets", "Did You Know", *categories],
    }
    return success(enriched_city)
