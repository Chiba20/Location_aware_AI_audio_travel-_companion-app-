import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PLACES_FILE = ROOT / "server" / "data" / "places.json"


def distance_meters(first_lat, first_lon, second_lat, second_lon):
    earth_radius_meters = 6371000
    lat1 = math.radians(first_lat)
    lat2 = math.radians(second_lat)
    delta_lat = math.radians(second_lat - first_lat)
    delta_lon = math.radians(second_lon - first_lon)
    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lon / 2) ** 2
    )
    return earth_radius_meters * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def nearest_place(latitude, longitude, city_id=None, interest=None):
    places = json.loads(PLACES_FILE.read_text(encoding="utf-8"))
    candidates = []
    for place in places:
        if city_id is not None and place.get("cityId") != city_id:
            continue
        if interest and interest.lower() not in {item.lower() for item in place.get("interests", [])}:
            continue
        if not place.get("latitude") or not place.get("longitude"):
            continue
        distance = distance_meters(latitude, longitude, place["latitude"], place["longitude"])
        candidates.append((distance, place))
    return min(candidates, key=lambda item: item[0])


def assert_nearest(latitude, longitude, expected_name, city_id=None, interest=None):
    distance, place = nearest_place(latitude, longitude, city_id=city_id, interest=interest)
    radius = float(place.get("triggerRadius", 0))
    if place["name"] != expected_name:
        raise AssertionError(
            f"Expected nearest place to be {expected_name}, got {place['name']} at {distance:.1f}m"
        )
    if distance > radius:
        raise AssertionError(
            f"{place['name']} is nearest but will not trigger: {distance:.1f}m > {radius:.1f}m radius"
        )
    print(f"OK: {expected_name} is nearest and triggers at {distance:.1f}m.")


if __name__ == "__main__":
    assert_nearest(12.9891125, 80.2344435, "Sabarmati Hostel", city_id=3)
    assert_nearest(12.9891125, 80.2344435, "Sabarmati Hostel", city_id=3, interest="hostels")
