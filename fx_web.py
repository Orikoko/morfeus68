from flask import Flask, jsonify
from flask_cors import CORS  # clearly add this import
import sqlite3
import json

app = Flask(__name__)
CORS(app)  # explicitly enable CORS here

def get_latest_fx_data():
    conn = sqlite3.connect('fx_history.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT timestamp, fx_data, risk_data, top_news, label, fx_change, reasoning
        FROM fx_history
        ORDER BY id DESC
        LIMIT 1
    ''')

    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "timestamp": row[0],
            "fx_data": json.loads(row[1]) if row[1] else {},
            "risk_data": json.loads(row[2]) if row[2] else {},
            "top_news": json.loads(row[3]) if row[3] else [],
            "label": row[4],
            "fx_change": row[5],
            "reasoning": row[6]
        }
    else:
        return {}

@app.route('/')
def index():
    data = get_latest_fx_data()
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
