import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
import joblib


# ==========================================
# LOAD DATASET
# ==========================================

data = pd.read_csv("coffee_dynamic_pricing_extra_10000_rows.csv")


# ==========================================
# ENCODE DEMAND
# ==========================================

encoder = LabelEncoder()

data["Demand"] = (
    data["Demand"]
    .astype(str)
    .str.strip()
    .str.title()
)

data["Demand"] = encoder.fit_transform(data["Demand"])


print("Demand Encoding:")

for label, value in zip(
    encoder.classes_,
    encoder.transform(encoder.classes_)
):
    print(f"{label} --> {value}")


# ==========================================
# FEATURES & TARGET
# ==========================================
X = data.drop("RecommendedPrice", axis=1)

y = data["RecommendedPrice"]


# ==========================================
# TRAIN TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)


# ==========================================
# RANDOM FOREST
# ==========================================

model = RandomForestRegressor(
    n_estimators=200,
    max_depth=10,
    random_state=42
)

model.fit(X_train, y_train)


# ==========================================
# SAVE MODEL
# ==========================================

joblib.dump(model, "model/random_forest.pkl")

joblib.dump(encoder, "model/demand_encoder.pkl")


print("\nModel trained successfully.")

print("Saved:")
print("model/random_forest.pkl")
print("model/demand_encoder.pkl")