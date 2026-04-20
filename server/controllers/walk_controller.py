import os
from flask import jsonify
from utils.file_utils import read_json

BASE = os.path.dirname(os.path.dirname(__file__))
FILE = os.path.join(BASE, "data/walks.json")

def get_walks():
    return jsonify(read_json(FILE))
