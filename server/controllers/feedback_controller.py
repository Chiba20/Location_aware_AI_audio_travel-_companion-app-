import os
from flask import jsonify, request
from utils.file_utils import read_json, write_json

BASE = os.path.dirname(os.path.dirname(__file__))
FILE = os.path.join(BASE, "data/feedback.json")

def post_feedback():
    data = read_json(FILE)
    body = request.json
    data.append(body)
    write_json(FILE, data)
    return jsonify({"message": "ok"})
