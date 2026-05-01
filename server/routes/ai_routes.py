import json
import os
import urllib.error
import urllib.request

from flask import Blueprint

from utils.api_utils import get_json_body, success

bp = Blueprint("ai", __name__)


def _is_history_interest(body):
    return (body.get("interest") or "").strip().lower() == "history"


def _style_prefix(style):
    normalized = (style or "warm").strip().lower()
    if normalized == "historical":
        return "historical guide"
    if normalized == "short and cinematic":
        return "short cinematic"
    if normalized == "family friendly":
        return "family friendly"
    return "warm traveller"


def _history_story(body):
    city_name = body.get("cityName") or "this city"
    style = _style_prefix(body.get("narrationStyle"))
    notes = body.get("referenceNotes") or {}
    places = body.get("places") or []
    place_names = [place.get("name") for place in places[:5] if place.get("name")]

    intro = notes.get("intro") or (
        f"{city_name} is best understood as a layered historic city shaped by rulers, sacred institutions, craft, and everyday local memory."
    )
    known_for = notes.get("knownFor") or []
    explore = notes.get("explore") or []
    known_text = " ".join(known_for[:3])
    explore_text = " ".join(explore[:3])
    route_text = ", ".join(place_names)

    if style == "historical guide":
        route_sentence = f" For a focused route, begin with {route_text}." if route_text else ""
        return (
            f"{city_name} should be read as a historical city, not only as a collection of tourist stops. "
            f"{intro} "
            f"Its importance comes from these connected layers: {known_text} "
            f"When you explore it, look for evidence in temple planning, inscriptions, sacred tanks, processional streets, silk traditions, and old neighbourhoods. "
            f"{explore_text}"
            f"{route_sentence} "
            "Keep legend and devotion in view, but separate them from confirmed historical claims."
        ).strip()

    if style == "short cinematic":
        stops = f" Names pass by: {route_text}." if route_text else ""
        return (
            f"{city_name}: stone corridors, silk threads, temple bells, shaded lanes. "
            f"A Pallava capital became a sacred city, a learning centre, and a living craft place. "
            f"History here is not behind glass. It is under your feet, in carved walls, in streets shaped by worship, and in sarees still woven for important days. "
            f"{stops} "
            "Walk slowly. Let each stop feel like one frame in a long Tamil memory."
        ).strip()

    if style == "family friendly":
        route_sentence = f" Places like {route_text} can help you spot these clues one by one." if route_text else ""
        return (
            f"Imagine {city_name} as a big history puzzle. "
            f"One piece is kings and old dynasties, another is temples and worship, another is silk weaving, and another is everyday street life. "
            f"{intro} "
            f"As you walk, ask simple questions: Who built this? Why did people gather here? What stories did families carry from one generation to the next? "
            f"{route_sentence} "
            "The fun is in noticing small clues: towers, pillars, tanks, looms, doorways, and busy temple streets."
        ).strip()

    route_sentence = f" If you want a good starting path, try {route_text}." if route_text else ""
    return (
        f"Walk through {city_name} slowly and the history starts to feel close. "
        f"{intro} "
        f"You can sense the past in temple walls, silk streets, old lanes, and the way daily life still moves around sacred places. "
        f"{known_text} "
        f"{route_sentence} "
        "The best way to understand it is not to rush from monument to monument, but to notice how power, devotion, craft, and ordinary life stayed connected."
    ).strip()


def _local_story(body):
    city_name = body.get("cityName") or "this city"
    interest = body.get("interest") or "heritage"
    style = _style_prefix(body.get("narrationStyle"))
    places = body.get("places") or []
    featured = places[:4]

    if _is_history_interest(body):
        return _history_story(body)

    place_lines = []
    for place in featured:
        name = place.get("name", "a local place")
        story = place.get("story") or place.get("didYouKnow") or "It adds another layer to the journey."
        place_lines.append(f"{name}: {story}")

    body_text = " ".join(place_lines) if place_lines else "Start with the main streets, listen for local details, and let each stop reveal one small story at a time."
    return (
        f"Here is a {style} story for {city_name}, shaped around {interest}. "
        f"As you move through the city, treat each stop like a living memory rather than only a destination. "
        f"{body_text} "
        "The best way to experience it is slowly: notice the sounds, the shopfronts, the old stone, and the everyday people who keep the place alive."
    )


def _openai_story(body):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    prompt = {
        "city": body.get("cityName"),
        "interest": body.get("interest"),
        "style": _style_prefix(body.get("narrationStyle")),
        "referenceNotes": body.get("referenceNotes"),
        "places": body.get("places", [])[:8],
        "instruction": (
            "Create a short travel-app narration story using only the supplied referenceNotes and places. "
            "Do not add dates, dynasties, claims, legends, or facts that are not present in the supplied content. "
            "If the interest is history, explain layered historical meaning clearly: dynasties, sacred geography, craft, inscriptions, and living heritage. "
            "The selected style changes tone only, not facts."
        ),
    }
    request_body = json.dumps(
        {
            "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            "messages": [
                {"role": "system", "content": "You write concise, factual location-aware travel stories. You never invent historical details."},
                {"role": "user", "content": json.dumps(prompt)},
            ],
            "temperature": 0.25,
            "max_tokens": 420,
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=request_body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=18) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"].strip()
    except (KeyError, urllib.error.URLError, TimeoutError):
        return None


@bp.post("/personalized-story")
def personalized_story():
    body = get_json_body()
    if _is_history_interest(body):
        return success(
            {"story": _local_story(body), "source": "curated"},
            "Personalized history story generated from curated app content.",
        )

    ai_story = _openai_story(body)
    if ai_story:
        return success({"story": ai_story, "source": "ai"}, "Personalized story generated.")

    return success(
        {"story": _local_story(body), "source": "local"},
        "Personalized story generated from available app content.",
    )
