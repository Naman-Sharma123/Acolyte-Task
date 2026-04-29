import argparse
from urllib.parse import urlparse

from pymongo import MongoClient


def get_db_name(mongo_uri: str) -> str:
    parsed = urlparse(mongo_uri)
    # mongodb://host:port/<db>
    path = parsed.path.lstrip("/")
    return path or "acolyte_leads"


def main():
    parser = argparse.ArgumentParser(description="Lead insights from MongoDB")
    parser.add_argument(
        "--mongoUri",
        default=None,
        help="MongoDB connection string (default: env MONGODB_URI or mongodb://localhost:27017/acolyte_leads)",
    )
    args = parser.parse_args()

    mongo_uri = (
        args.mongoUri
        or __import__("os").environ.get("MONGODB_URI")
        or "mongodb://localhost:27017/acolyte_leads"
    )

    client = MongoClient(mongo_uri)
    db_name = get_db_name(mongo_uri)
    db = client[db_name]
    leads = db["leads"]

    total = leads.count_documents({})

    status_counts = list(
        leads.aggregate(
            [
                {"$group": {"_id": "$status", "count": {"$sum": 1}}},
                {"$project": {"_id": 0, "name": "$_id", "count": 1}},
                {"$sort": {"count": -1}},
            ]
        )
    )

    city_counts = list(
        leads.aggregate(
            [
                {"$group": {"_id": "$city", "count": {"$sum": 1}}},
                {"$project": {"_id": 0, "name": "$_id", "count": 1}},
                {"$sort": {"count": -1}},
            ]
        )
    )

    service_counts = list(
        leads.aggregate(
            [
                {"$group": {"_id": "$service", "count": {"$sum": 1}}},
                {"$project": {"_id": 0, "name": "$_id", "count": 1}},
                {"$sort": {"count": -1}},
            ]
        )
    )

    converted = next((x["count"] for x in status_counts if x["name"] == "Converted"), 0)
    conversion_rate = (converted / total * 100.0) if total else 0.0

    top_city = city_counts[0]["name"] if city_counts else None
    top_service = service_counts[0]["name"] if service_counts else None

    print("Lead Insights")
    print("=============")
    print(f"Total leads: {total}")
    print(f"Conversion rate: {conversion_rate:.2f}%")
    print(f"Top city: {top_city or '-'}")
    print(f"Top service: {top_service or '-'}")
    print("")
    print("Status breakdown:")
    for s in status_counts:
        print(f"- {s['name']}: {s['count']}")


if __name__ == "__main__":
    main()

