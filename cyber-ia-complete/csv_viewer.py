#!/usr/bin/env python3
"""
Ferramenta para visualizar dados do infer.csv de forma organizada
Uso: python csv_viewer.py
"""

import pandas as pd
import numpy as np
from tabulate import tabulate
import sys
from pathlib import Path

def format_number(num):
    """Formata números grandes com separadores"""
    if pd.isna(num):
        return "N/A"
    if isinstance(num, (int, float)):
        if num > 1000000:
            return f"{num/1000000:.2f}M"
        elif num > 1000:
            return f"{num/1000:.2f}K"
        else:
            return f"{num:.2f}"
    return str(num)

def format_bytes(bytes_val):
    """Formata bytes em KB, MB, GB"""
    if pd.isna(bytes_val):
        return "N/A"
    if isinstance(bytes_val, (int, float)):
        if bytes_val > 1000000000:
            return f"{bytes_val/1000000000:.2f}GB"
        elif bytes_val > 1000000:
            return f"{bytes_val/1000000:.2f}MB"
        elif bytes_val > 1000:
            return f"{bytes_val/1000:.2f}KB"
        else:
            return f"{bytes_val}B"
    return str(bytes_val)

def analyze_csv():
    """Analisa e exibe o CSV de forma organizada"""
    
    # Caminho do arquivo
    csv_path = Path("reports/infer.csv")
    
    if not csv_path.exists():
        print("❌ Arquivo não encontrado:", csv_path)
        return
    
    print("🔍 Carregando dados...")
    df = pd.read_csv(csv_path)
    
    print(f"📊 Análise do Dataset: {len(df):,} eventos")
    print("=" * 80)
    
    # Estatísticas gerais
    print("\n📈 ESTATÍSTICAS GERAIS:")
    stats_data = [
        ["Total de Eventos", f"{len(df):,}"],
        ["Colunas", len(df.columns)],
        ["Memória Usada", f"{df.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB"],
        ["Período", f"{df['dur'].min():.3f}s - {df['dur'].max():.3f}s"]
    ]
    print(tabulate(stats_data, headers=["Métrica", "Valor"], tablefmt="grid"))
    
    # Análise de anomalias
    if 'final_anomaly' in df.columns:
        print("\n🚨 ANÁLISE DE ANOMALIAS:")
        anomalies = df['final_anomaly'].sum()
        normal = len(df) - anomalies
        anomaly_rate = (anomalies / len(df)) * 100
        
        anomaly_data = [
            ["Eventos Normais", f"{normal:,} ({100-anomaly_rate:.1f}%)"],
            ["Eventos Anômalos", f"{anomalies:,} ({anomaly_rate:.1f}%)"],
            ["Taxa de Anomalia", f"{anomaly_rate:.2f}%"]
        ]
        print(tabulate(anomaly_data, headers=["Tipo", "Quantidade"], tablefmt="grid"))
    
    # Top protocolos
    if 'label' in df.columns:
        print("\n🌐 TOP PROTOCOLOS:")
        protocol_counts = df['label'].value_counts().head(10)
        protocol_data = []
        for protocol, count in protocol_counts.items():
            percentage = (count / len(df)) * 100
            protocol_data.append([protocol, f"{count:,}", f"{percentage:.1f}%"])
        print(tabulate(protocol_data, headers=["Protocolo", "Eventos", "%"], tablefmt="grid"))
    
    # Estatísticas de tráfego
    print("\n📊 ESTATÍSTICAS DE TRÁFEGO:")
    traffic_cols = ['spkts', 'dpkts', 'sbytes', 'dbytes', 'rate']
    traffic_data = []
    
    for col in traffic_cols:
        if col in df.columns:
            if 'bytes' in col:
                min_val = format_bytes(df[col].min())
                max_val = format_bytes(df[col].max())
                mean_val = format_bytes(df[col].mean())
            else:
                min_val = format_number(df[col].min())
                max_val = format_number(df[col].max())
                mean_val = format_number(df[col].mean())
            
            traffic_data.append([col.upper(), min_val, max_val, mean_val])
    
    print(tabulate(traffic_data, headers=["Métrica", "Mínimo", "Máximo", "Média"], tablefmt="grid"))
    
    # Amostra de dados
    print("\n🔍 AMOSTRA DE DADOS (primeiros 5 eventos):")
    
    # Selecionar colunas importantes para visualização
    important_cols = ['id', 'dur', 'spkts', 'dpkts', 'sbytes', 'dbytes', 'rate', 'label']
    available_cols = [col for col in important_cols if col in df.columns]
    
    sample_df = df[available_cols].head(5).copy()
    
    # Formatar para exibição
    if 'dur' in sample_df.columns:
        sample_df['dur'] = sample_df['dur'].apply(lambda x: f"{x:.3f}s")
    if 'sbytes' in sample_df.columns:
        sample_df['sbytes'] = sample_df['sbytes'].apply(format_bytes)
    if 'dbytes' in sample_df.columns:
        sample_df['dbytes'] = sample_df['dbytes'].apply(format_bytes)
    if 'rate' in sample_df.columns:
        sample_df['rate'] = sample_df['rate'].apply(format_number)
    
    print(tabulate(sample_df.values, headers=available_cols, tablefmt="grid", stralign="right"))
    
    # Informações de colunas
    print("\n📋 TODAS AS COLUNAS DISPONÍVEIS:")
    col_info = []
    for i, col in enumerate(df.columns, 1):
        dtype = str(df[col].dtype)
        non_null = df[col].count()
        null_count = df[col].isnull().sum()
        col_info.append([i, col, dtype, f"{non_null:,}", f"{null_count:,}"])
    
    print(tabulate(col_info, headers=["#", "Coluna", "Tipo", "Não Nulos", "Nulos"], tablefmt="grid"))
    
    print(f"\n✅ Análise concluída! Dataset: {len(df):,} eventos, {len(df.columns)} colunas")

if __name__ == "__main__":
    try:
        analyze_csv()
    except KeyboardInterrupt:
        print("\n⚠️ Análise interrompida pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro na análise: {e}")
        sys.exit(1)
