import os

from flask import request

from utils.api_utils import ApiError, get_json_body, parse_float, success
from utils.distance_utils import calculate_distance, is_valid_coordinate
from utils.place_data import read_place_catalog

BASE = os.path.dirname(os.path.dirname(__file__))


def _all_places():
    return read_place_catalog(BASE)


def _find_place(place_id):
    places = _all_places()
    place = next((item for item in places if item.get("id") == place_id), None)
    if not place:
        raise ApiError("Place not found", 404)
    return place


def _filtered_places():
    places = _all_places()
    city_id = request.args.get("cityId", type=int)
    interest = request.args.get("interest", type=str)
    hidden_gems = request.args.get("hiddenGems", type=str)

    if city_id is not None:
        places = [place for place in places if place.get("cityId") == city_id]
    if interest:
        interest = interest.lower()
        places = [
            place for place in places
            if interest in [item.lower() for item in place.get("interests", [])]
        ]
    if hidden_gems is not None:
        expected = hidden_gems.lower() in ("1", "true", "yes")
        places = [place for place in places if bool(place.get("isHiddenGem")) is expected]

    return places


def get_places():
    places = _filtered_places()
    return success(places, meta={"count": len(places)})


def get_place(id):
    return success(_find_place(id))


def arrival(id):
    place = _find_place(id)
    body = get_json_body()
    latitude = parse_float(body.get("latitude"), "latitude")
    longitude = parse_float(body.get("longitude"), "longitude")

    if not is_valid_coordinate(latitude, longitude):
        raise ApiError("latitude or longitude is outside valid range", 400)

    distance = calculate_distance(latitude, longitude, place["latitude"], place["longitude"])
    radius = float(place.get("triggerRadius", 100))
    arrived = distance <= radius
    payload = {
        "place": place,
        "arrived": arrived,
        "distanceMeters": round(distance, 2),
        "triggerRadius": radius,
        "audio": place.get("audio") if arrived else None,
        "story": place.get("story") if arrived else None,
    }
    return success(payload, "Arrival checked")


def nearby_places():
    latitude = parse_float(request.args.get("latitude"), "latitude")
    longitude = parse_float(request.args.get("longitude"), "longitude")
    radius = parse_float(request.args.get("radius", 500), "radius")

    if radius <= 0:
        raise ApiError("radius must be greater than zero", 400)
    if not is_valid_coordinate(latitude, longitude):
        raise ApiError("latitude or longitude is outside valid range", 400)

    matches = []
    for place in _filtered_places():
        distance = calculate_distance(latitude, longitude, place["latitude"], place["longitude"])
        if distance <= radius:
            matches.append({**place, "distanceMeters": round(distance, 2)})

    matches.sort(key=lambda item: item["distanceMeters"])
    return success(matches, meta={"count": len(matches), "radius": radius})
