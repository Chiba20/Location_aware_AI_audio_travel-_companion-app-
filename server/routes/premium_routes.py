import os
import re
import smtplib
from email.message import EmailMessage
from werkzeug.security import check_password_hash, generate_password_hash

from flask import Blueprint, request

from utils.api_utils import ApiError, get_json_body, parse_float, require_fields, success
from utils.db import database_enabled, get_db

bp = Blueprint("premium", __name__)

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
DEFAULT_ADMIN_TOKEN = "admin123"


def _public_user(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "phone": row["phone"],
        "isPremium": row["is_premium"],
        "registrationComplete": True,
        "unlockedAt": row["created_at"].isoformat() if row.get("created_at") else None,
    }


def _iso(value):
    return value.isoformat() if value else None


def _admin_token():
    return os.getenv("ADMIN_API_TOKEN", DEFAULT_ADMIN_TOKEN)


def _require_admin():
    token = request.headers.get("X-Admin-Token", "").strip()
    if not token or token != _admin_token():
        raise ApiError("Admin access is required.", 403)


def _public_route(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "startPoint": row["start_point"],
        "endPoint": row["end_point"],
        "fixedPrice": row["fixed_price"],
        "isActive": row["is_active"],
        "updatedAt": _iso(row.get("updated_at")),
    }


def _booking_payload(row):
    return {
        "id": row["id"],
        "premiumUserId": row["premium_user_id"],
        "travellerName": row.get("traveller_name"),
        "travellerEmail": row.get("traveller_email"),
        "driverName": row["driver_name"],
        "driverPhone": row["driver_phone"],
        "transportType": row["transport_type"],
        "routeId": row["route_id"],
        "routeName": row["route_name"],
        "paidPrice": row["paid_price"],
        "upiReference": row["upi_reference"],
        "status": row["status"],
        "createdAt": _iso(row.get("created_at")),
        "driverLocation": (
            {
                "latitude": row["latitude"],
                "longitude": row["longitude"],
                "accuracyMeters": row["accuracy_meters"],
                "updatedAt": _iso(row.get("location_updated_at")),
            }
            if row.get("latitude") is not None and row.get("longitude") is not None
            else None
        ),
    }


def _send_premium_email(to_email, name, amount):
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", username)

    if not all([host, username, password, from_email]):
        return False

    message = EmailMessage()
    message["Subject"] = "Welcome to Every Street Premium"
    message["From"] = from_email
    message["To"] = to_email
    message.set_content(
        "\n".join(
            [
                f"Hi {name},",
                "",
                "You have successfully registered for Every Street Premium.",
                "Your premium access is now active.",
                f"Payment amount: Rs. {amount}",
                "",
                "You can now login with this email and your password to use Hidden Gems, Traveller Services, guide-driver contacts, and offline travel service.",
                "",
                "Thank you,",
                "Every Street",
            ]
        )
    )

    with smtplib.SMTP(host, port, timeout=10) as smtp:
        smtp.starttls()
        smtp.login(username, password)
        smtp.send_message(message)

    return True


@bp.post("/register")
def register_premium():
    if not database_enabled():
        raise ApiError("Premium database is not configured yet.", 503)

    body = get_json_body()
    require_fields(body, ["name", "email", "phone", "password", "upiReference"])

    name = str(body["name"]).strip()
    email = str(body["email"]).strip().lower()
    phone = str(body["phone"]).strip()
    password = str(body["password"])
    upi_reference = str(body["upiReference"]).strip()
    paid_amount = int(body.get("amount", 199))

    if len(name) < 2:
        raise ApiError("Enter your full name.", 400)
    if not EMAIL_RE.match(email):
        raise ApiError("Enter a valid email address.", 400)
    if len(phone) < 7:
        raise ApiError("Enter a valid phone number.", 400)
    if len(password) < 4:
        raise ApiError("Password must be at least 4 characters.", 400)
    if len(upi_reference) < 4:
        raise ApiError("Enter the UPI transaction reference after payment.", 400)

    password_hash = generate_password_hash(password)

    with get_db() as conn:
        existing = conn.execute(
            "SELECT id FROM premium_users WHERE email = %s",
            (email,),
        ).fetchone()
        if existing:
            raise ApiError("This email is already registered. Login instead.", 409)

        user = conn.execute(
            """
            INSERT INTO premium_users
                (name, email, phone, password_hash, paid_amount, upi_reference, is_premium)
            VALUES
                (%s, %s, %s, %s, %s, %s, TRUE)
            RETURNING id, name, email, phone, is_premium, created_at
            """,
            (name, email, phone, password_hash, paid_amount, upi_reference),
        ).fetchone()
        conn.commit()

    sent = _send_premium_email(email, name, paid_amount)
    return success(
        {"user": _public_user(user), "emailSent": sent},
        "Premium registration complete. Login to unlock access.",
        201,
    )


