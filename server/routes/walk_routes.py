from flask import Blueprint
<<<<<<< HEAD
from controllers.walk_controller import get_walk, get_walks
=======
from controllers.walk_controller import get_walks
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe

bp = Blueprint("walk", __name__)

bp.route("/")(get_walks)
<<<<<<< HEAD
bp.route("/<int:walk_id>")(get_walk)
=======
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
