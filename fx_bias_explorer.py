# fx_bias_explorer.py — Visual FX Bias and Trend Explorer

import sqlite3
import matplotlib.pyplot as plt
from collections import Counter
from datetime import datetime
import ast

DB_PATH = "fx_history.db"

# === Load label history ===
def load_bias_history(limit=100):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, label FROM fx_history ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    rows.reverse()  # chronological order
    return rows

# === Plot label trend over time ===
def plot_label_trend():
    data = load_bias_history(50)
    dates = [datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S") for row in data]
    labels = [row[1] or "Unknown" for row in data]

    # Encode labels numerically
    label_map = {"Bearish": -1, "Neutral": 0, "Bullish": 1, "Unknown": 0.5}
    values = [label_map.get(lbl, 0.5) for lbl in labels]

    plt.figure(figsize=(12, 5))
    plt.plot(dates, values, marker='o', linestyle='-', label="Bias Trend")
    plt.axhline(0, color='gray', linestyle='--')
    plt.title("FX Bias Trend Over Time")
    plt.ylabel("Bias Level")
    plt.yticks([-1, 0, 1], ["Bearish", "Neutral", "Bullish"])
    plt.xticks(rotation=45)
    plt.grid(True)
    plt.tight_layout()
    plt.show()

# === Label frequency summary ===
def show_label_counts():
    data = load_bias_history(100)
    counts = Counter([row[1] or "Unknown" for row in data])
    print("\n🧮 Bias Counts (Last 100 Runs):")
    for lbl, cnt in counts.items():
        print(f"- {lbl}: {cnt}")

if __name__ == "__main__":
    print("\n📊 FX Bias Explorer")
    print("1. Show label trend plot\n2. Show label counts\n3. Exit")
    while True:
        choice = input("Select: ")
        if choice == "1":
            plot_label_trend()
        elif choice == "2":
            show_label_counts()
        elif choice == "3":
            print("Goodbye.")
            break
        else:
            print("Invalid choice.")
