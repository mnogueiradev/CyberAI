import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix

def main():
    df = pd.read_csv("reports/infer.csv")

    y_true = df["label"]            # verdade do dataset
    y_pred = df["final_anomaly"]    # decisão da IA

    print("\n=== MATRIZ DE CONFUSÃO ===")
    print(confusion_matrix(y_true, y_pred))

    print("\n=== RELATÓRIO DE CLASSIFICAÇÃO ===")
    print(classification_report(y_true, y_pred, digits=4))

    # Contagem simples (ótimo para relatório)
    print("\n=== RESUMO ===")
    print("Ataques reais no dataset:", (y_true == 1).sum())
    print("Ataques detectados pela IA:", (y_pred == 1).sum())
    print("Ataques corretamente detectados (TP):", ((y_true == 1) & (y_pred == 1)).sum())

if __name__ == "__main__":
    main()
