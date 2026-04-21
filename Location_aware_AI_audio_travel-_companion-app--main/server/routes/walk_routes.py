from flask import Blueprint
from controllers.walk_controller import get_walk, get_walks

bp = Blueprint("walk", __name__)

bp.route("/")(get_walks)
bp.route("/<int:walk_id>")(get_walk)
