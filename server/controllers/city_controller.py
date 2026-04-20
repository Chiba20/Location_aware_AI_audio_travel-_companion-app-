import os
from flask import jsonify
from utils.file_utils import read_json

BASE = os.path.dirname(os.path.dirname(__file__))
FILE = os.path.join(BASE, "data/cities.json")

def get_cities():
    return jsonify(read_json(FILE))

def get_city(city_id):
    data = read_json(FILE)
    city = next((c for c in data if c["id"] == city_id), None)
    if not city:
        return jsonify({"error": "not found"}), 404
    return jsonify(city)
