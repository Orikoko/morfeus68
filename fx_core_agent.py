import fx_edge_predictor
import fx_lstm_model
import fx_pca_model
import fx_strategy_engine
import fx_strategy_evaluator
import fx_risk_engine
import fx_trade_log
import fx_journal_exporter
import fx_bias_explorer
import os
import yfinance as yf
import feedparser
import sqlite3
import json
from datetime import datetime

# Fetch FX prices clearly
def fetch_fx_prices(symbols):
    prices = {}
    for symbol in symbols:
        df = yf.download(symbol + '=X', period="1d", interval="1m")
        if not df.empty:
            prices[symbol] = df['Close'].iloc[-1]
        else:
            prices[symbol] = None
    return prices

# Fetch Risk sentiment clearly
def fetch_risk_sentiment():
    risk = {}
    sp500 = yf.download('^GSPC', period="1d", interval="1m")
    vix = yf.download('^VIX', period="1d", interval="1m")

    risk['S&P 500'] = sp500['Close'].iloc[-1] if not sp500.empty else None
    risk['VIX'] = vix['Close'].iloc[-1] if not vix.empty else None

    return risk

# Fetch top news clearly
def fetch_top_news():
    rss_url = "https://www.forexfactory.com/rss.php"
    news_feed = feedparser.parse(rss_url)

    top_news = [entry.title for entry in news_feed.entries[:5]]

    return top_news

# Record history in database clearly
def record_history(label, reasoning, prices, risk, top_news):
    conn = sqlite3.connect('fx_history.db')
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO fx_history (label, reasoning, fx_data, risk_data, top_news, fx_change)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        label,
        reasoning,
        json.dumps(prices),
        json.dumps(risk),
        json.dumps(top_news),
        json.dumps(prices)
    ))

    conn.commit()
    conn.close()

# Main agent function clearly
def run_agent():
    symbols = ['EURUSD', 'USDJPY', 'GBPUSD', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
               'EURGBP', 'EURJPY', 'EURCHF', 'GBPJPY', 'GBPCHF', 'AUDJPY', 'AUDCAD',
               'AUDCHF', 'CADJPY', 'CADCHF', 'NZDJPY', 'NZDCHF']

    prices = fetch_fx_prices(symbols)
    risk = fetch_risk_sentiment()
    top_news = fetch_top_news()

    label = "Neutral"  # Can later be enhanced with your advanced logic
    reasoning = "(fallback) Reason unavailable"  # Can later integrate GPT reasoning here

    record_history(label, reasoning, prices, risk, top_news)

    print("\n=== FX AGENT RUN ", datetime.now(), "===")
    print("[FX PRICES]", prices)
    print("[RISK]", risk)
    print("[NEWS]", top_news)
    print("[LABEL]", label)
    print("[REASONING]", reasoning)

# Run the agent explicitly
if __name__ == '__main__':
    run_agent()
