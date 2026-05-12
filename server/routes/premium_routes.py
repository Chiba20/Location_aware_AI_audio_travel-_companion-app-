import os
import re
import smtplib
from email.message import EmailMessage
from werkzeug.security import check_password_hash, generate_password_hash

from flask import Blueprint

from utils.api_utils import ApiError, get_json_body, require_fields, success
from utils.db import database_enabled, get_db

bp = Blueprint("premium", __name__)

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


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


def _send_premium_email(to_email, name, amount):
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", username)

    if not all([host, username, password, from_email]):
        return False

    message = EmailMessage()
    message["Subject"] = "Welcome to CityWhisper Premium"
    message["From"] = from_email
    message["To"] = to_email
    message.set_content(
        "\n".join(
            [
                f"Hi {name},",
                "",
                "You have successfully registered for CityWhisper Premium.",
                "Your premium access is now active.",
                f"Payment amount: Rs. {amount}",
                "",
                "You can now login with this email and your password to use Hidden Gems, Traveller Services, guide-driver contacts, and offline travel service.",
                "",
                "Thank you,",
                "CityWhisper",
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
