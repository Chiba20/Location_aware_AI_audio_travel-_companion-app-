import os

from utils.file_utils import read_json


def _service_defaults(place):
    if "latitude" in place and "longitude" in place:
        return place

    index = int(place.get("id", 1000)) - 1000
    lat_offset = ((index % 11) - 5) * 0.0021
    lon_offset = (((index // 11) % 11) - 5) * 0.0021
    category = place.get("category", "Local service")
    address = place.get("address", "Kanchipuram")
    contact = place.get("contact")
    timings = place.get("timings")
    details = []
    if contact:
        details.append(f"Contact: {contact}")
    if timings:
        details.append(f"Timing: {timings}")

    return {
        "triggerRadius": 160,
        "audioUrl": None,
        "audio": {
            "url": None,
            "durationSeconds": 45,
            "offlineAvailable": True,
        },
        "story": f"{category} stop at {address}. {'; '.join(details)}".strip(),
        "didYouKnow": "This entry comes from the local Kanchipuram service directory.",
        "interests": [category.lower(), "local services"],
        "isHiddenGem": False,
        "latitude": round(12.8397 + lat_offset, 6),
        "longitude": round(79.7042 + lon_offset, 6),
        **place,
    }


def read_place_catalog(base_dir):
    places_file = os.path.join(base_dir, "data/places.json")
    services_file = os.path.join(base_dir, "data/service_places.json")
    narrations_file = os.path.join(base_dir, "data/audio_narrations.json")
    places = read_json(places_file, [])
    services = [_service_defaults(place) for place in read_json(services_file, [])]
    narrations = {
        item["placeId"]: item
        for item in read_json(narrations_file, [])
    }
    return [_with_audio_narration(place, narrations) for place in places + services]


def _with_audio_narration(place, narrations):
    narration = narrations.get(place.get("id"))
    if not narration:
        return place

    audio_url = f"/audio/{narration['audioPath']}"
    audio = {
        **place.get("audio", {}),
        "url": audio_url,
        "durationSeconds": narration.get("durationSeconds", place.get("audio", {}).get("durationSeconds")),
        "offlineAvailable": True,
    }
    return {
        **place,
        "audioUrl": audio_url,
        "audio": audio,
        "audioNarration": narration["text"],
        "audioSources": narration.get("sources", []),
    }
