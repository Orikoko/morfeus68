# fx_lstm_model.py — LSTM FX Bias or Trade Forecasting

import pandas as pd
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

DATA_PATH = "fx_training_data.csv"

# === Load dataset and preprocess ===
def load_data():
    df = pd.read_csv(DATA_PATH)
    df = df.drop(columns=["timestamp", "reasoning", "pair", "direction", "outcome"], errors='ignore')
    df = df.dropna()
    label_map = {"Bullish": 2, "Neutral": 1, "Bearish": 0}
    df['label'] = df['label'].map(label_map).fillna(1)
    return df

# === Create sequences ===
def create_sequences(df, sequence_length=5):
    features = df.drop(columns=["label"]).values
    target = df['label'].values
    X, y = [], []
    for i in range(len(features) - sequence_length):
        X.append(features[i:i+sequence_length])
        y.append(target[i + sequence_length])
    return np.array(X), np.array(y)

# === Build LSTM model ===
def build_model(input_shape):
    model = Sequential()
    model.add(LSTM(64, input_shape=input_shape, return_sequences=False))
    model.add(Dropout(0.3))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(3, activation='softmax'))
    model.compile(loss='sparse_categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    return model

if __name__ == "__main__":
    df = load_data()
    scaler = MinMaxScaler()
    df[df.columns[:-1]] = scaler.fit_transform(df[df.columns[:-1]])

    X, y = create_sequences(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = build_model((X.shape[1], X.shape[2]))
    history = model.fit(X_train, y_train, epochs=30, batch_size=8, validation_data=(X_test, y_test))

    # === Plot loss ===
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.title('LSTM FX Label Prediction Loss')
    plt.legend()
    plt.show()

    # Save model
    model.save("lstm_fx_model.h5")
    print("✅ LSTM model saved as lstm_fx_model.h5")