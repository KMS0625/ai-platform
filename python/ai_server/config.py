import os
from pathlib import Path

from dotenv import dotenv_values

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def get_database_url() -> str:
    # Environment > .env.local > .env. Do not overwrite process environment.
    url = (
        os.environ.get("DATABASE_URL")
        or dotenv_values(PROJECT_ROOT / ".env.local").get("DATABASE_URL")
        or dotenv_values(PROJECT_ROOT / ".env").get("DATABASE_URL")
    )
    if not url:
        raise RuntimeError("DATABASE_URL is required for the similarity service")
    return url
