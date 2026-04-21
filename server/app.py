<<<<<<< HEAD
import os
import sys

from flask import Flask
from flask_cors import CORS

SERVER_DIR = os.path.dirname(__file__)
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

from config.config import Config
=======
from flask import Flask
from flask_cors import CORS

>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
from routes.city_routes import bp as city_bp
from routes.place_routes import bp as place_bp
from routes.walk_routes import bp as walk_bp
from routes.feedback_routes import bp as feedback_bp
from routes.journey_routes import bp as journey_bp
from middleware.error_handlers import register_error_handlers
<<<<<<< HEAD
from utils.api_utils import success
=======
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe


def create_app():
    app = Flask(__name__)
<<<<<<< HEAD
    app.config.from_object(Config)
    CORS(app)

    @app.get("/api/health")
    def health():
        return success({"status": "healthy"}, "Backend is running")

=======
    CORS(app)

>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
    app.register_blueprint(city_bp, url_prefix="/api/cities")
    app.register_blueprint(place_bp, url_prefix="/api/places")
    app.register_blueprint(walk_bp, url_prefix="/api/walks")
    app.register_blueprint(feedback_bp, url_prefix="/api/feedback")
    app.register_blueprint(journey_bp, url_prefix="/api/journeys")

    register_error_handlers(app)

    return app


# 👉 RUN DIRECTLY (NO run.py)
if __name__ == "__main__":
    app = create_app()
<<<<<<< HEAD
    app.run(host="0.0.0.0", port=app.config["PORT"], debug=app.config["DEBUG"])
=======
    app.run(host="0.0.0.0", port=5000, debug=True)
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
