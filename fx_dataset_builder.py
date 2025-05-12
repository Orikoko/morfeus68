# fx_dataset_builder.py — Prepare FX Dataset for ML Modeling

import sqlite3
import pandas as pd
import ast

DB_PATH = "fx_history.db"

# === Load fx_history data ===
def load_fx_history():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT timestamp, fx_data, risk_data, label, reasoning FROM fx_history", conn)
    conn.close()
    # Convert stringified dicts to actual dicts
    df['fx_data'] = df['fx_data'].apply(lambda x: ast.literal_eval(x) if x else {})
    df['risk_data'] = df['risk_data'].apply(lambda x: ast.literal_eval(x) if x else {})
    return df

# === Load trade_log data ===
def load_trade_log():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT timestamp, pair, direction, score, outcome FROM trade_log", conn)
    conn.close()
    return df

# === Build merged training dataset ===
def build_dataset():
    fx_df = load_fx_history()
    trade_df = load_trade_log()

    rows = []
    for i, row in fx_df.iterrows():
        base = {
            "timestamp": row['timestamp'],
            "label": row['label'],
            "reasoning": row['reasoning']
        }
        # Add risk sentiment
        risk = row['risk_data']
        base['VIX'] = risk.get('VIX')
        base['S&P500'] = risk.get('S&P 500')

        # Add FX price changes
        fx = row['fx_data']
        for pair, pct in fx.items():
            base[f"{pair}_pct"] = pct

        # Match with trades if they exist at that timestamp
        matched = trade_df[trade_df['timestamp'] == row['timestamp']]
        if not matched.empty:
            for _, trade in matched.iterrows():
                trade_row = base.copy()
                trade_row.update({
                    "pair": trade['pair'],
                    "direction": trade['direction'],
                    "score": trade['score'],
                    "outcome": trade['outcome']
                })
                rows.append(trade_row)
        else:
            base.update({"pair": None, "direction": None, "score": None, "outcome": None})
            rows.append(base)

    df = pd.DataFrame(rows)
    return df

# === Save or preview the dataset ===
if __name__ == "__main__":
    df = build_dataset()
    print("\n✅ Preview of Merged FX Dataset:")
    print(df.head())

    export = input("\nSave to fx_training_data.csv? (y/n): ")
    if export.lower() == 'y':
        df.to_csv("fx_training_data.csv", index=False)
        print("✅ Saved to fx_training_data.csv")