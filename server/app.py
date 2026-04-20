from flask import Flask
from flask_cors import CORS

from routes.city_routes import bp as city_bp
from routes.place_routes import bp as place_bp
from routes.walk_routes import bp as walk_bp
from routes.feedback_routes import bp as feedback_bp
from routes.journey_routes import bp as journey_bp
from middleware.error_handlers import register_error_handlers


def create_app():
    app = Flask(__name__)
    CORS(app)

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
    app.run(host="0.0.0.0", port=5000, debug=True)
