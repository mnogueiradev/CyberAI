import pandas as pd
import os
import numpy as np
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow.keras import layers, models

# Caminhos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "features.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models", "autoencoder")

os.makedirs(MODEL_DIR, exist_ok=True)

print("Carregando dataset...")
df = pd.read_csv(DATA_PATH)

# Normalização
scaler = StandardScaler()
X = scaler.fit_transform(df)

input_dim = X.shape[1]

print(f"Dimensão de entrada: {input_dim}")

# Modelo Autoencoder
input_layer = layers.Input(shape=(input_dim,))
encoded = layers.Dense(64, activation="relu")(input_layer)
encoded = layers.Dense(32, activation="relu")(encoded)
latent = layers.Dense(16, activation="relu")(encoded)

decoded = layers.Dense(32, activation="relu")(latent)
decoded = layers.Dense(64, activation="relu")(decoded)
output_layer = layers.Dense(input_dim, activation="linear")(decoded)

autoencoder = models.Model(inputs=input_layer, outputs=output_layer)

autoencoder.compile(
    optimizer="adam",
    loss="mse"
)

print("Treinando Autoencoder...")
history = autoencoder.fit(
    X, X,
    epochs=30,
    batch_size=256,
    validation_split=0.1,
    shuffle=True,
    verbose=1
)

# Salvar modelo
autoencoder.save(MODEL_DIR)

print("Autoencoder treinado e salvo com sucesso!")
