from flask import Blueprint
from controllers.journey_controller import start

bp = Blueprint("journey", __name__)

bp.route("/start", methods=["POST"])(start)
