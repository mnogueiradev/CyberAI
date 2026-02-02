#!/usr/bin/env python3
"""
API de integração da IA de Cibersegurança
-----------------------------------------
Lê o relatório gerado pela IA (reports/infer.json)
e disponibiliza endpoints REST para o front-end.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json

# Caminho do relatório
REPORT_PATH = Path("reports/infer.json")

app = FastAPI(
    title="Cyber IA Security API",
    description="API para integração do sistema de IA com o painel de monitoramento",
    version="1.0.0"
)

# Permitir acesso de qualquer origem (para testes de front-end)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_report():
    """Lê o arquivo infer.json"""
    if not REPORT_PATH.exists():
        raise HTTPException(status_code=404, detail="Relatório não encontrado. Execute a inferência primeiro.")
    with open(REPORT_PATH, "r") as f:
        return json.load(f)

@app.get("/")
def root():
    return {"message": "API da Cyber IA funcionando!", "endpoints": ["/summary", "/results", "/host/{ip}"]}

@app.get("/summary")
def get_summary():
    """Resumo geral da análise"""
    report = load_report()
    return report.get("summary", {})

@app.get("/results")
def get_results():
    """Lista completa de hosts analisados"""
    report = load_report()
    return report.get("results", [])

@app.get("/host/{ip}")
def get_host(ip: str):
    """Busca informações detalhadas de um IP específico"""
    report = load_report()
    for r in report.get("results", []):
        if r["src_ip"] == ip:
            return r
    raise HTTPException(status_code=404, detail=f"Host {ip} não encontrado no relatório")

@app.get("/alerts")
def get_alerts():
    """Retorna apenas os hosts sinalizados como suspeitos"""
    report = load_report()
    alerts = [r for r in report.get("results", []) if r.get("combined_flag") == 1]
    return {
        "total_alerts": len(alerts),
        "alerts": alerts
    }
