from flask import Blueprint
from controllers.feedback_controller import post_feedback

bp = Blueprint("feedback", __name__)

bp.route("/", methods=["POST"])(post_feedback)
