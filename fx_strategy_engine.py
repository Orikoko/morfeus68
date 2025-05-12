# fx_strategy_engine.py — Strategy Adaptation Core

# Dynamically selects the best strategy based on live FX, macro, label, and volatility

def recommend_strategy(label, vix, fx_changes, volatility_by_pair, confidence):
    notes = []
    strategy = "Neutral"

    # Default thresholds
    is_volatile = vix and vix > 20
    biggest_move = max(fx_changes.items(), key=lambda x: abs(x[1])) if fx_changes else ("None", 0)
    vol = volatility_by_pair.get(biggest_move[0], 0)

    # === STRATEGY LOGIC ===

    if label == "Bullish" and biggest_move[1] > 0.2 and confidence > 70:
        strategy = "Trend Following"
        notes.append("Strong bias and FX strength supports trend")
    elif label == "Bearish" and biggest_move[1] < -0.2 and confidence > 70:
        strategy = "Trend Following"
        notes.append("Bearish bias + downside FX trend")

    elif abs(biggest_move[1]) < 0.1 and vol < 0.01 and not is_volatile:
        strategy = "Mean Reversion"
        notes.append("Low volatility + small FX move → mean reversion setup")

    elif is_volatile and abs(biggest_move[1]) > 0.2:
        strategy = "Breakout"
        notes.append("Volatility + big move = breakout potential")

    elif label and confidence > 75 and not is_volatile:
        strategy = "Macro Bias"
        notes.append("Institutional label strength in calm market")

    else:
        strategy = "Neutral"
        notes.append("No clear alignment")

    return {
        "strategy": strategy,
        "driver": biggest_move[0],
        "move": round(biggest_move[1], 3),
        "volatility": round(vol, 4),
        "notes": ", ".join(notes)
    }

# === Test It ===
if __name__ == "__main__":
    fx_change = {
        "USDJPY": 0.23,
        "EURUSD": -0.01,
        "AUDUSD": 0.04
    }
    pair_vol = {
        "USDJPY": 0.018,
        "EURUSD": 0.009,
        "AUDUSD": 0.010
    }
    result = recommend_strategy(
        label="Bullish",
        vix=19.5,
        fx_changes=fx_change,
        volatility_by_pair=pair_vol,
        confidence=82
    )
    print("\n🧠 Strategy Recommendation:")
    print(f"Suggested: {result['strategy']} on {result['driver']} ({result['move']}%)")
    print(f"Volatility: {result['volatility']} | Reason: {result['notes']}")
