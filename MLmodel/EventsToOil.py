import os
import joblib
import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

# =========================
# CONFIG
# =========================
MONGO_URI = os.getenv("MONGODB_CONNECTION_STRING", "mongodb://localhost:27017/")
DB_NAME = "straitwatch_data"              # change to "straitwatch_data" if needed
COLLECTION_NAME = "news"
TARGET = "predictedOilMovePct48h"
MODEL_OUT = "oil_move_model.pkl"

# =========================
# LOAD DATA FROM MONGODB
# =========================
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

docs = list(collection.find({}, {"_id": 0}))
df = pd.DataFrame(docs)

if df.empty:
    raise ValueError("No data found in MongoDB collection.")

print("Loaded shape:", df.shape)
print("Columns:", df.columns.tolist())

# =========================
# BASIC CLEANING
# =========================
required_cols = [
    "eventDate",
    "year",
    "month",
    "country",
    "countryCode",
    "region",
    "eventType",
    "severityScore",
    "riskScore",
    TARGET,
    "asset",
    "source",
    "headline"
]

missing = [c for c in required_cols if c not in df.columns]
if missing:
    raise ValueError(f"Missing required columns: {missing}")

# convert date
df["eventDate"] = pd.to_datetime(df["eventDate"], errors="coerce")
df["event_day"] = df["eventDate"].dt.day
df["event_dayofweek"] = df["eventDate"].dt.dayofweek
df["event_quarter"] = df["eventDate"].dt.quarter

# drop rows missing target
df = df.dropna(subset=[TARGET]).copy()

# optional: remove impossible values
df = df[np.isfinite(df[TARGET])]

print("After cleaning:", df.shape)

# =========================
# FEATURES / TARGET
# =========================
feature_cols = [
    "year",
    "month",
    "event_day",
    "event_dayofweek",
    "event_quarter",
    "country",
    "countryCode",
    "region",
    "eventType",
    "severityScore",
    "riskScore",
    "asset",
    "source",
    "headline"
]

X = df[feature_cols]
y = df[TARGET]

numeric_features = [
    "year",
    "month",
    "event_day",
    "event_dayofweek",
    "event_quarter",
    "severityScore",
    "riskScore"
]

categorical_features = [
    "country",
    "countryCode",
    "region",
    "eventType",
    "asset",
    "source",
    "headline"
]

# =========================
# PREPROCESSING
# =========================
numeric_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore"))
])

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, numeric_features),
        ("cat", categorical_transformer, categorical_features)
    ]
)

# =========================
# MODEL
# =========================
model = RandomForestRegressor(
    n_estimators=300,
    max_depth=14,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("model", model)
])

# =========================
# TRAIN / TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("Train size:", X_train.shape)
print("Test size:", X_test.shape)

# =========================
# TRAIN
# =========================
pipeline.fit(X_train, y_train)

# =========================
# EVALUATE
# =========================
preds = pipeline.predict(X_test)

mae = mean_absolute_error(y_test, preds)
rmse = np.sqrt(mean_squared_error(y_test, preds))
r2 = r2_score(y_test, preds)

print("\n=== MODEL PERFORMANCE ===")
print(f"MAE:  {mae:.4f}")
print(f"RMSE: {rmse:.4f}")
print(f"R²:   {r2:.4f}")

# =========================
# SAVE MODEL
# =========================
joblib.dump(pipeline, MODEL_OUT)
print(f"\nSaved model to {MODEL_OUT}")

# =========================
# SAMPLE PREDICTIONS
# =========================
sample = X_test.head(5).copy()
sample_preds = pipeline.predict(sample)

print("\n=== SAMPLE PREDICTIONS ===")
for i, pred in enumerate(sample_preds):
    print(f"Sample {i+1}: predicted oil move = {pred:.3f}%")

# =========================
# FEATURE IMPORTANCE
# =========================
# Extract feature names after preprocessing
ohe = pipeline.named_steps["preprocessor"].named_transformers_["cat"].named_steps["onehot"]
cat_names = ohe.get_feature_names_out(categorical_features)
all_feature_names = numeric_features + list(cat_names)

importances = pipeline.named_steps["model"].feature_importances_
feat_imp = pd.DataFrame({
    "feature": all_feature_names,
    "importance": importances
}).sort_values("importance", ascending=False)

print("\n=== TOP 20 FEATURE IMPORTANCES ===")
print(feat_imp.head(20).to_string(index=False))