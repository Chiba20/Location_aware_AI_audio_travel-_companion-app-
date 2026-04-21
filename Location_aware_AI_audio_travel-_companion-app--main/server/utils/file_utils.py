import json
import os
import tempfile


def read_json(path, default=None):
    if not os.path.exists(path):
        if default is not None:
            return default
        raise FileNotFoundError(f"Data file not found: {path}")

    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in {path}") from exc


def write_json(path, data):
    directory = os.path.dirname(path)
    os.makedirs(directory, exist_ok=True)

    fd, temp_path = tempfile.mkstemp(prefix=".tmp-", suffix=".json", dir=directory)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
        os.replace(temp_path, path)
    except Exception:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise


def next_id(items):
    if not items:
        return 1
    return max(int(item.get("id", 0)) for item in items) + 1
