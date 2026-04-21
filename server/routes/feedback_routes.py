from flask import Blueprint
from controllers.feedback_controller import get_feedback, post_feedback

bp = Blueprint("feedback", __name__)

bp.route("/", methods=["GET"])(get_feedback)
bp.route("/", methods=["POST"])(post_feedback)
