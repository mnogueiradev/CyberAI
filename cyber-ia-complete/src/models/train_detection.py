#!/usr/bin/env python3
"""
Treina dois detectores:
 - IsolationForest (scikit-learn)
 - Autoencoder (TensorFlow Keras)

Entrada: CSV de features (linhas por 'src', colunas numéricas)
Saída:
 - models/isof.joblib        -> {'model': clf, 'threshold': thresh}
 - models/auto_model/        -> pasta com modelo Keras + report.json (threshold, last_loss)
"""
import os
import json
import argparse
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import tensorflow as tf

def train_isolation(features_csv, out_path, contamination=0.05, n_estimators=200):
    df = pd.read_csv(features_csv)
    X = df.select_dtypes(include=[np.number]).fillna(0).values
    clf = IsolationForest(n_estimators=n_estimators, contamination=contamination, random_state=42)
    clf.fit(X)
    scores = -clf.score_samples(X)   # maior = mais anômalo
    # threshold por percentil (ajustável)
    thresh = float(np.percentile(scores, 90))
    os.makedirs(os.path.dirname(out_path) or '.', exist_ok=True)
    joblib.dump({'model': clf, 'threshold': thresh}, out_path)
    print(f"[ok] IsolationForest salvo em {out_path} (threshold={thresh:.6f})")
    return thresh

def build_autoencoder(n_features, latent=16):
    inp = tf.keras.Input(shape=(n_features,))
    x = tf.keras.layers.Dense(128, activation='relu')(inp)
    x = tf.keras.layers.Dense(64, activation='relu')(x)
    z = tf.keras.layers.Dense(latent, activation='relu')(x)
    x = tf.keras.layers.Dense(64, activation='relu')(z)
    x = tf.keras.layers.Dense(128, activation='relu')(x)
    out = tf.keras.layers.Dense(n_features, activation=None)(x)
    model = tf.keras.Model(inputs=inp, outputs=out)
    model.compile(optimizer='adam', loss='mse')
    return model

def train_autoencoder(features_csv, out_dir, epochs=30, batch_size=64, latent=16):
    df = pd.read_csv(features_csv)
    X = df.select_dtypes(include=[np.number]).fillna(0).values.astype('float32')
    n = X.shape[1]
    model = build_autoencoder(n, latent=latent)
    history = model.fit(X, X, epochs=epochs, batch_size=batch_size, validation_split=0.15, verbose=1)
    recon = model.predict(X, verbose=0)
    mse = np.mean((X - recon) ** 2, axis=1)
    thresh = float(np.percentile(mse, 90))
    os.makedirs(out_dir, exist_ok=True)
    model.save(out_dir)
    report = {'threshold': thresh, 'last_loss': float(history.history['loss'][-1])}
    with open(os.path.join(out_dir, 'report.json'), 'w') as f:
        json.dump(report, f, indent=2)
    print(f"[ok] Autoencoder salvo em {out_dir} (threshold={thresh:.6f})")
    return thresh

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--features', required=True, help='CSV de features (por src)')
    ap.add_argument('--out_isof', default='models/isof.joblib', help='caminho para salvar IsolationForest')
    ap.add_argument('--out_auto', default='models/auto_model', help='diretório para salvar Autoencoder')
    ap.add_argument('--contamination', type=float, default=0.05)
    ap.add_argument('--n_estimators', type=int, default=200)
    ap.add_argument('--epochs', type=int, default=30)
    ap.add_argument('--batch', type=int, default=64)
    ap.add_argument('--latent', type=int, default=16)
    args = ap.parse_args()

    print("Carregando features:", args.features)
    if not os.path.exists(args.features):
        raise FileNotFoundError(args.features)

    # Treina IsolationForest
    th_isof = train_isolation(args.features, args.out_isof, contamination=args.contamination, n_estimators=args.n_estimators)

    # Treina Autoencoder
    th_auto = train_autoencoder(args.features, args.out_auto, epochs=args.epochs, batch_size=args.batch, latent=args.latent)

    # resumo
    summary = {
        'isof_path': args.out_isof,
        'isof_threshold': th_isof,
        'auto_path': args.out_auto,
        'auto_threshold': th_auto
    }
    print("Resumo do treino:", json.dumps(summary, indent=2))

if __name__ == '__main__':
    main()
