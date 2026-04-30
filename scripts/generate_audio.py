import json
import re
import sys
from pathlib import Path

from gtts import gTTS


ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT / "server"))

from utils.place_data import read_place_catalog

NARRATIONS_FILE = ROOT / "server" / "data" / "audio_narrations.json"
AUDIO_ROOT = ROOT / "client" / "public" / "audio"


def clean_text(text):
    return re.sub(r"\s+", " ", text).strip()


def generate_audio(force=False):
    narrations = json.loads(NARRATIONS_FILE.read_text(encoding="utf-8"))
    narrations_by_path = {item["audioPath"]: item for item in narrations}
    for place in read_place_catalog(str(ROOT / "server")):
        audio_url = place.get("audio", {}).get("url")
        narration = place.get("audioNarration")
        if not audio_url or not narration or not audio_url.startswith("/audio/"):
            continue
        audio_path = audio_url.removeprefix("/audio/")
        narrations_by_path.setdefault(
            audio_path,
            {
                "audioPath": audio_path,
                "text": narration,
            },
        )

    narrations = list(narrations_by_path.values())
    AUDIO_ROOT.mkdir(parents=True, exist_ok=True)

    generated = []
    skipped = []
    for item in narrations:
        output = AUDIO_ROOT / item["audioPath"]
        if output.exists() and not force:
            skipped.append(str(output.relative_to(ROOT)))
            continue

        output.parent.mkdir(parents=True, exist_ok=True)
        is_service_audio = str(item["audioPath"]).startswith("services/")
        tts = gTTS(text=clean_text(item["text"]), lang="en", slow=not is_service_audio)
        tts.save(str(output))
        generated.append(str(output.relative_to(ROOT)))

    return generated, skipped


if __name__ == "__main__":
    generated_files, skipped_files = generate_audio(force=False)
    print(f"Generated {len(generated_files)} audio file(s).")
    for path in generated_files:
        print(f"  created {path}")
    print(f"Skipped {len(skipped_files)} existing audio file(s).")
