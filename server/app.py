import os
import sys

from flask import Flask
from flask_cors import CORS

SERVER_DIR = os.path.dirname(__file__)
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

from config.config import Config
from routes.city_routes import bp as city_bp
from routes.place_routes import bp as place_bp
from routes.walk_routes import bp as walk_bp
from routes.feedback_routes import bp as feedback_bp
from routes.journey_routes import bp as journey_bp
from routes.premium_routes import bp as premium_bp
from middleware.error_handlers import register_error_handlers
from utils.api_utils import success


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    @app.get("/api/health")
    def health():
        return success({"status": "healthy"}, "Backend is running")

    app.register_blueprint(city_bp, url_prefix="/api/cities")
    app.register_blueprint(place_bp, url_prefix="/api/places")
    app.register_blueprint(walk_bp, url_prefix="/api/walks")
    app.register_blueprint(feedback_bp, url_prefix="/api/feedback")
    app.register_blueprint(journey_bp, url_prefix="/api/journeys")
    app.register_blueprint(premium_bp, url_prefix="/api/premium")

    register_error_handlers(app)

    return app


# ðŸ‘‰ RUN DIRECTLY (NO run.py)
if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=app.config["PORT"], debug=app.config["DEBUG"])
