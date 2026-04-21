from flask import Blueprint
from controllers.place_controller import arrival, get_place, get_places, nearby_places

bp = Blueprint("place", __name__)

bp.route("/")(get_places)
bp.route("/nearby")(nearby_places)
bp.route("/<int:id>")(get_place)
bp.route("/<int:id>/arrival", methods=["POST"])(arrival)
