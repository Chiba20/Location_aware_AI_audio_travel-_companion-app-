import os

from utils.api_utils import ApiError, get_json_body, parse_float, require_fields, success, utc_now_iso
from utils.distance_utils import calculate_distance, is_valid_coordinate
from utils.file_utils import next_id, read_json, write_json
from utils.place_data import read_place_catalog

BASE = os.path.dirname(os.path.dirname(__file__))
FILE = os.path.join(BASE, "data/journey.json")
PLACES_FILE = os.path.join(BASE, "data/places.json")
WALKS_FILE = os.path.join(BASE, "data/walks.json")


def get_journeys():
    journeys = read_json(FILE, [])
    return success(journeys, meta={"count": len(journeys)})


def get_journey(journey_id):
    journey = _find_journey(journey_id)
    return success(journey)


def start():
    journeys = read_json(FILE, [])
    body = get_json_body()
    require_fields(body, ["cityId"])

    journey = {
        "id": next_id(journeys),
        "cityId": int(body["cityId"]),
        "walkId": body.get("walkId"),
        "interests": body.get("interests", []),
        "narrationStyle": body.get("narrationStyle", "casual friend"),
        "offlineMode": bool(body.get("offlineMode", False)),
        "startedAt": utc_now_iso(),
        "endedAt": None,
        "status": "active",
        "visitedPlaceIds": [],
        "lastLocation": None,
    }
    journeys.append(journey)
    write_json(FILE, journeys)
    return success(journey, "Journey started", 201)


def update_location(journey_id):
    journeys = read_json(FILE, [])
    journey = _find_journey(journey_id, journeys)
    if journey.get("status") != "active":
        raise ApiError("Journey is not active", 409)

    body = get_json_body()
    latitude = parse_float(body.get("latitude"), "latitude")
    longitude = parse_float(body.get("longitude"), "longitude")
    if not is_valid_coordinate(latitude, longitude):
        raise ApiError("latitude or longitude is outside valid range", 400)

    triggered = []
    city_places = [
        place for place in read_place_catalog(BASE)
        if place.get("cityId") == journey.get("cityId")
    ]
    allowed_place_ids = _allowed_place_ids(journey, city_places)

    for place in city_places:
        if allowed_place_ids and place.get("id") not in allowed_place_ids:
            continue
        distance = calculate_distance(latitude, longitude, place["latitude"], place["longitude"])
        if distance <= float(place.get("triggerRadius", 100)):
            triggered.append({**place, "distanceMeters": round(distance, 2)})
            if place["id"] not in journey["visitedPlaceIds"]:
                journey["visitedPlaceIds"].append(place["id"])

    journey["lastLocation"] = {
        "latitude": latitude,
        "longitude": longitude,
        "updatedAt": utc_now_iso(),
    }
    write_json(FILE, journeys)
    return success({"journey": journey, "triggeredPlaces": triggered}, "Location updated")


def end(journey_id):
    journeys = read_json(FILE, [])
    journey = _find_journey(journey_id, journeys)
    if journey.get("status") == "completed":
        return success(journey, "Journey already completed")

    journey["status"] = "completed"
    journey["endedAt"] = utc_now_iso()
    write_json(FILE, journeys)
    return success(journey, "Journey completed")


def _find_journey(journey_id, journeys=None):
    journeys = journeys if journeys is not None else read_json(FILE, [])
    journey = next((item for item in journeys if item.get("id") == journey_id), None)
    if not journey:
        raise ApiError("Journey not found", 404)
    return journey


def _allowed_place_ids(journey, city_places):
    if journey.get("walkId"):
        walks = read_json(WALKS_FILE, [])
        walk = next((item for item in walks if item.get("id") == journey.get("walkId")), None)
        if walk:
            return set(walk.get("placeIds", []))

    interests = [interest.lower() for interest in journey.get("interests", [])]
    if not interests:
        return set()

    return {
        place["id"]
        for place in city_places
        if set(interests).intersection({item.lower() for item in place.get("interests", [])})
    }
