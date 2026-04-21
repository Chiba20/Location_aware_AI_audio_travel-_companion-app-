from flask import Blueprint
<<<<<<< HEAD
from controllers.feedback_controller import get_feedback, post_feedback

bp = Blueprint("feedback", __name__)

bp.route("/", methods=["GET"])(get_feedback)
=======
from controllers.feedback_controller import post_feedback

bp = Blueprint("feedback", __name__)

>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
bp.route("/", methods=["POST"])(post_feedback)
