import os
from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row


def database_enabled():
    return bool(os.getenv("DATABASE_URL"))


@contextmanager
def get_db():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not configured.")

    with psycopg.connect(database_url, row_factory=dict_row) as conn:
        yield conn


def init_db():
    if not database_enabled():
        return

    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS premium_users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                paid_amount INTEGER NOT NULL,
                upi_reference TEXT NOT NULL,
                is_premium BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
        conn.commit()
