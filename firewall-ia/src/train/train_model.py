"""
Model Training - Train module for Firewall IA
Trains ML models on Snort alert features for threat detection
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pathlib import Path

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, 
    f1_score, roc_auc_score, confusion_matrix,
    classification_report
)
from imblearn.over_sampling import SMOTE


class ThreatDetectorTrainer:
    """Train ML models for threat detection"""
    
    def __init__(self,
                 data_path: str = "/data/processed/features.csv",
                 model_path: str = "/models/threat_detector.pkl",
                 model_type: str = "random_forest"):
        self.data_path = Path(data_path)
        self.model_path = Path(model_path)
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = None
        
    def load_data(self) -> pd.DataFrame:
        """Load feature data from CSV"""
        if not self.data_path.exists():
            raise FileNotFoundError(f"Data file not found: {self.data_path}")
        
        df = pd.read_csv(self.data_path)
        print(f"Loaded {len(df)} samples with {len(df.columns)} features")
        
        return df
    
    def prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare data for training"""
        # Separate features and label
        if 'label' not in df.columns:
            raise ValueError("No 'label' column found in data")
        
        # Select feature columns (exclude non-feature columns)
        exclude_cols = ['label']
        self.feature_columns = [col for col in df.columns if col not in exclude_cols]
        
        X = df[self.feature_columns].values
        y = df['label'].values
        
        # Handle missing values
        X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
        
        return X, y
    
    def train_model(self, X: np.ndarray, y: np.ndarray) -> Dict:
        """Train the ML model"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Handle class imbalance with SMOTE
        try:
            smote = SMOTE(random_state=42)
            X_train_balanced, y_train_balanced = smote.fit_resample(X_train_scaled, y_train)
            print(f"After SMOTE: {len(X_train_balanced)} samples")
        except Exception as e:
            print(f"SMOTE failed, using original data: {e}")
            X_train_balanced, y_train_balanced = X_train_scaled, y_train
        
        # Create model based on type
        if self.model_type == "random_forest":
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                class_weight='balanced',
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == "gradient_boosting":
            self.model = GradientBoostingClassifier(
                n_estimators=100,
                max_depth=10,
                learning_rate=0.1,
                random_state=42
            )
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
        
        # Train model
        print(f"Training {self.model_type} model...")
        self.model.fit(X_train_balanced, y_train_balanced)
        
        # Evaluate on test set
        y_pred = self.model.predict(X_test_scaled)
        y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
        
        # Calculate metrics
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1_score': f1_score(y_test, y_pred),
            'roc_auc': roc_auc_score(y_test, y_pred_proba),
            'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
            'classification_report': classification_report(y_test, y_pred)
        }
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_train_balanced, y_train_balanced, cv=5)
        metrics['cv_mean'] = cv_scores.mean()
        metrics['cv_std'] = cv_scores.std()
        
        print("\n=== Model Performance ===")
        print(f"Accuracy: {metrics['accuracy']:.4f}")
        print(f"Precision: {metrics['precision']:.4f}")
        print(f"Recall: {metrics['recall']:.4f}")
        print(f"F1 Score: {metrics['f1_score']:.4f}")
        print(f"ROC AUC: {metrics['roc_auc']:.4f}")
        print(f"CV Mean: {metrics['cv_mean']:.4f} (+/- {metrics['cv_std']:.4f})")
        print("\nClassification Report:")
        print(metrics['classification_report'])
        
        return metrics
    
    def save_model(self):
        """Save trained model to disk"""
        if self.model is None:
            raise ValueError("No model to save")
        
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'model_type': self.model_type,
            'trained_at': datetime.now().isoformat()
        }
        
        with open(self.model_path, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"Model saved to {self.model_path}")
    
    def load_model(self):
        """Load trained model from disk"""
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        
        with open(self.model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_columns = model_data['feature_columns']
        self.model_type = model_data.get('model_type', 'random_forest')
        
        print(f"Model loaded from {self.model_path}")
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance from trained model"""
        if self.model is None or self.feature_columns is None:
            return {}
        
        if hasattr(self.model, 'feature_importances_'):
            importance = dict(zip(
                self.feature_columns,
                self.model.feature_importances_
            ))
            # Sort by importance
            importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))
            return importance
        
        return {}


def train_pipeline(
    data_path: str = "/data/processed/features.csv",
    model_path: str = "/models/threat_detector.pkl",
    model_type: str = "random_forest"
) -> Dict:
    """Complete training pipeline"""
    trainer = ThreatDetectorTrainer(
        data_path=data_path,
        model_path=model_path,
        model_type=model_type
    )
    
    # Load and prepare data
    df = trainer.load_data()
    X, y = trainer.prepare_data(df)
    
    # Train model
    metrics = trainer.train_model(X, y)
    
    # Save model
    trainer.save_model()
    
    # Get feature importance
    importance = trainer.get_feature_importance()
    metrics['feature_importance'] = dict(list(importance.items())[:10])  # Top 10
    
    # Save training report
    report_path = Path(model_path).parent / "training_report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    report = {
        'metrics': {k: float(v) if isinstance(v, (float, np.floating)) else v 
                   for k, v in metrics.items() if k != 'classification_report'},
        'feature_importance': importance,
        'model_type': model_type,
        'trained_at': datetime.now().isoformat(),
        'data_path': str(data_path)
    }
    
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\nTraining report saved to {report_path}")
    
    return metrics


def main():
    """Main entry point for standalone execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Train threat detection model')
    parser.add_argument('--data', default='/data/processed/features.csv',
                       help='Path to feature data CSV')
    parser.add_argument('--output', default='/models/threat_detector.pkl',
                       help='Path to save model')
    parser.add_argument('--model-type', default='random_forest',
                       choices=['random_forest', 'gradient_boosting'],
                       help='Type of model to train')
    
    args = parser.parse_args()
    
    metrics = train_pipeline(
        data_path=args.data,
        model_path=args.output,
        model_type=args.model_type
    )
    
    print("\n=== Training Complete ===")
    print(f"Model saved to: {args.output}")
    print(f"Best F1 Score: {metrics['f1_score']:.4f}")
    print(f"Best ROC AUC: {metrics['roc_auc']:.4f}")


if __name__ == "__main__":
    main()