@bp.post("/login")
def login_premium():
    if not database_enabled():
        raise ApiError("Premium database is not configured yet.", 503)

    body = get_json_body()
    require_fields(body, ["email", "password"])

    email = str(body["email"]).strip().lower()
    password = str(body["password"])

    with get_db() as conn:
        user = conn.execute(
            """
            SELECT id, name, email, phone, password_hash, is_premium, created_at
            FROM premium_users
            WHERE email = %s
            """,
            (email,),
        ).fetchone()

    if not user or not check_password_hash(user["password_hash"], password):
        raise ApiError("Use the same email and password from your completed premium registration.", 401)

    if user["is_premium"] is not True:
        raise ApiError("This account is not premium yet. Complete payment first.", 403)

    return success({"user": _public_user(user)}, "Welcome back. Premium access restored.")


@bp.post("/confirmation-email")
def send_confirmation_email():
    body = get_json_body()
    require_fields(body, ["name", "email", "amount", "upiReference"])

    email = str(body["email"]).strip()
    if not EMAIL_RE.match(email):
        raise ApiError("Enter a valid email address.", 400)

    sent = _send_premium_email(email, str(body["name"]).strip(), body["amount"])
    return success(
        {"emailSent": sent},
        "Premium confirmation email sent." if sent else "Premium unlocked. Email service is not configured.",
    )


