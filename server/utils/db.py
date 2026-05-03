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
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS premium_driver_routes (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                start_point TEXT NOT NULL,
                end_point TEXT NOT NULL,
                fixed_price INTEGER NOT NULL CHECK (fixed_price > 0),
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS premium_driver_bookings (
                id SERIAL PRIMARY KEY,
                premium_user_id INTEGER NOT NULL REFERENCES premium_users(id) ON DELETE CASCADE,
                driver_name TEXT NOT NULL,
                driver_phone TEXT NOT NULL,
                transport_type TEXT NOT NULL,
                route_id INTEGER NOT NULL REFERENCES premium_driver_routes(id) ON DELETE RESTRICT,
                route_name TEXT NOT NULL,
                paid_price INTEGER NOT NULL,
                upi_reference TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'paid',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS premium_driver_locations (
                driver_phone TEXT PRIMARY KEY,
                driver_name TEXT NOT NULL,
                latitude DOUBLE PRECISION NOT NULL,
                longitude DOUBLE PRECISION NOT NULL,
                accuracy_meters DOUBLE PRECISION,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
        conn.execute(
            """
            INSERT INTO premium_driver_routes (name, start_point, end_point, fixed_price)
            VALUES
                ('Akisha route', 'Kanchipuram bus stand', 'Akisha local route', 350),
                ('Temple heritage route', 'Kanchipuram railway station', 'Kamakshi Amman Temple', 500),
                ('Silk shopping route', 'Kanchipuram bus stand', 'Gandhi Road silk shops', 450)
            ON CONFLICT (name) DO NOTHING
            """
        )
        conn.commit()
