# fx_journal_exporter.py — Session Report & Markdown Exporter

import sqlite3
import pandas as pd
from datetime import datetime
import os

DB_PATH = "fx_history.db"
EXPORT_FOLDER = "reports"

os.makedirs(EXPORT_FOLDER, exist_ok=True)

# === Load recent trade and reasoning data ===
def load_recent_trades(limit=10):
    conn = sqlite3.connect(DB_PATH)
    trades = pd.read_sql_query("SELECT * FROM trade_log ORDER BY id DESC LIMIT ?", conn, params=(limit,))
    conn.close()
    return trades[::-1]  # chronological order

# === Generate markdown report ===
def generate_md_report(trades):
    today = datetime.now().strftime("%Y-%m-%d")
    filename = os.path.join(EXPORT_FOLDER, f"fx_journal_{today}.md")

    with open(filename, "w") as f:
        f.write(f"# 📘 FX Agent Trade Journal — {today}\n\n")
        for i, row in trades.iterrows():
            f.write(f"## Trade {i+1}: {row['pair']} ({row['direction']})\n")
            f.write(f"- Timestamp: {row['timestamp']}\n")
            f.write(f"- Score: {row['score']}\n")
            f.write(f"- Strategy: {row.get('strategy', 'N/A')}\n")
            f.write(f"- Label: {row['label']}\n")
            f.write(f"- Outcome: {row['outcome'] or '-'}\n")
            f.write(f"- Macro: {row['macro']}\n")
            f.write("\n---\n\n")

    print(f"✅ Markdown report saved to {filename}")
    return filename

if __name__ == "__main__":
    print("\n📘 FX Journal Exporter")
    trades = load_recent_trades()
    generate_md_report(trades)