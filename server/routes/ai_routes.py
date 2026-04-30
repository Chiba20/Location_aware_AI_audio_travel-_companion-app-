import json
import os
import urllib.error
import urllib.request

from flask import Blueprint

from utils.api_utils import get_json_body, success

bp = Blueprint("ai", __name__)


def _local_story(body):
    city_name = body.get("cityName") or "this city"
    interest = body.get("interest") or "heritage"
    style = body.get("narrationStyle") or "warm"
    places = body.get("places") or []
    featured = places[:4]

    place_lines = []
    for place in featured:
        name = place.get("name", "a local place")
        story = place.get("story") or place.get("didYouKnow") or "It adds another layer to the journey."
        place_lines.append(f"{name}: {story}")

    body_text = " ".join(place_lines) if place_lines else "Start with the main streets, listen for local details, and let each stop reveal one small story at a time."
    return (
        f"Here is a {style} personalized story for {city_name}, shaped around {interest}. "
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
        "style": body.get("narrationStyle"),
        "places": body.get("places", [])[:8],
        "instruction": "Create a short, travel-app narration story. Be specific, warm, and factual from the supplied place content only.",
    }
    request_body = json.dumps(
        {
            "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            "messages": [
                {"role": "system", "content": "You write concise location-aware audio travel stories."},
                {"role": "user", "content": json.dumps(prompt)},
            ],
            "temperature": 0.75,
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
    ai_story = _openai_story(body)
    if ai_story:
        return success({"story": ai_story, "source": "ai"}, "Personalized story generated.")

    return success(
        {"story": _local_story(body), "source": "local"},
        "Personalized story generated from available app content.",
    )
