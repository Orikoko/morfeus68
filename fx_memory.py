# fx_memory.py — FX Historical Insight Tool

import sqlite3
import os
from datetime import datetime

DB_PATH = "fx_history.db"

# Load past entries from DB
def load_history(limit=10):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, label, fx_change, reasoning FROM fx_history ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return rows[::-1]  # chronological order

# Display formatted historical data
def show_history():
    print("\n📜 FX Agent Historical Summary (Last 10 Runs)")
    print("=" * 60)
    history = load_history()
    for i, row in enumerate(history):
        ts, label, fx_change, reasoning = row
        reason_display = reasoning[:120] + ('...' if len(reasoning) > 120 else '') if reasoning else '(no reasoning)'
        print(f"{i+1}. Time: {ts} | Label: {label} | Change: {fx_change} | Reason: {reason_display}")


# Trend summary by label counts
def label_trend_summary():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT label, COUNT(*) FROM fx_history GROUP BY label")
    results = cursor.fetchall()
    conn.close()
    print("\n📊 Market Label Trend Summary:")
    for label, count in results:
        print(f"- {label or 'Unknown'}: {count}x")

if __name__ == "__main__":
    print("\n🔍 FX Historical Intelligence Tool")
    print("1. Show history\n2. Show label trend\n3. Exit")
    while True:
        choice = input("Select: ")
        if choice == "1":
            show_history()
        elif choice == "2":
            label_trend_summary()
        elif choice == "3":
            print("Goodbye.")
            break
        else:
            print("Invalid choice. Try again.")

