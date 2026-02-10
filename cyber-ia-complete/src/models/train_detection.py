#!/usr/bin/env python3  # Define o interpretador Python para executar o script
"""
Treina dois detectores:
 - IsolationForest (scikit-learn)
 - Autoencoder (TensorFlow Keras)

Entrada: CSV de features (linhas por 'src', colunas numéricas)
Saída:
 - models/isof.joblib        -> {'model': clf, 'threshold': thresh}
 - models/auto_model/        -> pasta com modelo Keras + report.json (threshold, last_loss)
"""
import os  # Importa módulo para manipulação de sistema de arquivos
import json  # Importa módulo para manipulação de dados JSON
import argparse  # Importa módulo para parse de argumentos de linha de comando
import joblib  # Importa módulo para salvar/carregar modelos de machine learning
import numpy as np  # Importa biblioteca para computação numérica
import pandas as pd  # Importa biblioteca para manipulação de dados tabulares
from sklearn.ensemble import IsolationForest  # Importa algoritmo IsolationForest do scikit-learn
import tensorflow as tf  # Importa framework TensorFlow para deep learning

def train_isolation(features_csv, out_path, contamination=0.05, n_estimators=200):  # Função para treinar modelo IsolationForest
    df = pd.read_csv(features_csv)
    X = df.select_dtypes(include=[np.number]).fillna(0).values
    clf = IsolationForest(n_estimators=n_estimators, contamination=contamination, random_state=42)  # Cria modelo IsolationForest com parâmetros
    clf.fit(X)  # Treina o modelo com os dados
    scores = -clf.score_samples(X)   # Calcula scores de anomalia (maior = mais anômalo)
    # threshold por percentil (ajustável)
    thresh = float(np.percentile(scores, 90))  # Define threshold no percentil 90 dos scores
    os.makedirs(os.path.dirname(out_path) or '.', exist_ok=True)  # Cria diretório de saída se não existir
    joblib.dump({'model': clf, 'threshold': thresh}, out_path)  # Salva modelo e threshold em arquivo joblib
    print(f"[ok] IsolationForest salvo em {out_path} (threshold={thresh:.6f})")  # Imprime mensagem de sucesso
    return thresh

def build_autoencoder(n_features, latent=16):  # Função para construir arquitetura do autoencoder
    inp = tf.keras.Input(shape=(n_features,))  # Define camada de entrada com número de features
    x = tf.keras.layers.Dense(128, activation='relu')(inp)  # Primeira camada densa com 128 neurônios e ativação ReLU
    x = tf.keras.layers.Dense(64, activation='relu')(x)  # Segunda camada densa com 64 neurônios
    z = tf.keras.layers.Dense(latent, activation='relu')(x)  # Camada latente (espaço comprimido) com dimensão latente
    x = tf.keras.layers.Dense(64, activation='relu')(z)  # Camada de expansão com 64 neurônios
    x = tf.keras.layers.Dense(128, activation='relu')(x)  # Camada de expansão com 128 neurônios
    out = tf.keras.layers.Dense(n_features, activation=None)(x)  # Camada de saída com mesmo número de features da entrada
    model = tf.keras.Model(inputs=inp, outputs=out)  # Cria modelo Keras com entrada e saída definidas
    model.compile(optimizer='adam', loss='mse')  # Compila modelo com otimizador Adam e perda MSE
    return model  # Retorna modelo compilado

def train_autoencoder(features_csv, out_dir, epochs=30, batch_size=64, latent=16):  # Função para treinar autoencoder
    df = pd.read_csv(features_csv)
    X = df.select_dtypes(include=[np.number]).fillna(0).values.astype('float32')  # Seleciona dados numéricos e converte para float32
    n = X.shape[1]  # Obtém número de features (colunas)
    model = build_autoencoder(n, latent=latent)  # Constrói modelo autoencoder
    history = model.fit(X, X, epochs=epochs, batch_size=batch_size, validation_split=0.15, verbose=1)  # Treina modelo (entrada=saída para reconstrução)
    recon = model.predict(X, verbose=0)  # Faz predição (reconstrução) dos dados
    mse = np.mean((X - recon) ** 2, axis=1)  # Calcula erro quadrático médio por amostra
    thresh = float(np.percentile(mse, 90))  # Define threshold no percentil 90 dos erros
    os.makedirs(out_dir, exist_ok=True)  # Cria diretório de saída se não existir
    model.save(out_dir + '.keras')  # Salva modelo Keras com extensão .keras
    report = {'threshold': thresh, 'last_loss': float(history.history['loss'][-1])}  # Cria dicionário com threshold e última perda
    with open(os.path.join(out_dir, 'report.json'), 'w') as f:  # Abre arquivo JSON para escrita no diretório
        json.dump(report, f, indent=2)  # Escreve relatório em formato JSON
    print(f"[ok] Autoencoder salvo em {out_dir}.keras (threshold={thresh:.6f})")  # Imprime mensagem de sucesso
    return thresh

def main():  # Função principal do script
    ap = argparse.ArgumentParser()  # Cria parser de argumentos
    ap.add_argument('--features', required=True, help='CSV de features (por src)')  # Adiciona argumento obrigatório para arquivo de features
    ap.add_argument('--out_isof', default='models/isof.joblib', help='caminho para salvar IsolationForest')  # Adiciona argumento para caminho do modelo IsolationForest
    ap.add_argument('--out_auto', default='models/auto_model', help='diretório para salvar Autoencoder')  # Adiciona argumento para diretório do autoencoder
    ap.add_argument('--contamination', type=float, default=0.05)  # Adiciona argumento para taxa de contaminação
    ap.add_argument('--n_estimators', type=int, default=200)  # Adiciona argumento para número de estimadores
    ap.add_argument('--epochs', type=int, default=30)  # Adiciona argumento para número de épocas
    ap.add_argument('--batch', type=int, default=64)  # Adiciona argumento para tamanho do batch
    ap.add_argument('--latent', type=int, default=16)  # Adiciona argumento para dimensão latente
    args = ap.parse_args()  # Faz parse dos argumentos da linha de comando

    print("Carregando features:", args.features)  # Imprime mensagem de carregamento
    if not os.path.exists(args.features):  # Verifica se arquivo de features existe
        raise FileNotFoundError(args.features)  # Lança exceção se arquivo não existir

    # Treina IsolationForest
    th_isof = train_isolation(args.features, args.out_isof, contamination=args.contamination, n_estimators=args.n_estimators)  # Treina modelo IsolationForest

    # Treina Autoencoder
    th_auto = train_autoencoder(args.features, args.out_auto, epochs=args.epochs, batch_size=args.batch, latent=args.latent)  # Treina modelo autoencoder

    # resumo
    summary = {  # Inicia criação do dicionário de resumo
        'isof_path': args.out_isof,  # Caminho do modelo IsolationForest
        'isof_threshold': th_isof,  # Threshold do IsolationForest
        'auto_path': args.out_auto,  # Caminho do autoencoder
        'auto_threshold': th_auto  # Threshold do autoencoder
    }  # Fecha dicionário de resumo
    print("Resumo do treino:", json.dumps(summary, indent=2))  # Imprime resumo formatado em JSON

if __name__ == '__main__':  # Verifica se script está sendo executado diretamente
    main()  # Chama função principal
