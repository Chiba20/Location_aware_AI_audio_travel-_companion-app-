from werkzeug.exceptions import HTTPException

from utils.api_utils import ApiError, error


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def api_error(e):
        return error(e.message, e.status_code, e.details)

    @app.errorhandler(HTTPException)
    def http_error(e):
        return error(e.description or e.name, e.code or 500)

    @app.errorhandler(404)
    def not_found(e):
        return error("Not found", 404)

    @app.errorhandler(500)
    def server_error(e):
        app.logger.exception(e)
        return error("Server error", 500)
