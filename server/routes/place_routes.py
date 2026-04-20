from flask import Blueprint
from controllers.place_controller import get_places, get_place, arrival

bp = Blueprint("place", __name__)

bp.route("/")(get_places)
bp.route("/<int:id>")(get_place)
bp.route("/<int:id>/arrival", methods=["POST"])(arrival)
