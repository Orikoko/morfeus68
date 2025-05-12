# fx_backtester.py — Historical Trade Performance Analysis

import sqlite3
import pandas as pd
from collections import Counter

DB_PATH = "fx_history.db"

# === Load trade log and history ===
def load_trades():
    conn = sqlite3.connect(DB_PATH)
    trades = pd.read_sql_query("SELECT * FROM trade_log", conn)
    conn.close()
    return trades.dropna(subset=['outcome'])

def backtest_summary():
    df = load_trades()
    print("\n🔁 FX Agent Backtest Summary")
    print("=" * 50)
    print(f"Total Trades: {len(df)}")
    print(f"Wins: {(df['outcome'].str.lower() == 'win').sum()}")
    print(f"Losses: {(df['outcome'].str.lower() == 'loss').sum()}")

    # Accuracy
    df['target'] = df['outcome'].apply(lambda x: 1 if str(x).lower() == 'win' else 0)
    accuracy = df['target'].mean() * 100
    print(f"Win Rate: {accuracy:.2f}%")

    # Score-based performance
    print("\n📊 Edge Score Breakdown:")
    print(df.groupby('score')['target'].mean().round(2) * 100)

    # Label performance
    print("\n📈 Performance by Institutional Label:")
    print(df.groupby('label')['target'].mean().round(2) * 100)

    # Pair performance
    print("\n💱 Performance by Pair:")
    print(df.groupby('pair')['target'].mean().round(2) * 100)

if __name__ == "__main__":
    backtest_summary()
