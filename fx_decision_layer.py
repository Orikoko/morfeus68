# fx_decision_layer.py — Multi-Model Trade Decision Engine

# Combines model confidence, strategy alignment, risk score, and macro bias into a unified trade score

def score_trade(edge_score, confidence, risk_level, strategy_alignment, label_agreement):
    score = 0
    reasons = []

    # Edge score influence
    if edge_score >= 4:
        score += 2
        reasons.append("Strong edge score")
    elif edge_score >= 3:
        score += 1
        reasons.append("Moderate edge score")
    else:
        reasons.append("Low edge score")

    # Confidence from model (ML predictor)
    if confidence >= 80:
        score += 2
        reasons.append("High ML confidence")
    elif confidence >= 60:
        score += 1
        reasons.append("Moderate ML confidence")
    else:
        reasons.append("Low ML confidence")

    # Risk level influence
    if risk_level == "Low":
        score += 2
        reasons.append("Low risk environment")
    elif risk_level == "Medium":
        score += 1
        reasons.append("Moderate risk")
    else:
        score -= 1
        reasons.append("High risk")

    # Strategy alignment
    if strategy_alignment == "Strong Bullish Alignment" or strategy_alignment == "Strong Bearish Alignment":
        score += 2
        reasons.append("Multi-timeframe agreement")
    elif "Leaning" in strategy_alignment:
        score += 1
        reasons.append("Partial alignment")
    else:
        reasons.append("No alignment across timeframes")

    # Label match
    if label_agreement:
        score += 1
        reasons.append("Label agrees with strategy bias")
    else:
        reasons.append("Label and strategy bias diverge")

    final_score = min(score, 10)
    decision = "✅ APPROVE TRADE" if final_score >= 7 else ("⚠️ WATCHLIST" if final_score >= 5 else "❌ REJECT TRADE")

    return {
        "final_score": final_score,
        "decision": decision,
        "rationale": ", ".join(reasons)
    }

# === Example ===
if __name__ == "__main__":
    trade = score_trade(
        edge_score=4,
        confidence=82,
        risk_level="Medium",
        strategy_alignment="Leaning Bullish",
        label_agreement=True
    )
    print("\n🧠 Trade Decision Output")
    print(f"Score: {trade['final_score']}/10")
    print(f"Decision: {trade['decision']}")
    print(f"Why: {trade['rationale']}")