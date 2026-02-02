import pandas as pd
from pathlib import Path

# Caminho do arquivo
file_path = Path("data/processed/exemplo_pcap.csv")

# === Ler arquivo ===
try:
    df = pd.read_csv(file_path)
    print("✅ Arquivo Wireshark (PCAP) carregado com sucesso!")
    print("Total de linhas:", len(df))
    print("Colunas:", list(df.columns))
    print("\nPrévia dos dados:")
    print(df.head())
except FileNotFoundError:
    print("❌ Arquivo não encontrado:", file_path)
except Exception as e:
    print("⚠️ Erro ao carregar o arquivo:", e)
