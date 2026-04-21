from flask import Blueprint
<<<<<<< HEAD
from controllers.journey_controller import end, get_journey, get_journeys, start, update_location

bp = Blueprint("journey", __name__)

bp.route("/")(get_journeys)
bp.route("/start", methods=["POST"])(start)
bp.route("/<int:journey_id>")(get_journey)
bp.route("/<int:journey_id>/location", methods=["PATCH"])(update_location)
bp.route("/<int:journey_id>/end", methods=["POST"])(end)
=======
from controllers.journey_controller import start

bp = Blueprint("journey", __name__)

bp.route("/start", methods=["POST"])(start)
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
