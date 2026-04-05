"""
Feature Extractor - Preprocess module for Firewall IA
Extracts ML features from parsed Snort alerts for model training
"""

import json
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from collections import defaultdict


class FeatureExtractor:
    """Extract machine learning features from Snort alerts"""
    
    def __init__(self, 
                 input_path: str = "/data/raw/alerts_parsed.json",
                 output_path: str = "/data/processed/features.csv"):
        self.input_path = Path(input_path)
        self.output_path = Path(output_path)
        self.features_df = None
        
    def load_alerts(self) -> List[Dict]:
        """Load parsed alerts from JSON file"""
        if not self.input_path.exists():
            print(f"Warning: Input file not found: {self.input_path}")
            return []
        
        with open(self.input_path, 'r') as f:
            data = json.load(f)
        
        return data.get('alerts', [])
    
    def ip_to_numeric(self, ip: str) -> int:
        """Convert IP address to numeric value"""
        if not ip:
            return 0
        try:
            parts = ip.split('.')
            if len(parts) != 4:
                return 0
            return sum(int(part) << (8 * (3 - i)) for i, part in enumerate(parts))
        except Exception:
            return 0
    
    def extract_time_features(self, timestamp: str) -> Dict:
        """Extract time-based features from timestamp"""
        try:
            # Try different timestamp formats
            for fmt in ['%m/%d-%H:%M:%S.%f', '%Y-%m-%dT%H:%M:%S.%f', '%Y-%m-%d %H:%M:%S']:
                try:
                    dt = datetime.strptime(timestamp.split('.')[0], fmt.split('.')[0])
                    break
                except ValueError:
                    continue
            else:
                dt = datetime.now()
            
            return {
                'hour': dt.hour,
                'minute': dt.minute,
                'day_of_week': dt.weekday(),
                'is_weekend': 1 if dt.weekday() >= 5 else 0,
                'is_night': 1 if dt.hour < 6 or dt.hour > 22 else 0
            }
        except Exception:
            return {
                'hour': 0,
                'minute': 0,
                'day_of_week': 0,
                'is_weekend': 0,
                'is_night': 0
            }
    
    def encode_attack_type(self, attack_type: str) -> int:
        """Encode attack type as numeric value"""
        attack_types = {
            'RECONNAISSANCE': 1,
            'BRUTE_FORCE': 2,
            'DDOS': 3,
            'MALWARE': 4,
            'EXPLOIT': 5,
            'SQL_INJECTION': 6,
            'XSS': 7,
            'DATA_EXFILTRATION': 8,
            'PROTOCOL_ANOMALY': 9,
            'UNKNOWN': 0
        }
        return attack_types.get(attack_type, 0)
    
    def encode_severity(self, severity: str) -> int:
        """Encode severity as numeric value"""
        severities = {
            'CRITICAL': 4,
            'HIGH': 3,
            'MEDIUM': 2,
            'LOW': 1,
            'UNKNOWN': 0
        }
        return severities.get(severity, 0)
    
    def encode_protocol(self, protocol: str) -> int:
        """Encode protocol as numeric value"""
        protocols = {
            'TCP/HTTP': 1,
            'TCP/HTTPS': 2,
            'TCP/SSH': 3,
            'TCP/FTP': 4,
            'TCP/Telnet': 5,
            'TCP/SMTP': 6,
            'UDP/DNS': 7,
            'TCP/MySQL': 8,
            'TCP/RDP': 9,
            'TCP/SMB': 10,
            'UDP/SNMP': 11,
            'ICMP': 12,
            'UDP': 13,
            'TCP': 14,
            'UNKNOWN': 0
        }
        return protocols.get(protocol, 0)
    
    def extract_features_from_alert(self, alert: Dict) -> Dict:
        """Extract all features from a single alert"""
        features = {}
        
        # Basic alert features
        features['signature_id'] = alert.get('signature_id', 0) or 0
        features['generator_id'] = alert.get('generator_id', 0) or 0
        features['revision'] = alert.get('revision', 1) or 1
        features['priority'] = alert.get('priority', 3) or 3
        
        # IP features
        src_ip = alert.get('src_ip', '')
        dst_ip = alert.get('dst_ip', '')
        features['src_ip_numeric'] = self.ip_to_numeric(src_ip)
        features['dst_ip_numeric'] = self.ip_to_numeric(dst_ip)
        
        # Check if private IP
        features['src_is_private'] = self._is_private_ip(src_ip)
        features['dst_is_private'] = self._is_private_ip(dst_ip)
        
        # Port features
        src_port = alert.get('src_port', 0) or 0
        dst_port = alert.get('dst_port', 0) or 0
        features['src_port'] = src_port
        features['dst_port'] = dst_port
        features['is_well_known_port'] = 1 if dst_port < 1024 else 0
        features['is_registered_port'] = 1 if 1024 <= dst_port <= 49151 else 0
        
        # Protocol encoding
        features['protocol_encoded'] = self.encode_protocol(alert.get('protocol', ''))
        
        # Attack type encoding
        features['attack_type_encoded'] = self.encode_attack_type(alert.get('attack_type', ''))
        
        # Severity encoding
        features['severity_encoded'] = self.encode_severity(alert.get('severity', ''))
        
        # Time features
        time_features = self.extract_time_features(alert.get('timestamp', ''))
        features.update(time_features)
        
        # Message length feature
        message = alert.get('message', '') or alert.get('raw_message', '')
        features['message_length'] = len(message) if message else 0
        
        # Label: 1 if malicious (most Snort alerts are), 0 otherwise
        features['label'] = 1 if alert.get('priority', 3) <= 3 else 0
        
        return features
    
    def _is_private_ip(self, ip: str) -> int:
        """Check if IP is in private range"""
        if not ip:
            return 0
        try:
            parts = [int(p) for p in ip.split('.')]
            if len(parts) != 4:
                return 0
            
            # 10.0.0.0/8
            if parts[0] == 10:
                return 1
            # 172.16.0.0/12
            if parts[0] == 172 and 16 <= parts[1] <= 31:
                return 1
            # 192.168.0.0/16
            if parts[0] == 192 and parts[1] == 168:
                return 1
            # 127.0.0.0/8 (localhost)
            if parts[0] == 127:
                return 1
            
            return 0
        except Exception:
            return 0
    
    def aggregate_flow_features(self, alerts: List[Dict]) -> pd.DataFrame:
        """Aggregate features by source IP (flow-level features)"""
        ip_stats = defaultdict(lambda: {
            'alert_count': 0,
            'unique_dst_ips': set(),
            'unique_dst_ports': set(),
            'attack_types': set(),
            'total_priority': 0,
            'timestamps': []
        })
        
        for alert in alerts:
            src_ip = alert.get('src_ip', '')
            if not src_ip:
                continue
            
            stats = ip_stats[src_ip]
            stats['alert_count'] += 1
            if alert.get('dst_ip'):
                stats['unique_dst_ips'].add(alert['dst_ip'])
            if alert.get('dst_port'):
                stats['unique_dst_ports'].add(alert['dst_port'])
            if alert.get('attack_type'):
                stats['attack_types'].add(alert['attack_type'])
            stats['total_priority'] += alert.get('priority', 3)
            stats['timestamps'].append(alert.get('timestamp', ''))
        
        aggregated = []
        for src_ip, stats in ip_stats.items():
            row = {
                'src_ip': src_ip,
                'src_ip_numeric': self.ip_to_numeric(src_ip),
                'alert_count': stats['alert_count'],
                'unique_dst_count': len(stats['unique_dst_ips']),
                'unique_port_count': len(stats['unique_dst_ports']),
                'attack_type_diversity': len(stats['attack_types']),
                'avg_priority': stats['total_priority'] / max(stats['alert_count'], 1),
                'is_scanner': 1 if len(stats['unique_dst_ports']) > 10 else 0,
                'is_brute_forcer': 1 if len(stats['unique_dst_ports']) <= 2 and stats['alert_count'] > 5 else 0
            }
            aggregated.append(row)
        
        return pd.DataFrame(aggregated)
    
    def extract_all_features(self) -> pd.DataFrame:
        """Extract features from all alerts"""
        alerts = self.load_alerts()
        
        if not alerts:
            print("No alerts to process")
            return pd.DataFrame()
        
        # Extract features from each alert
        features_list = [self.extract_features_from_alert(alert) for alert in alerts]
        self.features_df = pd.DataFrame(features_list)
        
        print(f"Extracted features for {len(self.features_df)} alerts")
        print(f"Features: {list(self.features_df.columns)}")
        
        return self.features_df
    
    def save_features(self, output_path: Optional[str] = None):
        """Save extracted features to CSV"""
        if self.features_df is None or self.features_df.empty:
            print("No features to save")
            return
        
        path = Path(output_path) if output_path else self.output_path
        path.parent.mkdir(parents=True, exist_ok=True)
        
        self.features_df.to_csv(path, index=False)
        print(f"Saved features to {path}")
    
    def get_feature_statistics(self) -> Dict:
        """Get statistics about extracted features"""
        if self.features_df is None or self.features_df.empty:
            return {}
        
        return {
            'total_samples': len(self.features_df),
            'total_features': len(self.features_df.columns),
            'malicious_samples': int((self.features_df['label'] == 1).sum()),
            'benign_samples': int((self.features_df['label'] == 0).sum()),
            'malware_ratio': float((self.features_df['label'] == 1).mean()),
            'feature_names': list(self.features_df.columns),
            'numeric_stats': self.features_df.describe().to_dict()
        }


def main():
    """Main entry point for standalone execution"""
    extractor = FeatureExtractor()
    
    # Extract features
    features_df = extractor.extract_all_features()
    
    if not features_df.empty:
        # Save features
        extractor.save_features()
        
        # Print statistics
        stats = extractor.get_feature_statistics()
        print(f"\nFeature Statistics:")
        print(f"  Total samples: {stats.get('total_samples', 0)}")
        print(f"  Total features: {stats.get('total_features', 0)}")
        print(f"  Malicious samples: {stats.get('malicious_samples', 0)}")
        print(f"  Benign samples: {stats.get('benign_samples', 0)}")
        print(f"  Malware ratio: {stats.get('malware_ratio', 0):.2%}")


if __name__ == "__main__":
    main()
