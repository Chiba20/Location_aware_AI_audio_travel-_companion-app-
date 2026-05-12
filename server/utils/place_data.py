import os
import re

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
    narration = (
        narrations.get(place.get("id"))
        or _service_audio_narration(place)
    )
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


def _service_audio_narration(place):
    if place.get("id", 0) < 1000:
        return None

    category = place.get("category", "Local service")
    address = place.get("address", "Kanchipuram")
    contact = place.get("contact")
    timings = place.get("timings")
    name = place.get("name", category)
    slug = _slugify(name)
    extra = []
    if contact and contact.lower() not in ("not listed", "check store", "local station contact"):
        extra.append(f"Contact information listed for this service is {contact}.")
    if timings:
        extra.append(f"Timing information listed for this service is {timings}.")

    category_text = _service_category_text(category)
    details = " ".join(extra)
    text = (
        f"{name} is listed as a {category.lower()} traveller service in Kanchipuram. "
        f"{category_text} This entry is useful when a traveller needs practical help near {address}. "
        f"{details} Please confirm live availability, prices, and emergency details locally before relying on the service."
    ).strip()
    return {
        "placeId": place["id"],
        "audioPath": f"services/{place['id']}-{slug}.mp3",
        "durationSeconds": 55,
        "sources": [],
        "text": text,
    }


def _slugify(value):
    value = re.sub(r"[^a-z0-9]+", "-", value.lower())
    return value.strip("-")[:72] or "service"


def _service_category_text(category):
    descriptions = {
        "ATM": "It can help with quick cash access during a walk, shopping trip, or temple visit.",
        "Bank": "It can help with banking support, account services, card help, and financial queries.",
        "Dress shop": "It can help travellers buy clothing, basic travel wear, or local fashion items.",
        "Hospital": "It can help with medical attention, emergency care, consultation, or health support.",
        "Hotel": "It can help travellers choose a stay, contact the property, check location convenience, and plan temple-town movement.",
        "Juice shop": "It can help with a short refreshment stop for juice, chilled drinks, or a rest break.",
        "Mechanic": "It can help with two-wheeler or vehicle repair support during local travel.",
        "Medical shop": "It can help with medicines, first-aid needs, and pharmacy support while travelling.",
        "Money transfer": "It can help with money transfer, finance, or cash-related support.",
        "Petrol bunk": "It can help with fuel, vehicle stops, and basic road-trip support.",
        "Police station": "It can help with safety, reporting problems, or emergency assistance.",
        "Puncture shop": "It can help with tyre puncture repair and small vehicle emergencies.",
        "Restaurant": "It can help with meals, rest breaks, and local dining during a city visit.",
        "Super market": "It can help with groceries, water, snacks, toiletries, and travel essentials.",
        "Tea shop": "It can help with tea, coffee, quick snacks, and a short local pause.",
        "Theatre": "It can help travellers find local entertainment and cinema options.",
    }
    return descriptions.get(category, "It can help with practical traveller needs during a city visit.")
