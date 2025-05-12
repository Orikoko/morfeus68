# fx_timeframe_analyzer.py — Multi-Timeframe Bias Engine

import yfinance as yf
import pandas as pd

# === Config ===
CURRENCY_PAIRS = {
    "EURUSD=X": "EUR/USD",
    "USDJPY=X": "USD/JPY",
    "GBPUSD=X": "GBP/USD",
    "AUDUSD=X": "AUD/USD",
    "USDCAD=X": "USD/CAD"
}

TIMEFRAMES = {
    "15m": {"period": "2d", "interval": "15m"},
    "1h":  {"period": "5d", "interval": "1h"},
    "1d":  {"period": "3mo", "interval": "1d"}
}

# === SMA Bias Logic ===
def get_bias_sma(close_series):
    sma_short = close_series.rolling(10).mean()
    sma_long = close_series.rolling(50).mean()
    try:
        short_val = float(sma_short.iloc[-1])
        long_val = float(sma_long.iloc[-1])
        if pd.isna(short_val) or pd.isna(long_val):
            return "Neutral"
        if short_val > long_val:
            return "Bullish"
        elif short_val < long_val:
            return "Bearish"
        else:
            return "Neutral"
    except:
        return "Neutral"

# === Main Analyzer ===
def analyze_multi_timeframe(pair_symbol):
    result = {"pair": CURRENCY_PAIRS[pair_symbol], "bias": {}}
    for tf, tf_params in TIMEFRAMES.items():
        df = yf.download(pair_symbol, period=tf_params["period"], interval=tf_params["interval"])
        if df.empty:
            result['bias'][tf] = "No Data"
        else:
            bias = get_bias_sma(df['Close'])
            result['bias'][tf] = bias
    return result

# === Alignment Scoring ===
def assess_alignment(bias_dict):
    values = list(bias_dict.values())
    count = {"Bullish": 0, "Bearish": 0, "Neutral": 0, "No Data": 0}
    for b in values:
        count[b] += 1

    if count['Bullish'] == 3:
        return "Strong Bullish Alignment"
    elif count['Bearish'] == 3:
        return "Strong Bearish Alignment"
    elif count['Bullish'] >= 2:
        return "Leaning Bullish"
    elif count['Bearish'] >= 2:
        return "Leaning Bearish"
    else:
        return "Mixed/Unclear"

# === Run Test ===
if __name__ == "__main__":
    for symbol in CURRENCY_PAIRS:
        print(f"\n🔍 Multi-Timeframe Bias — {CURRENCY_PAIRS[symbol]}")
        result = analyze_multi_timeframe(symbol)
        alignment = assess_alignment(result['bias'])
        for tf, bias in result['bias'].items():
            print(f"{tf}: {bias}")
        print(f"🧠 Alignment: {alignment}")