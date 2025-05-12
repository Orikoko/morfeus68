# fx_chat_pro.py — Elite FX Chat Assistant (Memory + Reasoning)

import sqlite3
import ast
from datetime import datetime

DB_PATH = "fx_history.db"

# === Load latest snapshot from DB ===
def load_snapshot():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, fx_data, risk_data, top_news, label, reasoning FROM fx_history ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "timestamp": row[0],
        "fx_data": ast.literal_eval(row[1]) if row[1] else {},
        "risk_data": ast.literal_eval(row[2]) if row[2] else {},
        "top_news": row[3],
        "label": row[4],
        "reasoning": row[5]
    }

# === Smart Answer Generator ===
def generate_reasoning(context):
    risk = context['risk_data']
    fx = context['fx_data']
    label = context['label'] or "Neutral"
    news = context['top_news'] or "No recent headlines"
    summary = f"🧠 As of {context['timestamp']}, the market label is {label}. "

    if 'VIX' in risk:
        if risk['VIX'] > 25:
            summary += "VIX is elevated, indicating a risk-off tone. "
        elif risk['VIX'] < 15:
            summary += "VIX is low, suggesting risk-on conditions. "
    if 'S&P 500' in risk:
        summary += f"S&P 500 sits at {risk['S&P 500']}, helping assess risk appetite. "

    if fx:
        top_mover = max(fx.items(), key=lambda x: abs(x[1]))
        direction = "up" if top_mover[1] > 0 else "down"
        summary += f"Top FX movement: {top_mover[0]} is {direction} {abs(top_mover[1]):.3f}%. "

    summary += f"Headline: {news.split('|')[0].strip()}"
    return summary

# === Trade Idea Generator ===
def generate_trade_idea(context):
    fx = context['fx_data']
    label = context['label'] or "Neutral"
    if not fx:
        return "Not enough FX data to generate a trade idea."
    
    movers = sorted(fx.items(), key=lambda x: abs(x[1]), reverse=True)
    top = movers[0]
    bias = "LONG" if top[1] > 0 else "SHORT"
    idea = f"💡 Consider {bias} {top[0]} based on recent move of {abs(top[1]):.3f}%. "
    if label != "Neutral":
        idea += f"This aligns with institutional label: {label}."
    return idea

# === Session Memory Chat Assistant ===
def chat():
    print("\n💬 FX Chat Pro — Ask About Bias, Risk, Macro, Trade Ideas")
    print("Type 'exit' to quit.\n")
    context = load_snapshot()
    if not context:
        print("[Error] No data found. Run fx_core_agent.py first.")
        return

    memory = []  # stores (question, response) pairs

    while True:
        q = input("🧑 You: ").strip().lower()
        if q in ["exit", "quit"]:
            print("Goodbye.")
            break
        elif "bias" in q:
            answer = f"📈 Market bias: {context['label']}"
        elif "risk" in q or "vix" in q:
            vix = context['risk_data'].get('VIX')
            answer = f"VIX is {vix}. Risk tone: {'risk-off' if vix and vix > 25 else 'neutral' if vix else 'unknown'}"
        elif "summary" in q or "macro" in q or "outlook" in q:
            answer = generate_reasoning(context)
        elif "idea" in q or "trade" in q:
            answer = generate_trade_idea(context)
        elif "news" in q:
            answer = f"📰 Top headline: {context['top_news'].split('|')[0].strip()}"
        elif "memory" in q:
            answer = "\n".join([f"{i+1}. 🧠 You: {m[0]}\n   🤖 Agent: {m[1]}" for i, m in enumerate(memory)]) or "(No memory yet.)"
        else:
            answer = generate_reasoning(context) + "\n(I'm using reasoning fallback — no GPT for now.)"

        memory.append((q, answer))
        print(f"🤖 Agent: {answer}\n")

if __name__ == "__main__":
    chat()
