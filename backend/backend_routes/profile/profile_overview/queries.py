"""User lookup by email or mobile (same rules as main profile routes)."""


def user_lookup_query(identifier: str) -> dict:
    ident = (identifier or "").strip()
    if not ident:
        return {"_id": None}
    return {"$or": [{"email": ident.lower()}, {"mobile": ident}]}
