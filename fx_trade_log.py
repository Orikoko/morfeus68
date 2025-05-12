# fx_trade_log.py — Trade Idea Logger + Tracker

import sqlite3
from datetime import datetime
import os
import ast

DB_PATH = "fx_history.db"

# === Setup trade table if needed ===
def init_trade_table():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trade_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            pair TEXT,
            direction TEXT,
            score INTEGER,
            label TEXT,
            macro TEXT,
            outcome TEXT
        )
    ''')
    conn.commit()
    conn.close()

# === Log a new trade idea ===
def log_trade(pair, direction, score, label, macro):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("INSERT INTO trade_log (timestamp, pair, direction, score, label, macro, outcome) VALUES (?, ?, ?, ?, ?, ?, ?)",
                   (ts, pair, direction, score, label, macro, None))
    conn.commit()
    conn.close()
    print(f"✅ Logged trade: {direction} {pair} @ {score}/5 (Label: {label})")

# === Show all trade ideas ===
def show_trades():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, pair, direction, score, label, macro, outcome FROM trade_log ORDER BY id DESC LIMIT 10")
    rows = cursor.fetchall()
    conn.close()
    print("\n📓 Recent Trade Ideas:")
    for row in rows:
        ts, pair, direction, score, label, macro, outcome = row
        print(f"{ts} — {direction} {pair} | Score: {score}/5 | Label: {label} | Outcome: {outcome or '-'}")

# === Update trade outcome ===
def update_outcome():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    trade_id = input("Enter trade ID to update: ")
    outcome = input("Enter outcome (win/loss): ")
    cursor.execute("UPDATE trade_log SET outcome = ? WHERE id = ?", (outcome, trade_id))
    conn.commit()
    conn.close()
    print("✅ Outcome updated.")

if __name__ == "__main__":
    init_trade_table()
    print("\n📊 FX Trade Log Utility")
    print("1. Log new trade\n2. Show recent trades\n3. Update outcome\n4. Exit")
    while True:
        choice = input("Select: ")
        if choice == "1":
            pair = input("Pair: ")
            direction = input("Direction (LONG/SHORT): ")
            score = int(input("Edge Score (1–5): "))
            label = input("Institutional Label: ")
            macro = input("Macro Context: ")
            log_trade(pair.upper(), direction.upper(), score, label, macro)
        elif choice == "2":
            show_trades()
        elif choice == "3":
            update_outcome()
        elif choice == "4":
            print("Goodbye.")
            break
        else:
            print("Invalid choice.")
