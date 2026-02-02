# debug_teste_csv.py
import os
import sys
from scapy.all import rdpcap
import pandas as pd
import traceback

print(">>> Iniciando debug do pipeline PCAP -> CSV")
print("Working dir:", os.getcwd())
print("Python:", sys.executable)
print()

pcap_path = os.path.join("data", "raw", "exemplo.pcap")
out_dir = os.path.join("data", "processed")
out_csv = os.path.join(out_dir, "exemplo.csv")

print("Verificando caminhos:")
print(" - PCAP path:", pcap_path, " -> exists:", os.path.exists(pcap_path))
print(" - Out dir:", out_dir, " -> exists:", os.path.exists(out_dir))
print()

# se pasta processed não existir, cria e indica
if not os.path.exists(out_dir):
    try:
        os.makedirs(out_dir, exist_ok=True)
        print("Criada pasta:", out_dir)
    except Exception as e:
        print("Erro ao criar pasta processed:", e)
        traceback.print_exc()
        sys.exit(1)

# tenta ler o pcap
try:
    print("Lendo PCAP (rdpcap)...")
    packets = rdpcap(pcap_path)
    n = len(packets)
    print("Pacotes lidos:", n)
    if n > 0:
        try:
            print("Resumo dos primeiros pacotes:", packets[:5].summary())
        except Exception as e:
            print("Não foi possível gerar resumo dos pacotes:", e)
    else:
        print("ATENÇÃO: PCAP vazio (0 pacotes). Se estiver vazio, pegue outro arquivo PCAP válido.")
except FileNotFoundError as e:
    print("FileNotFoundError:", e)
    traceback.print_exc()
    sys.exit(1)
except Exception as e:
    print("Erro ao rodar rdpcap:", e)
    traceback.print_exc()
    sys.exit(1)

# tenta gerar CSV apenas se houver pacotes
if n == 0:
    print("Saindo porque não há pacotes para processar.")
    sys.exit(0)

rows = []
try:
    for i, pkt in enumerate(packets[:100]):  # limita 100 pacotes para teste
        try:
            src = pkt[0][1].src if hasattr(pkt[0][1], "src") else ""
            dst = pkt[0][1].dst if hasattr(pkt[0][1], "dst") else ""
            proto = pkt[0][1].name if hasattr(pkt[0][1], "name") else ""
        except Exception:
            # fallback genérico
            src = getattr(pkt, "src", "")
            dst = getattr(pkt, "dst", "")
            proto = pkt.__class__.__name__
        rows.append({
            "time": getattr(pkt, "time", ""),
            "src": src,
            "dst": dst,
            "proto": proto,
            "length": len(pkt),
            "info": str(pkt.summary()) if hasattr(pkt, "summary") else repr(pkt)[:200]
        })
except Exception as e:
    print("Erro ao iterar pacotes:", e)
    traceback.print_exc()
    sys.exit(1)

try:
    df = pd.DataFrame(rows)
    df.to_csv(out_csv, index=False)
    print("CSV salvo com sucesso em:", out_csv)
    print("Linhas salvas:", len(df))
    print(df.head().to_string())
except Exception as e:
    print("Erro ao salvar CSV ou criar DataFrame:", e)
    traceback.print_exc()
    sys.exit(1)

print(">>> Debug finalizado com sucesso.")
