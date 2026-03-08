import os
import random
from datetime import datetime, timedelta
from pymongo import MongoClient

# =========================
# CONFIG
# =========================
MONGO_URI = os.getenv("MONGODB_CONNECTION_STRING", "mongodb://localhost:27017/")
DB_NAME = "straitwatch_data"
COLLECTION_NAME = "news"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# =========================
# SYNTHETIC DATA OPTIONS
# =========================
COUNTRIES = [
    ("Iran", "IR", "Middle East"),
    ("United States", "US", "North America"),
    ("Saudi Arabia", "SA", "Middle East"),
    ("United Arab Emirates", "AE", "Middle East"),
    ("China", "CN", "Asia"),
    ("Russia", "RU", "Europe"),
    ("Oman", "OM", "Middle East"),
    ("Qatar", "QA", "Middle East"),
    ("Yemen", "YE", "Middle East")
]
EVENT_TYPES = ["Conflict", "Geopolitics", "Economic", "Military", "Disaster", "Diplomacy", "Other"]
ASSETS = ["Oil Tanker", "Cargo Ship", "Naval Vessel", "Port Infrastructure", "Pipeline", "None"]
SOURCES = ["Reuters", "Bloomberg", "Al Jazeera", "BBC", "CNN", "Local Media"]

def random_date(start_date, end_date):
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    return start_date + timedelta(days=random_number_of_days)

def main():
    docs = list(collection.find())
    print(f"Found {len(docs)} documents in {DB_NAME}.{COLLECTION_NAME}")

    updates = []
    
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2026, 3, 1)

    for doc in docs:
        # If the doc already has 'headline', skip it assuming it's already mocked
        if "headline" in doc and "predictedOilMovePct48h" in doc:
            continue

        # Convert simple date string to datetime if we have to, or just make one up
        evt_date = random_date(start_date, end_date)
        
        country, country_code, region = random.choice(COUNTRIES)
        
        # Synthetic values
        severity = random.randint(1, 100)
        risk = random.randint(1, 100)
        
        # Correlate synthetic target somewhat with severity and risk so the model learns *something*
        # random float between -5 and 5, influenced by severity and risk
        base_move = (severity * 0.05) + (risk * 0.02) - 3.5
        noise = random.uniform(-2.0, 2.0)
        predicted_move = round(base_move + noise, 3)

        updated_fields = {
            "headline": doc.get("title", f"Unknown Event {doc['_id']}"),
            "eventDate": evt_date,
            "year": evt_date.year,
            "month": evt_date.month,
            "country": country,
            "countryCode": country_code,
            "region": region,
            "eventType": random.choice(EVENT_TYPES),
            "severityScore": severity,
            "riskScore": risk,
            "predictedOilMovePct48h": predicted_move,
            "asset": random.choice(ASSETS),
            "source": random.choice(SOURCES)
        }
        
        collection.update_one(
            {"_id": doc["_id"]},
            {"$set": updated_fields}
        )

    print("Mocking complete! Re-run EventsToOil.py now.")

if __name__ == "__main__":
    main()
