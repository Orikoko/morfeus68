# fx_strategy_evaluator.py — Strategy-Level Performance Analytics

import sqlite3
import pandas as pd

DB_PATH = "fx_history.db"

# === Load trades and strategies ===
def load_trades():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM trade_log", conn)
    conn.close()
    df = df.dropna(subset=["outcome", "score", "strategy"])
    df["target"] = df["outcome"].str.lower().map({"win": 1, "loss": 0})
    return df

# === Evaluate performance by strategy ===
def strategy_performance_summary():
    df = load_trades()
    print("\n🧠 Strategy Evaluation Summary")
    print("=" * 50)
    print(f"Total trades: {len(df)}")

    # Overall win rate
    total_accuracy = df["target"].mean() * 100
    print(f"Overall Win Rate: {total_accuracy:.2f}%")

    # Strategy-specific win rate
    print("\n📊 Win Rate by Strategy:")
    strat_stats = df.groupby("strategy")["target"].mean().round(2) * 100
    print(strat_stats)

    # Strategy by pair
    print("\n💱 Strategy Success by Pair:")
    combo = df.groupby(["strategy", "currency_pair"])["target"].mean().round(2) * 100
    print(combo)

if __name__ == "__main__":
    strategy_performance_summary()