import pandas as pd

# Lê o CSV gerado anteriormente
df = pd.read_csv("data/processed/exemplo.csv")

# Mostra as 5 primeiras linhas
print("Primeiras linhas do CSV:\n")
print(df.head().to_string())

# Mostra estatísticas numéricas
print("\nDescrições numéricas:\n")
print(df.describe())
