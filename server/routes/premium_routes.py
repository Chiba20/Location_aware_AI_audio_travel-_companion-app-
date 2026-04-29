import os
import re
import smtplib
from email.message import EmailMessage

from flask import Blueprint

from utils.api_utils import ApiError, get_json_body, require_fields, success

bp = Blueprint("premium", __name__)

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _send_premium_email(to_email, name, amount):
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", username)

    if not all([host, username, password, from_email]):
        return False

    message = EmailMessage()
    message["Subject"] = "Every Street Premium unlocked"
    message["From"] = from_email
    message["To"] = to_email
    message.set_content(
        "\n".join(
            [
                f"Hi {name},",
                "",
                "Your Every Street Premium access is now active.",
                f"Payment amount: Rs. {amount}",
                "",
                "Premium unlocks Hidden Gems, Traveller Services, guide-driver contacts, and offline travel service.",
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
