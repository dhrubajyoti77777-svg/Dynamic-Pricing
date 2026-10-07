from flask import Flask, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)

# Load trained model and demand encoder
model = joblib.load("model/random_forest.pkl")
encoder = joblib.load("model/demand_encoder.pkl")


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Dynamic Pricing ML Service is running"
    })


@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        # Get input
        hour = int(data["hour"])
        demand = str(data["demand"]).strip().title()
        temperature = float(data["temperature"])
        weekend = int(data["weekend"])
        holiday = int(data["holiday"])
        competitor_price = float(data["competitorPrice"])
        current_price = float(data["currentPrice"])
        units_sold = int(data["unitsSold"])

        # Encode demand
        if demand not in encoder.classes_:
            return jsonify({
                "error": "Demand must be Low, Medium or High"
            }), 400

        demand_encoded = encoder.transform([demand])[0]

        # Create input for ML model
        sample = pd.DataFrame({
            "Hour": [hour],
            "Demand": [demand_encoded],
            "Temperature": [temperature],
            "Weekend": [weekend],
            "Holiday": [holiday],
            "CompetitorPrice": [competitor_price],
            "CurrentPrice": [current_price],
            "UnitsSold": [units_sold]
        })

        # Prediction
        predicted_price = model.predict(sample)[0]

        return jsonify({
            "recommendedPrice": round(float(predicted_price), 2)
        })

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )