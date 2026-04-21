from flask import Blueprint
from controllers.journey_controller import end, get_journey, get_journeys, start, update_location

bp = Blueprint("journey", __name__)

bp.route("/")(get_journeys)
bp.route("/start", methods=["POST"])(start)
bp.route("/<int:journey_id>")(get_journey)
bp.route("/<int:journey_id>/location", methods=["PATCH"])(update_location)
bp.route("/<int:journey_id>/end", methods=["POST"])(end)
