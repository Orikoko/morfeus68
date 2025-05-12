# fx_edge_predictor.py — ML Edge Confidence Model for Trade Success

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

DATA_PATH = "fx_training_data.csv"
MODEL_PATH = "edge_predictor_model.pkl"

# === Load and prepare dataset ===
def load_data():
    df = pd.read_csv(DATA_PATH)
    df = df.drop(columns=["timestamp", "reasoning", "pair", "direction"], errors='ignore')
    df = df.dropna(subset=["outcome", "score", "label"])
    if len(df) < 5:
        print("⚠️ Not enough data to train a reliable model (need at least 5 samples). Add more labeled trades.")
        return pd.DataFrame()

    # Convert outcome to binary target
    df['target'] = df['outcome'].apply(lambda x: 1 if str(x).lower() == 'win' else 0)

    # Encode label text to numeric
    label_map = {"Bullish": 2, "Neutral": 1, "Bearish": 0}
    df['label'] = df['label'].map(label_map).fillna(1)

    return df

# === Train model ===
def train_model():
    df = load_data()
    if df.empty:
        return
    df = load_data()
    X = df.drop(columns=["outcome", "target"])
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("\n📊 Model Evaluation:")
    print(classification_report(y_test, y_pred))

    joblib.dump(model, MODEL_PATH)
    print(f"✅ Model saved to {MODEL_PATH}")

# === Use model to predict win probability on a new trade ===
def predict_edge(new_data: dict):
    model = joblib.load(MODEL_PATH)
    df = pd.DataFrame([new_data])
    proba = model.predict_proba(df)[0]
    return {
        "confidence": round(proba[1] * 100, 2),
        "risk": round(proba[0] * 100, 2)
    }

if __name__ == "__main__":
    print("\n🧠 FX Edge Predictor Trainer")
    print("1. Train model\n2. Predict new edge (manual)\n3. Exit")

    while True:
        cmd = input("Select: ")
        if cmd == "1":
            train_model()
        elif cmd == "2":
            # Example input (use actual trade values)
            sample = {
                "score": 4,
                "label": 2,  # Bullish
                "VIX": 12.5,
                "S&P500": 4300,
                "EURUSD_pct": 0.01,
                "USDJPY_pct": 0.03,
                "AUDUSD_pct": -0.01
            }
            result = predict_edge(sample)
            print(f"📈 Predicted Success: {result['confidence']}% | Risk: {result['risk']}%")
        elif cmd == "3":
            break
        else:
            print("Invalid option.")
