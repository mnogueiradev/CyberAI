import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

RAW_PATH = os.path.join(BASE_DIR, "data", "datasets", "unsw_nb15", "csv")
PROCESSED_PATH = os.path.join(BASE_DIR, "data", "processed")

os.makedirs(PROCESSED_PATH, exist_ok=True)

train_file = os.path.join(RAW_PATH, "UNSW_NB15_training-set.csv")
test_file = os.path.join(RAW_PATH, "UNSW_NB15_testing-set.csv")

print("Carregando datasets...")

df_train = pd.read_csv(train_file)
df_test = pd.read_csv(test_file)

df = pd.concat([df_train, df_test], ignore_index=True)

print("Pré-processando dados...")

df = df.dropna()
df = df.select_dtypes(include=["number"])

output_file = os.path.join(PROCESSED_PATH, "features.csv")
df.to_csv(output_file, index=False)

print("Dataset UNSW-NB15 processado com sucesso!")
print(f"Total de registros: {df.shape[0]}")
print(f"Arquivo salvo em: {output_file}")
