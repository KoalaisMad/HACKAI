import os
import joblib
import pandas as pd
from pymongo import MongoClient

# =========================
# CONFIG
# =========================
MONGO_URI = os.getenv("MONGODB_CONNECTION_STRING", "mongodb://localhost:27017/")
DB_NAME = "straitwatch_data"
COLLECTION_NAME = "news"
MODEL_IN = "oil_move_model.pkl"

def main():
    if not os.path.exists(MODEL_IN):
        print(f"Model {MODEL_IN} not found. Train it first using EventsToOil.py")
        return

    print(f"Loading model from {MODEL_IN}...")
    pipeline = joblib.load(MODEL_IN)

    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    docs = list(collection.find())
    if not docs:
        print("No documents found in DB.")
        return

    df = pd.DataFrame(docs)
    print(f"Loaded {len(df)} documents.")

    # The model expects certain columns (features) to make a prediction
    feature_cols = [
        "year", "month", "event_day", "event_dayofweek", "event_quarter",
        "country", "countryCode", "region", "eventType", "severityScore",
        "riskScore", "asset", "source", "headline"
    ]
    
    # Check what features we can actually build from docs
    # If the doc doesn't have them, we skip or handle it.
    # The mockup should have provided them.
    df["eventDate"] = pd.to_datetime(df["eventDate"], errors="coerce")
    df["event_day"] = df["eventDate"].dt.day
    df["event_dayofweek"] = df["eventDate"].dt.dayofweek
    df["event_quarter"] = df["eventDate"].dt.quarter

    missing = [c for c in feature_cols if c not in df.columns]
    if missing:
        print(f"Missing required columns for prediction: {missing}")
        return

    X = df[feature_cols]

    print("Making predictions...")
    preds = pipeline.predict(X)

    print("Updating database with new predictions...")
    updated_count = 0
    for idx, doc in enumerate(docs):
        pred_val = float(preds[idx])
        collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"modelPredictedOilMovePct": pred_val}}
        )
        updated_count += 1

    print(f"Successfully updated {updated_count} documents with modelPredictedOilMovePct.")

if __name__ == "__main__":
    main()
