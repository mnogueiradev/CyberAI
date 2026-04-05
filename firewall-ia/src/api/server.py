"""
FastAPI Backend Server for Firewall IA
Provides REST API for threat detection, model management, and firewall control
"""

import os
import json
import pickle
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np


# Initialize FastAPI app
app = FastAPI(
    title="Firewall IA API",
    description="AI-Powered Network Firewall with Snort Integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class IPBlockRequest(BaseModel):
    ip: str
    duration: int = 3600
    reason: str = "Manual Block"


class ThreatPrediction(BaseModel):
    ip: str
    is_threat: bool
    confidence: float
    attack_type: str
    timestamp: str


class AlertResponse(BaseModel):
    id: str
    timestamp: str
    src_ip: str
    dst_ip: str
    attack_type: str
    severity: str
    snort_rule: str


# Global state
model_data = None
blocked_ips = {}


def load_model():
    """Load trained ML model"""
    global model_data
    model_path = Path(os.getenv("MODEL_PATH", "/app/models/threat_detector.pkl"))
    
    if model_path.exists():
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            print(f"Model loaded from {model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")
            model_data = None
    else:
        print(f"Model file not found: {model_path}")
        model_data = None


def predict_threat(features: Dict) -> ThreatPrediction:
    """Make threat prediction using loaded model"""
    if model_data is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        model = model_data['model']
        scaler = model_data['scaler']
        feature_columns = model_data['feature_columns']
        
        # Prepare features
        X = np.array([[features.get(col, 0) for col in feature_columns]])
        X_scaled = scaler.transform(X)
        
        # Predict
        prediction = model.predict(X_scaled)[0]
        probability = model.predict_proba(X_scaled)[0][1]
        
        return ThreatPrediction(
            ip=features.get('src_ip', 'unknown'),
            is_threat=bool(prediction),
            confidence=float(probability),
            attack_type="ML_DETECTED",
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    load_model()
    
    # Create necessary directories
    Path("/app/data/raw").mkdir(parents=True, exist_ok=True)
    Path("/app/data/processed").mkdir(parents=True, exist_ok=True)
    Path("/app/reports").mkdir(parents=True, exist_ok=True)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Firewall IA API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            "/api/status",
            "/api/alerts",
            "/api/threats",
            "/api/predict",
            "/api/block",
            "/api/blocked",
            "/api/stats",
            "/api/train"
        ]
    }


@app.get("/api/status")
async def get_status():
    """Get system status"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": model_data is not None,
        "blocked_ips_count": len(blocked_ips),
        "uptime": "N/A"
    }


@app.get("/api/alerts")
async def get_alerts(limit: int = 100) -> List[Dict]:
    """Get recent Snort alerts"""
    alerts_path = Path("/data/raw/alerts_parsed.json")
    
    if not alerts_path.exists():
        return []
    
    try:
        with open(alerts_path, 'r') as f:
            data = json.load(f)
        
        alerts = data.get('alerts', [])[-limit:]
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading alerts: {str(e)}")


@app.get("/api/threats")
async def get_threats() -> Dict:
    """Get ML-detected threats"""
    reports_path = Path("/app/reports/detection_report.json")
    
    if not reports_path.exists():
        return {"threats": [], "total": 0}
    
    try:
        with open(reports_path, 'r') as f:
            data = json.load(f)
        
        return data
    except Exception:
        return {"threats": [], "total": 0}


@app.post("/api/predict", response_model=ThreatPrediction)
async def predict(features: Dict):
    """Predict if network traffic is malicious"""
    return predict_threat(features)


@app.post("/api/block")
async def block_ip(request: IPBlockRequest):
    """Manually block an IP address"""
    from src.firewall.blocker import FirewallController
    
    controller = FirewallController(dry_run=False)
    success = controller.block_ip(
        request.ip,
        request.duration,
        request.reason
    )
    
    if success:
        blocked_ips[request.ip] = {
            "blocked_at": datetime.now().isoformat(),
            "duration": request.duration,
            "reason": request.reason
        }
        return {"status": "success", "ip": request.ip, "action": "blocked"}
    else:
        raise HTTPException(status_code=400, detail="Failed to block IP")


@app.delete("/api/block/{ip}")
async def unblock_ip(ip: str):
    """Unblock an IP address"""
    from src.firewall.blocker import FirewallController
    
    controller = FirewallController(dry_run=False)
    success = controller.unblock_ip(ip)
    
    if success:
        if ip in blocked_ips:
            del blocked_ips[ip]
        return {"status": "success", "ip": ip, "action": "unblocked"}
    else:
        raise HTTPException(status_code=400, detail="Failed to unblock IP")


@app.get("/api/blocked")
async def get_blocked_ips():
    """Get list of blocked IPs"""
    from src.firewall.blocker import FirewallController
    
    controller = FirewallController(dry_run=False)
    return {"blocked_ips": controller.get_blocked_ips()}


@app.get("/api/stats")
async def get_stats():
    """Get system statistics"""
    from src.firewall.blocker import FirewallController
    
    stats = {
        "timestamp": datetime.now().isoformat(),
        "model": {
            "loaded": model_data is not None,
            "type": model_data.get('model_type', 'unknown') if model_data else None
        },
        "firewall": {},
        "alerts": {}
    }
    
    # Firewall stats
    try:
        controller = FirewallController(dry_run=True)
        stats["firewall"] = controller.get_statistics()
    except Exception:
        pass
    
    # Alert stats
    alerts_path = Path("/data/raw/alerts_parsed.json")
    if alerts_path.exists():
        try:
            with open(alerts_path, 'r') as f:
                data = json.load(f)
            alerts = data.get('alerts', [])
            
            attack_types = {}
            for alert in alerts:
                at = alert.get('attack_type', 'UNKNOWN')
                attack_types[at] = attack_types.get(at, 0) + 1
            
            stats["alerts"] = {
                "total": len(alerts),
                "attack_types": attack_types
            }
        except Exception:
            pass
    
    return stats


@app.post("/api/train")
async def train_model(background_tasks: BackgroundTasks):
    """Trigger model retraining"""
    def run_training():
        try:
            from src.train.train_model import train_pipeline
            metrics = train_pipeline()
            
            # Save training report
            report_path = Path("/app/reports/training_report.json")
            report_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(report_path, 'w') as f:
                json.dump(metrics, f, indent=2)
            
            # Reload model
            load_model()
            
        except Exception as e:
            print(f"Training failed: {e}")
    
    background_tasks.add_task(run_training)
    
    return {
        "status": "training_started",
        "message": "Model training initiated in background"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
