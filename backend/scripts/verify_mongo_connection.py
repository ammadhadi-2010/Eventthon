"""One-off: verify Motor can connect using backend/.env (no secrets printed)."""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Allow `python scripts/verify_mongo_connection.py` from backend/
_BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))


async def main() -> None:
    import database as db

    try:
        await db.client.admin.command("ping")
        names = await db.database.list_collection_names()
        print("OK: connection successful.")
        print(f"OK: database name: {db.DB_NAME!r}")
        print(f"OK: collection count: {len(names)}")
    except Exception as exc:
        print(f"FAIL: {type(exc).__name__}: {exc}")
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
