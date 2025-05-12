# fx_risk_engine.py — Trade Risk + Confidence Filter

import math

# === Risk Evaluation Engine ===
def assess_trade_risk(vix, edge_score, confidence_score, volatility=0.01):
    risk_level = "Low"
    notes = []

    # Macro risk factors
    if vix is None:
        notes.append("Missing VIX value")
    elif vix > 25:
        risk_level = "High"
        notes.append("VIX > 25: Elevated volatility")
    elif vix > 18:
        risk_level = "Medium"
        notes.append("VIX > 18: Cautious environment")

    # Edge + Confidence scoring
    if edge_score < 3:
        risk_level = "High"
        notes.append("Edge score < 3")
    if confidence_score < 60:
        risk_level = "High"
        notes.append("Low confidence < 60%")
    elif confidence_score < 75 and risk_level != "High":
        risk_level = "Medium"
        notes.append("Moderate confidence")

    # Volatility-adjusted factor
    if volatility > 0.015:
        notes.append("Pair volatility above 1.5%")
        if risk_level != "High":
            risk_level = "Medium"

    return {
        "risk_level": risk_level,
        "summary": ", ".join(notes)
    }

# === Example usage ===
if __name__ == "__main__":
    # Simulate trade inputs (normally pulled from agent)
    vix = 24.2
    edge_score = 4
    confidence_score = 72
    pair_volatility = 0.013

    risk = assess_trade_risk(vix, edge_score, confidence_score, pair_volatility)

    print("\n📉 Trade Risk Assessment")
    print(f"Risk Level: {risk['risk_level']}")
    print(f"Reason: {risk['summary']}")
