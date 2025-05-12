# fx_chat.py — Smart FX Assistant with Local Reasoning + Trade Idea Fallback

import sqlite3
import os
import ast
from dotenv import load_dotenv

load_dotenv()
DB_PATH = "fx_history.db"

# Load latest snapshot from agent DB
def get_latest_snapshot():
    # Always regenerate reasoning using local engine after loading DB snapshot
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, fx_data, risk_data, top_news, label, reasoning FROM fx_history ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    context = {
        "timestamp": row[0],
        "fx_data": row[1],
        "risk_data": row[2],
        "top_news": row[3],
        "label": row[4],
        "reasoning": row[5]
    }
    # Force replace with fresh local reasoning
    context['reasoning'] = generate_reasoning(context)
    return context

# Parse stringified dicts into real ones
def safe_parse(data):
    try:
        return ast.literal_eval(data)
    except:
        return {}

# Generate fallback reasoning summary
def generate_reasoning(context):
    fx = safe_parse(context['fx_data'])
    risk = safe_parse(context['risk_data'])
    label = context['label']
    summary = f"Based on recent market conditions, the agent labels the market as {label}. "
    if 'VIX' in risk and risk['VIX'] > 25:
        summary += "Elevated VIX indicates risk-off sentiment. "
    if 'S&P 500' in risk and risk['S&P 500'] > 4500:
        summary += "S&P 500 strength supports a bullish environment. "
    if fx:
        movers = sorted(fx.items(), key=lambda x: abs(x[1]), reverse=True)
        top = movers[0][0]
        summary += f"Most notable FX movement seen in {top}. "
    if context['top_news']:
        summary += f"News: {context['top_news'].split('|')[0].strip()}."
    return summary

# Generate trade idea based on rules
def generate_best_trade_idea(context):
    fx = safe_parse(context['fx_data'])
    risk = safe_parse(context['risk_data'])
    label = context['label']
    top = context['top_news']
    pairs = fx.keys()
    best = ""
    score = 0

    for pair in pairs:
        p = pair.upper()
        if label == "Bullish" and ("USD" in p and not p.startswith("USD")):
            best = f"LONG {p} — matches bullish bias on USD."
            score += 2
        elif label == "Bearish" and (p.startswith("USD")):
            best = f"SHORT {p} — aligns with bearish USD bias."
            score += 2
    if "VIX" in risk and risk["VIX"] > 25:
        score += 1
        best += " Volatility elevated (VIX > 25)."
    if "S&P 500" in risk and risk["S&P 500"] > 4000:
        score += 1
        best += " Equity sentiment positive."

    return best + f" Edge Score: {score}/5"

# Answer questions using local strategy
def local_answer(q, context):
    # fallback condition: if reasoning is missing or default fallback
    q = q.lower()
    if "bias" in q:
        return f"Market label: {context['label']}"
    elif "summary" in q or "reason" in q:
        return generate_reasoning(context)
    elif "idea" in q or "trade" in q:
        return generate_best_trade_idea(context)
    elif "news" in q:
        return f"Top News: {context['top_news']}"
    elif "risk" in q:
        return f"Risk Sentiment: {context['risk_data']}"
    elif "price" in q or "fx" in q:
        return f"FX Rates: {context['fx_data']}"
    else:
        fallback = context['reasoning']
        if '(fallback)' in fallback.lower():
            return generate_reasoning(context)
        else:
            return fallback

# Main terminal chat
def chat():
    # Force context refresh with new reasoning every session
    print("\n💬 FX Trade Assistant (Local Mode Enabled)")
    print("Ask anything about macro, bias, or trade setups. Type 'exit' to quit.\n")
    context = get_latest_snapshot()
    context['reasoning'] = generate_reasoning(context)
    context['reasoning'] = generate_reasoning(context)
    if not context:
        print("[Error] No recent FX agent run found. Run fx_core_agent.py first.")
        return

    while True:
        q = input("🧑 You: ")
        if q.lower() in ["exit", "quit"]:
            print("Goodbye.")
            break
        reply = local_answer(q, context)
        print(f"🤖 Agent: {reply}\n")

if __name__ == "__main__":
    chat()

