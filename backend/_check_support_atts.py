import asyncio
from database import company_support_messages_collection

async def main():
    rows = []
    cursor = company_support_messages_collection.find(
        {"employer_user_id": {"$regex": "eventthon", "$options": "i"}}
    ).sort("created_at", -1).limit(10)
    async for d in cursor:
        atts = d.get("attachments")
        rows.append({
            "id": str(d.get("_id")),
            "body": d.get("body"),
            "att_count": len(atts) if isinstance(atts, list) else 0,
            "attachments": atts,
            "from": d.get("from_user_id"),
        })
    for r in rows:
        print(r)

asyncio.run(main())
