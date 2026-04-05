"""
Snort Alert Parser - Ingest module for Firewall IA
Parses Snort alerts and converts them to structured data for ML training
"""

import json
import re
import os
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path


class SnortAlertParser:
    """Parse Snort alert logs into structured format for ML processing"""
    
    # Regex pattern for Snort alert format
    ALERT_PATTERN = re.compile(
        r'\*\*\s*\[\*\*]\s*\[(\d+):(\d+):(\d+)\]\s*(.*?)\s*\[\*\*]\s*\[\*\*]\s*'
        r'Classification:\s*(.*?)\s*\[\*\*]\s*\[\*\*]\s*'
        r'Priority:\s*(\d+)\s*\[\*\*]\s*'
        r'(\d{2}/\d{2}-\d{2}:\d{2}:\d{2}\.\d+)\s*'
        r'([\d\.]+):(\d+)\s*->\s*([\d\.]+):(\d+)'
    )
    
    # Alternative pattern for CSV output
    CSV_ALERT_PATTERN = re.compile(
        r'^(\d{2}/\d{2}-\d{2}:\d{2}:\d{2}\.\d+),?'
        r'.*?,?([\d\.]+),?(\d+),?([\d\.]+),?(\d+),'
        r'.*?,?"?(.*?)"?,?.*?,?(\d+)'
    )
    
    def __init__(self, 
                 snort_log_path: str = "/var/log/snort/alerts.csv",
                 output_path: str = "/data/raw/alerts_parsed.json"):
        self.snort_log_path = Path(snort_log_path)
        self.output_path = Path(output_path)
        self.parsed_alerts: List[Dict] = []
        self.last_position = 0
        
    def parse_alert_line(self, line: str) -> Optional[Dict]:
        """Parse a single Snort alert line"""
        line = line.strip()
        if not line or line.startswith('#'):
            return None
            
        alert = {
            'timestamp': datetime.now().isoformat(),
            'raw_message': line,
            'signature_id': None,
            'generator_id': None,
            'revision': None,
            'message': None,
            'classification': None,
            'priority': None,
            'src_ip': None,
            'src_port': None,
            'dst_ip': None,
            'dst_port': None,
            'protocol': None,
            'attack_type': None,
            'severity': None
        }
        
        # Try standard alert format
        match = self.ALERT_PATTERN.search(line)
        if match:
            alert.update({
                'generator_id': int(match.group(1)),
                'signature_id': int(match.group(2)),
                'revision': int(match.group(3)),
                'message': match.group(4).strip(),
                'classification': match.group(5).strip(),
                'priority': int(match.group(6)),
                'timestamp': match.group(10),
                'src_ip': match.group(11),
                'src_port': int(match.group(12)),
                'dst_ip': match.group(13),
                'dst_port': int(match.group(14))
            })
            
            # Infer protocol from ports and message
            alert['protocol'] = self._infer_protocol(alert)
            alert['attack_type'] = self._classify_attack(alert['message'])
            alert['severity'] = self._calculate_severity(alert)
            
            return alert
        
        # Try CSV format
        match = self.CSV_ALERT_PATTERN.search(line)
        if match:
            alert.update({
                'timestamp': match.group(1),
                'src_ip': match.group(2),
                'src_port': int(match.group(3)),
                'dst_ip': match.group(4),
                'dst_port': int(match.group(5)),
                'message': match.group(6),
                'priority': int(match.group(7))
            })
            alert['protocol'] = self._infer_protocol(alert)
            alert['attack_type'] = self._classify_attack(alert['message'])
            alert['severity'] = self._calculate_severity(alert)
            
            return alert
        
        # Simple fallback parsing
        if '->' in line:
            try:
                parts = line.split('->')
                if len(parts) >= 2:
                    src_parts = parts[0].strip().split(':')
                    dst_parts = parts[1].strip().split(':')
                    
                    alert['src_ip'] = src_parts[0].strip() if src_parts else None
                    alert['src_port'] = int(src_parts[1].strip()) if len(src_parts) > 1 else None
                    alert['dst_ip'] = dst_parts[0].strip() if dst_parts else None
                    alert['dst_port'] = int(dst_parts[1].strip()) if len(dst_parts) > 1 else None
                    
                    # Extract message if present
                    if '[' in line and ']' in line:
                        msg_match = re.search(r'\[(.*?)\]', line)
                        if msg_match:
                            alert['message'] = msg_match.group(1)
                    
                    alert['protocol'] = self._infer_protocol(alert)
                    alert['attack_type'] = self._classify_attack(alert.get('message', ''))
                    alert['severity'] = self._calculate_severity(alert)
                    
                    return alert
            except Exception:
                pass
        
        return None
    
    def _infer_protocol(self, alert: Dict) -> str:
        """Infer protocol from port numbers and message"""
        message = (alert.get('message', '') or '').lower()
        src_port = alert.get('src_port')
        dst_port = alert.get('dst_port')
        
        # Check common ports
        if dst_port == 80 or dst_port == 8080 or 'http' in message:
            return 'TCP/HTTP'
        elif dst_port == 443 or 'https' in message or 'ssl' in message:
            return 'TCP/HTTPS'
        elif dst_port == 22 or 'ssh' in message:
            return 'TCP/SSH'
        elif dst_port == 21 or 'ftp' in message:
            return 'TCP/FTP'
        elif dst_port == 23 or 'telnet' in message:
            return 'TCP/Telnet'
        elif dst_port == 25 or dst_port == 587 or 'smtp' in message:
            return 'TCP/SMTP'
        elif dst_port == 53 or 'dns' in message:
            return 'UDP/DNS'
        elif dst_port == 3306 or 'mysql' in message:
            return 'TCP/MySQL'
        elif dst_port == 3389 or 'rdp' in message:
            return 'TCP/RDP'
        elif dst_port == 445 or 'smb' in message:
            return 'TCP/SMB'
        elif dst_port == 161 or 'snmp' in message:
            return 'UDP/SNMP'
        elif 'icmp' in message:
            return 'ICMP'
        elif 'udp' in message:
            return 'UDP'
        elif 'tcp' in message:
            return 'TCP'
        
        return 'TCP'  # Default
    
    def _classify_attack(self, message: str) -> str:
        """Classify attack type from message"""
        message = (message or '').upper()
        
        if 'PORT_SCAN' in message or 'SCAN' in message:
            return 'RECONNAISSANCE'
        elif 'BRUTE_FORCE' in message or 'BRUTEFORCE' in message:
            return 'BRUTE_FORCE'
        elif 'DDOS' in message or 'FLOOD' in message:
            return 'DDOS'
        elif 'MALWARE' in message or 'TROJAN' in message:
            return 'MALWARE'
        elif 'EXPLOIT' in message or 'INJECTION' in message or 'RCE' in message:
            return 'EXPLOIT'
        elif 'SQL' in message:
            return 'SQL_INJECTION'
        elif 'XSS' in message:
            return 'XSS'
        elif 'EXFIL' in message or 'TUNNELING' in message:
            return 'DATA_EXFILTRATION'
        elif 'RECON' in message or 'ENUMERATION' in message:
            return 'RECONNAISSANCE'
        elif 'ANOMALY' in message or 'INVALID' in message:
            return 'PROTOCOL_ANOMALY'
        elif 'SHELL' in message or 'PAYLOAD' in message:
            return 'MALWARE'
        
        return 'UNKNOWN'
    
    def _calculate_severity(self, alert: Dict) -> str:
        """Calculate severity based on priority and classification"""
        priority = alert.get('priority', 3)
        
        if priority == 1:
            return 'CRITICAL'
        elif priority == 2:
            return 'HIGH'
        elif priority == 3:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def parse_file(self, file_path: Optional[str] = None) -> List[Dict]:
        """Parse entire Snort alert file"""
        path = Path(file_path) if file_path else self.snort_log_path
        
        if not path.exists():
            print(f"Warning: Snort log file not found: {path}")
            return []
        
        alerts = []
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                alert = self.parse_alert_line(line)
                if alert:
                    alerts.append(alert)
        
        self.parsed_alerts = alerts
        return alerts
    
    def parse_new_alerts(self) -> List[Dict]:
        """Parse only new alerts since last read position"""
        path = self.snort_log_path
        
        if not path.exists():
            return []
        
        new_alerts = []
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            f.seek(self.last_position)
            for line in f:
                alert = self.parse_alert_line(line)
                if alert:
                    new_alerts.append(alert)
            self.last_position = f.tell()
        
        if new_alerts:
            self.parsed_alerts.extend(new_alerts)
            self.save_alerts()
        
        return new_alerts
    
    def save_alerts(self, output_path: Optional[str] = None):
        """Save parsed alerts to JSON file"""
        path = Path(output_path) if output_path else self.output_path
        path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(path, 'w') as f:
            json.dump({
                'alerts': self.parsed_alerts,
                'total_count': len(self.parsed_alerts),
                'last_updated': datetime.now().isoformat()
            }, f, indent=2)
        
        print(f"Saved {len(self.parsed_alerts)} alerts to {path}")
    
    def get_alert_summary(self) -> Dict:
        """Get summary statistics of parsed alerts"""
        if not self.parsed_alerts:
            return {'total': 0}
        
        attack_types = {}
        severities = {}
        src_ips = set()
        dst_ips = set()
        
        for alert in self.parsed_alerts:
            attack_type = alert.get('attack_type', 'UNKNOWN')
            severity = alert.get('severity', 'UNKNOWN')
            
            attack_types[attack_type] = attack_types.get(attack_type, 0) + 1
            severities[severity] = severities.get(severity, 0) + 1
            
            if alert.get('src_ip'):
                src_ips.add(alert['src_ip'])
            if alert.get('dst_ip'):
                dst_ips.add(alert['dst_ip'])
        
        return {
            'total': len(self.parsed_alerts),
            'attack_types': attack_types,
            'severities': severities,
            'unique_src_ips': len(src_ips),
            'unique_dst_ips': len(dst_ips),
            'top_sources': list(src_ips)[:10]
        }


def main():
    """Main entry point for standalone execution"""
    parser = SnortAlertParser()
    
    # Parse existing alerts
    alerts = parser.parse_file()
    print(f"Parsed {len(alerts)} alerts")
    
    # Save to output file
    parser.save_alerts()
    
    # Print summary
    summary = parser.get_alert_summary()
    print(f"\nAlert Summary:")
    print(f"  Total: {summary.get('total', 0)}")
    print(f"  Attack Types: {summary.get('attack_types', {})}")
    print(f"  Severities: {summary.get('severities', {})}")


if __name__ == "__main__":
    main()
