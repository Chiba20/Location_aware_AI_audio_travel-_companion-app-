import json
import re
from pathlib import Path

from gtts import gTTS


ROOT = Path(__file__).resolve().parents[1]
NARRATIONS_FILE = ROOT / "server" / "data" / "audio_narrations.json"
AUDIO_ROOT = ROOT / "client" / "public" / "audio"


def clean_text(text):
    return re.sub(r"\s+", " ", text).strip()


def generate_audio(force=False):
    narrations = json.loads(NARRATIONS_FILE.read_text(encoding="utf-8"))
    AUDIO_ROOT.mkdir(parents=True, exist_ok=True)

    generated = []
    skipped = []
    for item in narrations:
        output = AUDIO_ROOT / item["audioPath"]
        if output.exists() and not force:
            skipped.append(str(output.relative_to(ROOT)))
            continue

        output.parent.mkdir(parents=True, exist_ok=True)
        tts = gTTS(text=clean_text(item["text"]), lang="en", slow=False)
        tts.save(str(output))
        generated.append(str(output.relative_to(ROOT)))

    return generated, skipped


if __name__ == "__main__":
    generated_files, skipped_files = generate_audio(force=False)
    print(f"Generated {len(generated_files)} audio file(s).")
    for path in generated_files:
        print(f"  created {path}")
    print(f"Skipped {len(skipped_files)} existing audio file(s).")
