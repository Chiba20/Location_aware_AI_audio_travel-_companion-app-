import os
<<<<<<< HEAD
from utils.api_utils import get_json_body, require_fields, success, utc_now_iso
from utils.file_utils import next_id, read_json, write_json
=======
from flask import jsonify, request
from utils.file_utils import read_json, write_json
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

BASE = os.path.dirname(os.path.dirname(__file__))
FILE = os.path.join(BASE, "data/feedback.json")

<<<<<<< HEAD

def get_feedback():
    feedback = read_json(FILE, [])
    return success(feedback, meta={"count": len(feedback)})


def post_feedback():
    data = read_json(FILE, [])
    body = get_json_body()
    require_fields(body, ["rating", "comment"])

    rating = body["rating"]
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        from utils.api_utils import ApiError
        raise ApiError("rating must be an integer between 1 and 5", 400)

    item = {
        "id": next_id(data),
        "journeyId": body.get("journeyId"),
        "cityId": body.get("cityId"),
        "placeId": body.get("placeId"),
        "rating": rating,
        "comment": str(body["comment"]).strip(),
        "createdAt": utc_now_iso(),
    }
    data.append(item)
    write_json(FILE, data)
    return success(item, "Feedback saved", 201)
=======
def post_feedback():
    data = read_json(FILE)
    body = request.json
    data.append(body)
    write_json(FILE, data)
    return jsonify({"message": "ok"})
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
