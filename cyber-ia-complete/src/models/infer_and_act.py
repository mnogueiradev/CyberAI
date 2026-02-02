#!/usr/bin/env python3
"""
Inferência + relatório + (opcional) ação (block)
- Carrega: models/isof.joblib  (dict {'model': clf, 'threshold': thresh})
         models/auto_model/ (Keras saved model + report.json with threshold)
- Lê features CSV (por src_ip)
- Gera reports/infer.json e reports/infer.csv
- Uso seguro: por padrão roda em --dry (não realiza bloqueios)
"""
import os
import json
import argparse
from pathlib import Path
import sys
import platform
import subprocess

import numpy as np
import pandas as pd
import joblib
import tensorflow as tf

def load_isof(path):
    obj = joblib.load(path)
    clf = obj.get('model', obj)  # backwards compat
    thresh = obj.get('threshold', None) if isinstance(obj, dict) else None
    return clf, thresh

def load_auto(path):
    # path is directory containing saved_model + report.json
    model = tf.keras.models.load_model(path)
    report_path = Path(path) / 'report.json'
    thresh = None
    if report_path.exists():
        with open(report_path, 'r') as f:
            report = json.load(f)
            thresh = report.get('threshold')
    return model, thresh

def compute_isof_score(clf, X):
    # scikit-learn IsolationForest: score_samples -> higher = more normal, but we use -score so larger = more anomalous
    raw = clf.score_samples(X)
    scores = -raw
    return scores

def compute_auto_mse(model, X):
    pred = model.predict(X, verbose=0)
    mse = np.mean((X - pred)**2, axis=1)
    return mse, pred

def explain_auto_errors(X_row, recon_row, columns, topk=3):
    # absolute reconstruction error per feature, return topk features and errors
    errors = np.abs(X_row - recon_row)
    idx = np.argsort(-errors)[:topk]
    return [(columns[i], float(errors[i])) for i in idx]