@bp.get("/driver-routes")
def list_driver_routes():
    if not database_enabled():
        raise ApiError("Premium database is not configured yet.", 503)

    include_inactive = request.args.get("includeInactive") == "true"
    with get_db() as conn:
        if include_inactive:
            _require_admin()
            rows = conn.execute(
                """
                SELECT id, name, start_point, end_point, fixed_price, is_active, updated_at
                FROM premium_driver_routes
                ORDER BY name
                """
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT id, name, start_point, end_point, fixed_price, is_active, updated_at
                FROM premium_driver_routes
                WHERE is_active = TRUE
                ORDER BY name
                """
            ).fetchall()

    return success({"routes": [_public_route(row) for row in rows]})


@bp.post("/driver-routes")
def create_driver_route():
    if not database_enabled():
        raise ApiError("Premium database is not configured yet.", 503)
    _require_admin()

    body = get_json_body()
    require_fields(body, ["name", "startPoint", "endPoint", "fixedPrice"])
    fixed_price = int(parse_float(body["fixedPrice"], "fixedPrice"))
    if fixed_price <= 0:
        raise ApiError("Route price must be greater than zero.", 400)

    with get_db() as conn:
        route = conn.execute(
            """
            INSERT INTO premium_driver_routes (name, start_point, end_point, fixed_price, is_active)
            VALUES (%s, %s, %s, %s, TRUE)
            RETURNING id, name, start_point, end_point, fixed_price, is_active, updated_at
            """,
            (
                str(body["name"]).strip(),
                str(body["startPoint"]).strip(),
                str(body["endPoint"]).strip(),
                fixed_price,
            ),
        ).fetchone()
        conn.commit()

    return success({"route": _public_route(route)}, "Route created.", 201)


@bp.patch("/driver-routes/<int:route_id>")
def update_driver_route(route_id):
    if not database_enabled():
        raise ApiError("Premium database is not configured yet.", 503)
    _require_admin()

    body = get_json_body()
    fixed_price = int(parse_float(body.get("fixedPrice"), "fixedPrice")) if "fixedPrice" in body else None
    if fixed_price is not None and fixed_price <= 0:
        raise ApiError("Route price must be greater than zero.", 400)

    with get_db() as conn:
        existing = conn.execute(
            "SELECT id, name, start_point, end_point, fixed_price, is_active, updated_at FROM premium_driver_routes WHERE id = %s",
            (route_id,),
        ).fetchone()
        if not existing:
            raise ApiError("Route not found.", 404)

        route = conn.execute(
            """
            UPDATE premium_driver_routes
            SET
                name = %s,
                start_point = %s,
                end_point = %s,
                fixed_price = %s,
                is_active = %s,
                updated_at = NOW()
            WHERE id = %s
            RETURNING id, name, start_point, end_point, fixed_price, is_active, updated_at
            """,
            (
                str(body.get("name", existing["name"])).strip(),
                str(body.get("startPoint", existing["start_point"])).strip(),
                str(body.get("endPoint", existing["end_point"])).strip(),
                fixed_price if fixed_price is not None else existing["fixed_price"],
                bool(body.get("isActive", existing["is_active"])),
                route_id,
            ),
        ).fetchone()
        conn.commit()

    return success({"route": _public_route(route)}, "Route updated.")


@bp.post("/driver-bookings")
def create_driver_booking():
    if not database_enabled():
        raise ApiError("Premium database is not configured yet.", 503)

    body = get_json_body()
    require_fields(body, ["premiumUserId", "driverName", "driverPhone", "transportType", "routeId", "upiReference"])
    premium_user_id = int(body["premiumUserId"])
    route_id = int(body["routeId"])
    upi_reference = str(body["upiReference"]).strip()
    if len(upi_reference) < 4:
        raise ApiError("Enter the route payment UPI reference.", 400)

    with get_db() as conn:
        user = conn.execute(
            "SELECT id FROM premium_users WHERE id = %s AND is_premium = TRUE",
            (premium_user_id,),
        ).fetchone()
        if not user:
            raise ApiError("Premium login is required before booking a driver.", 403)

        route = conn.execute(
            """
            SELECT id, name, fixed_price
            FROM premium_driver_routes
            WHERE id = %s AND is_active = TRUE
            """,
            (route_id,),
        ).fetchone()
        if not route:
            raise ApiError("Choose an active route before booking.", 400)

        booking = conn.execute(
            """
            INSERT INTO premium_driver_bookings
                (premium_user_id, driver_name, driver_phone, transport_type, route_id, route_name, paid_price, upi_reference)
            VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, premium_user_id, driver_name, driver_phone, transport_type, route_id, route_name,
                paid_price, upi_reference, status, created_at
            """,
            (
                premium_user_id,
                str(body["driverName"]).strip(),
                str(body["driverPhone"]).strip(),
                str(body["transportType"]).strip(),
                route["id"],
                route["name"],
                route["fixed_price"],
                upi_reference,
            ),
        ).fetchone()
        conn.commit()

    return success({"booking": _booking_payload(booking)}, "Driver booking saved with the fixed route price.", 201)


@bp.patch("/driver-locations")
def update_driver_location():
    if not database_enabled():
        raise ApiError("Premium database is not configured yet.", 503)

    driver_token = os.getenv("DRIVER_LOCATION_TOKEN")
    supplied_token = request.headers.get("X-Driver-Token", "").strip()
    if driver_token and supplied_token != driver_token:
        raise ApiError("Driver location token is required.", 403)
    if not driver_token:
        _require_admin()

    body = get_json_body()
    require_fields(body, ["driverName", "driverPhone", "latitude", "longitude"])
    latitude = parse_float(body["latitude"], "latitude")
    longitude = parse_float(body["longitude"], "longitude")
    accuracy = parse_float(body.get("accuracyMeters"), "accuracyMeters") if body.get("accuracyMeters") not in (None, "") else None

    if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
        raise ApiError("Driver location coordinates are out of range.", 400)

    with get_db() as conn:
        location = conn.execute(
            """
            INSERT INTO premium_driver_locations
                (driver_phone, driver_name, latitude, longitude, accuracy_meters, updated_at)
            VALUES
                (%s, %s, %s, %s, %s, NOW())
            ON CONFLICT (driver_phone)
            DO UPDATE SET
                driver_name = EXCLUDED.driver_name,
                latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude,
                accuracy_meters = EXCLUDED.accuracy_meters,
                updated_at = NOW()
            RETURNING driver_phone, driver_name, latitude, longitude, accuracy_meters, updated_at
            """,
            (
                str(body["driverPhone"]).strip(),
                str(body["driverName"]).strip(),
                latitude,
                longitude,
                accuracy,
            ),
        ).fetchone()
        conn.commit()

    return success(
        {
            "location": {
                "driverPhone": location["driver_phone"],
                "driverName": location["driver_name"],
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "accuracyMeters": location["accuracy_meters"],
                "updatedAt": _iso(location["updated_at"]),
            }
        },
        "Driver live location updated.",
    )


@bp.get("/admin/driver-dashboard")
def admin_driver_dashboard():
    if not database_enabled():
        raise ApiError("Premium database is not configured yet.", 503)
    _require_admin()

    with get_db() as conn:
        routes = conn.execute(
            """
            SELECT id, name, start_point, end_point, fixed_price, is_active, updated_at
            FROM premium_driver_routes
            ORDER BY name
            """
        ).fetchall()
        bookings = conn.execute(
            """
            SELECT
                b.id,
                b.premium_user_id,
                u.name AS traveller_name,
                u.email AS traveller_email,
                b.driver_name,
                b.driver_phone,
                b.transport_type,
                b.route_id,
                b.route_name,
                b.paid_price,
                b.upi_reference,
                b.status,
                b.created_at,
                l.latitude,
                l.longitude,
                l.accuracy_meters,
                l.updated_at AS location_updated_at
            FROM premium_driver_bookings b
            JOIN premium_users u ON u.id = b.premium_user_id
            LEFT JOIN premium_driver_locations l ON l.driver_phone = b.driver_phone
            ORDER BY b.created_at DESC
            """
        ).fetchall()

    return success({
        "routes": [_public_route(row) for row in routes],
        "bookings": [_booking_payload(row) for row in bookings],
    })
