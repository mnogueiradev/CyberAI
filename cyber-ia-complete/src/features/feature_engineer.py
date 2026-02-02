# src/features/feature_engineer.py
import pandas as pd
import numpy as np
from pathlib import Path

def find_raw_path():
    # tenta vários padrões de pasta (minúsculas/maiúsculas)
    candidates = [Path("data/raw"), Path("Data/Raw"), Path("data/Raw"), Path("Data/raw")]
    for p in candidates:
        if p.exists():
            return p
    p = Path("data/raw")
    p.mkdir(parents=True, exist_ok=True)
    return p

def gerar_features(pcap_filename="exemplo.csv", nmap_filename="scan.csv", out_filename="features.csv"):
    raw = find_raw_path()
    processed = Path("Data/Processed")
    processed.mkdir(parents=True, exist_ok=True)

    pcap_path = raw / pcap_filename
    nmap_path = raw / nmap_filename

    # Lê o CSV do Wireshark
    try:
        pcap = pd.read_csv(pcap_path)
        print(f"[ok] PCAP carregado: {pcap_path} ({len(pcap)} linhas)")
    except FileNotFoundError:
        print(f"[erro] Arquivo PCAP não encontrado: {pcap_path}")
        return

    # Padroniza colunas
    pcap.columns = [c.strip().lower() for c in pcap.columns]
    if "length" not in pcap.columns:
        for c in pcap.columns:
            if "len" in c:
                pcap = pcap.rename(columns={c: "length"})
                break

    # Agrega métricas por IP de origem
    grp = pcap.groupby("src").agg(
        pkt_count=("length", "count"),
        pkt_bytes=("length", "sum"),
        pkt_mean_len=("length", "mean"),
        unique_dsts=("dst", "nunique"),
        proto_nunique=("proto", lambda s: s.nunique() if "proto" in pcap.columns else 0)
    ).reset_index().rename(columns={"src": "src_ip"})

    grp.fillna(0, inplace=True)

    # Lê o CSV do Nmap
    if nmap_path.exists():
        nmap = pd.read_csv(nmap_path, dtype={'port': str})
        nmap.columns = [c.strip().lower() for c in nmap.columns]
        open_ports = nmap[nmap['state'].str.lower() == 'open']
        ports_count = open_ports.groupby('host').size().reset_index(name='open_ports_count')
        important_ports = ['21','22','23','53','80','139','445','3306']
        for port in important_ports:
            ports_count[f'port_{port}'] = open_ports['port'].eq(port).groupby(open_ports['host']).sum().values
        ports_count = ports_count.rename(columns={'host': 'src_ip'})
    else:
        print(f"[warn] Nmap CSV não encontrado em {nmap_path}")
        ports_count = pd.DataFrame(columns=['src_ip','open_ports_count'])

    # Junta as features
    features = pd.merge(grp, ports_count, on='src_ip', how='left').fillna(0)
    for c in features.columns:
        if c != 'src_ip':
            features[c] = pd.to_numeric(features[c], errors='coerce').fillna(0)

    out_path = processed / out_filename
    features.to_csv(out_path, index=False)
    print(f"[ok] Features salvas em: {out_path}")
    print(features.head())

if __name__ == "__main__":
    gerar_features()