def attempt_block(ip, dry=True):
    """
    Attempt to block an IP on the host. This is potentially destructive: only run in lab.
    Behavior:
    - if dry: return the command that would be run
    - if not dry and linux: run iptables command (requires sudo)
    - otherwise: print warning and return
    """
    cmd = f"iptables -A INPUT -s {ip} -j DROP"
    if dry:
        return {"cmd": cmd, "executed": False, "note": "dry-run"}
    # only attempt to run on Linux
    if platform.system().lower() != 'linux':
        return {"cmd": cmd, "executed": False, "note": "blocking only supported on linux in this script"}
    try:
        # Requires privilege. Using subprocess.run for demonstration.
        res = subprocess.run(["sudo"] + cmd.split(), capture_output=True, text=True)
        ok = (res.returncode == 0)
        return {"cmd": cmd, "executed": ok, "stdout": res.stdout, "stderr": res.stderr, "returncode": res.returncode}
    except Exception as e:
        return {"cmd": cmd, "executed": False, "error": str(e)}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--features', required=True, help='CSV de features (por src_ip)')
    ap.add_argument('--isof', default='models/isof.joblib', help='caminho para IsolationForest (joblib)')
    ap.add_argument('--auto', default='models/auto_model', help='diretório do Autoencoder (saved model)')
    ap.add_argument('--out', default='reports/infer.json', help='arquivo JSON de saída')
    ap.add_argument('--outcsv', default='reports/infer.csv', help='arquivo CSV de saída')
    ap.add_argument('--dry', action='store_true', default=True, help='modo dry-run (padrão)')
    ap.add_argument('--block', action='store_true', help='executa bloqueios (APENAS EM LAB, exige --dry false)')
    ap.add_argument('--topk', type=int, default=3, help='top-K features explicativas para autoencoder')
    args = ap.parse_args()

    # Safety checks
    if args.block and args.dry:
        print("[warn] --block foi informado mas --dry está ativo por padrão. Para executar bloqueio real, execute sem --dry e com cuidado.")
    # Ensure reports dir
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.outcsv).parent.mkdir(parents=True, exist_ok=True)

    # Load features
    if not Path(args.features).exists():
        print("[error] features csv not found:", args.features)
        sys.exit(1)
    df = pd.read_csv(args.features)
    if 'src_ip' not in df.columns and 'src' in df.columns:
        df = df.rename(columns={'src':'src_ip'})
    if 'src_ip' not in df.columns:
        print("[error] CSV must contain a column 'src_ip' (or 'src'). Columns:", df.columns.tolist())
        sys.exit(1)

    number_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if len(number_cols) == 0:
        print("[error] no numeric features found in CSV. Need numeric columns for model input.")
        sys.exit(1)
    X = df[number_cols].fillna(0).values.astype('float32')

    # Load models
    if not Path(args.isof).exists():
        print("[error] IsolationForest model not found:", args.isof)
        sys.exit(1)
    isof_clf, isof_thresh = load_isof(args.isof)
    print(f"[ok] IsolationForest loaded. threshold={isof_thresh}")

    if not Path(args.auto).exists():
        print("[warn] Autoencoder model directory not found:", args.auto)
        auto_model = None
        auto_thresh = None
    else:
        auto_model, auto_thresh = load_auto(args.auto)
        print(f"[ok] Autoencoder loaded. threshold={auto_thresh}")

    # compute scores
    isof_scores = compute_isof_score(isof_clf, X)
    if auto_model is not None:
        auto_mse, auto_recon = compute_auto_mse(auto_model, X)
    else:
        auto_mse = np.zeros(len(isof_scores))
        auto_recon = np.zeros_like(X)

    # Determine flags (if threshold missing, use percentiles as fallback)
    if isof_thresh is None:
        isof_thresh = float(np.percentile(isof_scores, 95))
        print(f"[info] isof threshold not found; using 95th percentile -> {isof_thresh:.6f}")
    if auto_thresh is None:
        auto_thresh = float(np.percentile(auto_mse, 95)) if len(auto_mse)>0 else 0.0
        print(f"[info] auto threshold not found; using 95th percentile -> {auto_thresh:.6f}")

    isof_flag = (isof_scores >= isof_thresh).astype(int)
    auto_flag = (auto_mse >= auto_thresh).astype(int)

    # decision rule: flagged if either model marks it
    combined_flag = ((isof_flag==1) | (auto_flag==1)).astype(int)

    results = []
    for i, row in df.iterrows():
        src = row['src_ip']
        rec = {
            'src_ip': src,
            'isof_score': float(isof_scores[i]),
            'isof_flag': int(isof_flag[i]),
            'auto_mse': float(auto_mse[i]) if len(auto_mse)>0 else None,
            'auto_flag': int(auto_flag[i]) if len(auto_mse)>0 else None,
            'combined_flag': int(combined_flag[i])
        }

        # explanation: top-k features by reconstruction error if auto model present
        if auto_model is not None:
            expl = explain_auto_errors(X[i], auto_recon[i], number_cols, topk=args.topk)
            rec['auto_top_features'] = expl

        # action: prepare block command (dry-run) or attempt block
        if rec['combined_flag'] == 1:
            if args.block and not args.dry:
                # attempt block for real (only in linux)
                action_res = attempt_block(src, dry=False)
            else:
                action_res = attempt_block(src, dry=True)
            rec['action'] = action_res
        else:
            rec['action'] = {'cmd': None, 'executed': False, 'note': 'no action'}

        results.append(rec)

    # Save JSON and CSV
    out = {
        'summary': {
            'n_hosts': int(len(df)),
            'n_flagged': int(np.sum(combined_flag)),
            'isof_threshold': float(isof_thresh),
            'auto_threshold': float(auto_thresh)
        },
        'results': results
    }
    with open(args.out, 'w') as f:
        json.dump(out, f, indent=2)
    # CSV (flatten)
    rows_for_csv = []
    for r in results:
        flat = {
            'src_ip': r['src_ip'],
            'isof_score': r['isof_score'],
            'isof_flag': r['isof_flag'],
            'auto_mse': r['auto_mse'],
            'auto_flag': r['auto_flag'],
            'combined_flag': r['combined_flag'],
        }
        # keep action fields
        if r.get('action'):
            flat['action_cmd'] = r['action'].get('cmd')
            flat['action_executed'] = r['action'].get('executed', False)
            flat['action_note'] = r['action'].get('note', '')
        else:
            flat['action_cmd'] = None
            flat['action_executed'] = False
            flat['action_note'] = ''
        rows_for_csv.append(flat)
    pd.DataFrame(rows_for_csv).to_csv(args.outcsv, index=False)

    print(f"[ok] Inferência salva em: {args.out}")
    print(f"[ok] Inferência (csv) salva em: {args.outcsv}")
    print("Resumo:", out['summary'])
    if out['summary']['n_flagged'] > 0:
        print(f"[warning] {out['summary']['n_flagged']} hosts foram sinalizados. Verifique reports/infer.json para detalhes.")
    else:
        print("[ok] Nenhum host sinalizado.")

if __name__ == "__main__":
    main()
