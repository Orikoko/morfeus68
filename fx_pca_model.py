# fx_pca_model.py — Principal Component Analysis for FX Dataset (Most Powerful Version)

import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import numpy as np
import sqlite3

DATA_PATH = "fx_training_data.csv"
DB_PATH = "fx_history.db"

# === Load dataset ===
def load_dataset():
    df = pd.read_csv(DATA_PATH)
    df = df.drop(columns=["timestamp", "reasoning"], errors='ignore')
    df = df.fillna(0)
    return df

# === Run PCA ===
def run_pca(df, n_components=2):
    features = df.select_dtypes(include=["float64", "int64"])
    scaler = StandardScaler()
    print("✅ Shape going into PCA:", features.shape)
    X_scaled = scaler.fit_transform(features)

    pca = PCA(n_components=n_components)
    components = pca.fit_transform(X_scaled)

    print("\n🔍 PCA Explained Variance Ratio:")
    for i, ratio in enumerate(pca.explained_variance_ratio_):
        print(f"  PC{i+1}: {ratio:.2%}")

    df["PC1"] = components[:, 0]
    df["PC2"] = components[:, 1]
    return components, pca, df

# === Save PCA to SQLite (optional) ===
def save_pca_to_db(df):
    conn = sqlite3.connect(DB_PATH)
    if "PC1" in df.columns and "PC2" in df.columns:
        save_df = df[["PC1", "PC2"]].copy()
        save_df.to_sql("pca_snapshot", conn, if_exists="replace", index=False)
        print("✅ PCA components saved to 'pca_snapshot' table in fx_history.db")
    conn.close()

# === Plot PCA with Label and Outcome Coloring ===
def plot_pca_colored(df):
    labels = df.get("label", ["Unknown"] * len(df))
    outcomes = df.get("outcome", [None] * len(df))

    # Color map for bias and shape for outcome
    label_map = {"Bullish": 2, "Neutral": 1, "Bearish": 0, "Unknown": 0.5}
    label_vals = [label_map.get(str(lbl), 0.5) for lbl in labels]

    shapes = {"win": "o", "loss": "x", None: "s"}
    fig, ax = plt.subplots(figsize=(10, 6))
    for i in range(len(df)):
        marker = shapes.get(str(outcomes[i]).lower(), "s") if outcomes[i] else "s"
        ax.scatter(df.iloc[i]["PC1"], df.iloc[i]["PC2"], c=cm.coolwarm(label_vals[i] / 2),
                   edgecolor='k', marker=marker, s=100, alpha=0.7)

    ax.set_title("🧠 FX PCA Bias & Outcome Map")
    ax.set_xlabel("Principal Component 1")
    ax.set_ylabel("Principal Component 2")
    ax.grid(True)
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    df = load_dataset()
    components, pca_model, df = run_pca(df)
    save_pca_to_db(df)
    plot_pca_colored(df)
# fx_pca_model.py — Principal Component Analysis for FX Dataset (Most Powerful Version)

import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import numpy as np
import sqlite3

DATA_PATH = "fx_training_data.csv"
DB_PATH = "fx_history.db"

# === Load dataset ===
def load_dataset():
    df = pd.read_csv(DATA_PATH)
    df = df.drop(columns=["timestamp", "reasoning"], errors='ignore')
    df = df.fillna(0)
    return df

# === Run PCA ===
def run_pca(df, n_components=2):
    features = df.select_dtypes(include=["float64", "int64"])
    scaler = StandardScaler()
    print("✅ Shape going into PCA:", features.shape)
    X_scaled = scaler.fit_transform(features)

    pca = PCA(n_components=n_components)
    components = pca.fit_transform(X_scaled)

    print("\n🔍 PCA Explained Variance Ratio:")
    for i, ratio in enumerate(pca.explained_variance_ratio_):
        print(f"  PC{i+1}: {ratio:.2%}")

    df["PC1"] = components[:, 0]
    df["PC2"] = components[:, 1]
    return components, pca, df

# === Save PCA to SQLite (optional) ===
def save_pca_to_db(df):
    conn = sqlite3.connect(DB_PATH)
    if "PC1" in df.columns and "PC2" in df.columns:
        save_df = df[["PC1", "PC2"]].copy()
        save_df.to_sql("pca_snapshot", conn, if_exists="replace", index=False)
        print("✅ PCA components saved to 'pca_snapshot' table in fx_history.db")
    conn.close()

# === Plot PCA with Label and Outcome Coloring ===
def plot_pca_colored(df):
    labels = df.get("label", ["Unknown"] * len(df))
    outcomes = df.get("outcome", [None] * len(df))

    # Color map for bias and shape for outcome
    label_map = {"Bullish": 2, "Neutral": 1, "Bearish": 0, "Unknown": 0.5}
    label_vals = [label_map.get(str(lbl), 0.5) for lbl in labels]

    shapes = {"win": "o", "loss": "x", None: "s"}
    fig, ax = plt.subplots(figsize=(10, 6))
    for i in range(len(df)):
        marker = shapes.get(str(outcomes[i]).lower(), "s") if outcomes[i] else "s"
        ax.scatter(df.iloc[i]["PC1"], df.iloc[i]["PC2"], c=cm.coolwarm(label_vals[i] / 2),
                   edgecolor='k', marker=marker, s=100, alpha=0.7)

    ax.set_title("🧠 FX PCA Bias & Outcome Map")
    ax.set_xlabel("Principal Component 1")
    ax.set_ylabel("Principal Component 2")
    ax.grid(True)
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    df = load_dataset()
    components, pca_model, df = run_pca(df)
    save_pca_to_db(df)
    plot_pca_colored(df)
