from datetime import datetime, timezone

from flask import jsonify, request


class ApiError(Exception):
    def __init__(self, message, status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


def success(data=None, message="OK", status_code=200, meta=None):
    payload = {
        "success": True,
        "message": message,
        "data": data,
    }
    if meta is not None:
        payload["meta"] = meta
    return jsonify(payload), status_code


def error(message, status_code=400, details=None):
    payload = {
        "success": False,
        "message": message,
    }
    if details:
        payload["details"] = details
    return jsonify(payload), status_code


def get_json_body(required=True):
    if not request.is_json:
        if required:
            raise ApiError("Request body must be JSON", 415)
        return {}

    body = request.get_json(silent=True)
    if body is None:
        if required:
            raise ApiError("Invalid JSON body", 400)
        return {}
    if not isinstance(body, dict):
        raise ApiError("JSON body must be an object", 400)
    return body


def require_fields(body, fields):
    missing = [field for field in fields if body.get(field) in (None, "")]
    if missing:
        raise ApiError("Missing required fields", 400, {"fields": missing})


def parse_float(value, field_name):
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ApiError(f"{field_name} must be a number", 400) from exc


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()
