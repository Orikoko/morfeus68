# fx_brain.py — Multi-Model Reasoning Core for FX Agent

import sqlite3
import ast
from datetime import datetime

DB_PATH = "fx_history.db"

# === Load latest agent run ===
def get_latest_run():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, fx_data, risk_data, label, reasoning FROM fx_history ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "timestamp": row[0],
        "fx": ast.literal_eval(row[1]),
        "risk": ast.literal_eval(row[2]),
        "label": row[3],
        "reasoning": row[4]
    }

# === Detect macro/technical conflict ===
def check_macro_conflict(risk_data):
    vix = risk_data.get("VIX")
    spx = risk_data.get("S&P 500")
    if vix and vix > 25 and spx and spx > 4500:
        return True, "🧠 Macro conflict detected: VIX is risk-off but S&P 500 is strong."
    return False, None

# === Strategy mode selector ===
def select_strategy(fx_data):
    if not fx_data:
        return "None"
    top = max(fx_data.items(), key=lambda x: abs(x[1]))
    if abs(top[1]) > 0.3:
        return "Breakout"
    elif abs(top[1]) < 0.1:
        return "Mean Reversion"
    else:
        return "Trend Following"

# === Score confidence based on signal alignment ===
def score_confidence(label, strategy, conflict):
    score = 1
    if strategy == "Trend Following":
        score += 1
    if label != "Neutral":
        score += 1
    if not conflict:
        score += 1
    return f"Confidence Score: {score}/5"

# === Brain Summary Generator ===
def fx_brain_summary():
    ctx = get_latest_run()
    if not ctx:
        return "[Error] No data found. Run fx_core_agent.py first."

    print("\n🧠 FX Brain — Multi-Model Market Summary\n")
    print(f"Time: {ctx['timestamp']}")
    print(f"Label: {ctx['label']}")
    print(f"Reasoning: {ctx['reasoning']}")

    # Strategy and conflict
    strategy = select_strategy(ctx['fx'])
    print(f"Suggested Strategy: {strategy}")

    conflict, conflict_msg = check_macro_conflict(ctx['risk'])
    if conflict:
        print(conflict_msg)

    print(score_confidence(ctx['label'], strategy, conflict))

if __name__ == "__main__":
    fx_brain_summary()
