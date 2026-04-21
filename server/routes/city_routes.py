from flask import Blueprint
from controllers.city_controller import get_cities, get_city

bp = Blueprint("city", __name__)

bp.route("/")(get_cities)
bp.route("/<int:city_id>")(get_city)
