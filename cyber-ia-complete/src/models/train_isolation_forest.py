import pandas as pd
import os
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# Caminhos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "features.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models")

os.makedirs(MODEL_PATH, exist_ok=True)

print("Carregando dataset processado...")
df = pd.read_csv(DATA_PATH)

# Normalização
scaler = StandardScaler()
X = scaler.fit_transform(df)

print("Treinando Isolation Forest...")
model = IsolationForest(
    n_estimators=150,
    contamination=0.05,
    random_state=42,
    n_jobs=-1
)

model.fit(X)

# Salvar modelo e scaler
joblib.dump(model, os.path.join(MODEL_PATH, "isolation_forest.joblib"))
joblib.dump(scaler, os.path.join(MODEL_PATH, "scaler.joblib"))

print("Modelo treinado com sucesso!")
print("Arquivos salvos em /models")
