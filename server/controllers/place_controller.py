import os
from flask import jsonify, request
from utils.file_utils import read_json
from utils.distance_utils import calculate_distance

BASE = os.path.dirname(os.path.dirname(__file__))
FILE = os.path.join(BASE, "data/places.json")

def get_places():
    return jsonify(read_json(FILE))

def get_place(place_id):
    data = read_json(FILE)
    p = next((x for x in data if x["id"] == place_id), None)
    if not p:
        return jsonify({"error": "not found"}), 404
    return jsonify(p)

def arrival(place_id):
    body = request.json
    lat = body["userLatitude"]
    lon = body["userLongitude"]

    data = read_json(FILE)
    p = next((x for x in data if x["id"] == place_id), None)

    dist = calculate_distance(lat, lon, p["latitude"], p["longitude"])
    return jsonify({"arrived": dist <= p["triggerRadius"], "distance": dist})
