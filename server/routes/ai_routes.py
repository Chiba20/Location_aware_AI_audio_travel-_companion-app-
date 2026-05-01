import json
import os
import random
import urllib.error
import urllib.request

from flask import Blueprint

from utils.api_utils import get_json_body, success

bp = Blueprint("ai", __name__)


def _style_prefix(style):
    normalized = (style or "warm").strip().lower()
    if normalized == "historical":
        return "historical guide"
    if normalized == "short and cinematic":
        return "short cinematic"
    if normalized == "family friendly":
        return "family friendly"
    return "warm traveller"


def _clean_text(value):
    return " ".join(str(value or "").split())


def _place_fact(place):
    story = _clean_text(place.get("story"))
    did_you_know = _clean_text(place.get("didYouKnow"))
    if story and did_you_know:
        return f"{story} A useful detail: {did_you_know}"
    return story or did_you_know


def _local_generated_story(body):
    city_name = body.get("cityName") or "this city"
    interest = body.get("interest") or "local places"
    style = _style_prefix(body.get("narrationStyle"))
    places = [place for place in body.get("places", []) if place.get("name")][:8]
    featured = random.sample(places, k=min(len(places), 3)) if places else []

    openings = {
        "historical guide": [
            f"Start reading {city_name} through the places that still hold its memory.",
            f"Think of {city_name} as a route through evidence, habit, and local meaning.",
        ],
        "short cinematic": [
            f"{city_name} opens in small scenes: names, streets, pauses, and details.",
            f"Step into {city_name} and let the city arrive in fragments.",
        ],
        "family friendly": [
            f"Imagine {city_name} as a story trail where every stop gives you one clue.",
            f"Here is a simple way to explore {city_name}: look, listen, and connect the clues.",
        ],
        "warm traveller": [
            f"Here is a fresh story for {city_name}, shaped around {interest}.",
            f"Walk through {city_name} with {interest} in mind, and the place starts to feel more personal.",
        ],
    }

    transitions = {
        "historical guide": "Notice how this stop connects place, memory, and public life:",
        "short cinematic": "Hold this image for a moment:",
        "family friendly": "Here is one clue to look for:",
        "warm traveller": "Let this detail guide your attention:",
    }

    endings = {
        "historical guide": [
            "The point is not only to visit the stop, but to notice what it reveals about how the city remembers itself.",
            "Use these details as anchors, then look for the quieter evidence around them.",
        ],
        "short cinematic": [
            "Move slowly; the strongest part of the story may be the detail you almost missed.",
            "The city feels richer when each stop becomes a frame instead of a checklist.",
        ],
        "family friendly": [
            "By the end, the city feels less like a map and more like a puzzle you helped solve.",
            "Keep asking what each place is trying to show you, and the route becomes easier to remember.",
        ],
        "warm traveller": [
            "The best way to receive the story is to slow down and let the place meet you at street level.",
            "A good journey here is less about rushing and more about noticing what stays with you.",
        ],
    }

    opening = random.choice(openings[style])
    ending = random.choice(endings[style])
    transition = transitions[style]
    fact_lines = []

    for place in featured:
        fact = _place_fact(place)
        if not fact:
            continue
        category = _clean_text(place.get("category"))
        label = f"{place['name']} ({category})" if category else place["name"]
        fact_lines.append(f"{transition} {label} - {fact}")

    if not fact_lines:
        fact_lines.append(
            "Start with the visible details: names, routes, shopfronts, materials, sounds, and the way people use the place."
        )

    return " ".join([opening, *fact_lines, ending])


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
            "Create one short travel-app narration story using only the supplied referenceNotes and places. "
            "Do not copy the saved story verbatim. Rewrite it naturally as fresh narration. "
            "Do not add dates, dynasties, claims, legends, people, or facts that are not present in the supplied content. "
            "If facts are limited, keep the story atmospheric and honest instead of inventing details. "
            "Mention the place or city by name, keep it useful for a traveller who is standing nearby, and stay under 180 words. "
            "The selected style changes tone only, not facts."
        ),
    }
    request_body = json.dumps(
        {
            "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            "messages": [
                {"role": "system", "content": "You write concise, factual location-aware travel stories from provided facts only. You never invent historical details."},
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
    except (KeyError, urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
        return None


@bp.post("/personalized-story")
def personalized_story():
    body = get_json_body()
    ai_story = _openai_story(body)
    if ai_story:
        return success(
            {"story": ai_story, "source": "ai"},
            "AI story generated from place facts.",
        )

    return success(
        {"story": _local_generated_story(body), "source": "local"},
        "Story generated from place facts.",
    )
