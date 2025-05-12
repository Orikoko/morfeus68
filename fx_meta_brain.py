# fx_meta_brain.py — Autonomous Self-Evaluator (Meta Brain + Weighting)

import sqlite3
import pandas as pd
from collections import defaultdict

DB_PATH = "fx_history.db"

# === Load trade log ===
def load_trades():
    conn = sqlite3.connect(DB_PATH)
    trades = pd.read_sql_query("SELECT * FROM trade_log", conn)
    conn.close()
    trades = trades.dropna(subset=["outcome", "score", "label", "strategy"])
    trades["target"] = trades["outcome"].str.lower().map({"win": 1, "loss": 0})
    return trades

# === Compute average win rate by factor ===
def calculate_weights():
    df = load_trades()
    weights = {}

    # Edge score as factor
    score_group = df.groupby("score")["target"].mean()
    weights['edge'] = score_group.mean() * 100 if not score_group.empty else 50

    # Strategy as factor
    strat_group = df.groupby("strategy")["target"].mean()
    weights['strategy'] = strat_group.mean() * 100 if not strat_group.empty else 50

    # Label as factor
    label_group = df.groupby("label")["target"].mean()
    weights['label'] = label_group.mean() * 100 if not label_group.empty else 50

    # Macro: approximate from 'macro' field if available
    macro_conf = df["macro"].notna().sum()
    weights['macro'] = (df['target'].mean() * 100) if macro_conf > 5 else 50

    # Normalize total to 100
    total = sum(weights.values())
    weights = {k: round((v / total) * 100, 2) for k, v in weights.items()}

    return weights

# === Print full summary ===
def self_evaluate():
    df = load_trades()
    print("\n🧠 Meta Brain Evaluation Summary")
    print("=" * 60)
    print(f"Total Evaluated Trades: {len(df)}")

    # Core breakdowns
    print("\n📊 Strategy Effectiveness:")
    print(df.groupby("strategy")["target"].mean().round(2) * 100)

    print("\n🏷 Label Accuracy:")
    print(df.groupby("label")["target"].mean().round(2) * 100)

    print("\n📈 Edge Score Predictiveness:")
    print(df.groupby("score")["target"].mean().round(2) * 100)

    print("\n🔁 Strategy × Label Match:")
    print(df.groupby(["strategy", "label"])["target"].mean().round(2) * 100)

    # Recommendations
    print("\n🧠 Recommendations:")
    weights = calculate_weights()
    for key, val in weights.items():
        print(f"- {key.capitalize()} weight: {val}%")

if __name__ == "__main__":
    self_evaluate()