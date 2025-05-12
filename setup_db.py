import sqlite3

def setup_database():
    conn = sqlite3.connect('fx_history.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS fx_history (
            id INTEGER PRIMARY KEY,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            fx_data TEXT,
            risk_data TEXT,
            top_news TEXT,
            label TEXT,
            fx_change TEXT,
            reasoning TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY,
            currency_pair TEXT,
            direction TEXT,
            strategy TEXT,
            entry_price REAL,
            exit_price REAL,
            result TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trade_log (
            id INTEGER PRIMARY KEY,
            strategy TEXT,
            currency_pair TEXT,
            entry REAL,
            exit REAL,
            pnl REAL,
            outcome TEXT,
            score REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

if __name__ == "__main__":
    setup_database()
