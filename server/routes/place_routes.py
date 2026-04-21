from flask import Blueprint
<<<<<<< HEAD
from controllers.place_controller import arrival, get_place, get_places, nearby_places
=======
from controllers.place_controller import get_places, get_place, arrival
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

bp = Blueprint("place", __name__)

bp.route("/")(get_places)
<<<<<<< HEAD
bp.route("/nearby")(nearby_places)
=======
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
bp.route("/<int:id>")(get_place)
bp.route("/<int:id>/arrival", methods=["POST"])(arrival)
