"""
Firewall Blocker - Firewall module for Firewall IA
Manages iptables rules based on ML threat predictions
"""

import os
import json
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
from pathlib import Path


class FirewallController:
    """Control iptables firewall based on ML predictions"""
    
    CHAIN_NAME = "FIREWALL_IA"
    BLOCK_DURATION_DEFAULT = 3600  # 1 hour
    
    def __init__(self, 
                 blocked_ips_path: str = "/app/data/blocked_ips",
                 dry_run: bool = False):
        self.blocked_ips_path = Path(blocked_ips_path)
        self.dry_run = dry_run
        self.blocked_ips: Dict[str, datetime] = {}
        
        # Initialize firewall chain
        self._init_chain()
        
    def _run_iptables(self, args: List[str], check: bool = True) -> subprocess.CompletedProcess:
        """Run iptables command"""
        cmd = ["iptables"] + args
        
        if self.dry_run:
            print(f"[DRY RUN] Would execute: {' '.join(cmd)}")
            return subprocess.CompletedProcess(cmd, 0, "", "")
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=check
            )
            return result
        except subprocess.CalledProcessError as e:
            print(f"iptables error: {e.stderr}")
            raise
    
    def _init_chain(self):
        """Initialize custom iptables chain"""
        try:
            # Flush existing chain if exists
            self._run_iptables(["-F", self.CHAIN_NAME], check=False)
            
            # Delete chain if exists
            self._run_iptables(["-X", self.CHAIN_NAME], check=False)
            
            # Create new chain
            self._run_iptables(["-N", self.CHAIN_NAME])
            
            # Add jump from INPUT chain
            self._run_iptables(
                ["-I", "INPUT", "1", "-j", self.CHAIN_NAME],
                check=False
            )
            
            # Add jump from FORWARD chain
            self._run_iptables(
                ["-I", "FORWARD", "1", "-j", self.CHAIN_NAME],
                check=False
            )
            
            print(f"Initialized iptables chain: {self.CHAIN_NAME}")
            
        except Exception as e:
            print(f"Warning: Could not initialize chain: {e}")
    
    def block_ip(self, ip: str, duration: int = None, reason: str = "ML Detection") -> bool:
        """Block an IP address"""
        if not self._is_valid_ip(ip):
            print(f"Invalid IP address: {ip}")
            return False
        
        if duration is None:
            duration = self.BLOCK_DURATION_DEFAULT
        
        expiry = datetime.now() + timedelta(seconds=duration)
        
        try:
            # Add DROP rule for this IP
            self._run_iptables([
                "-A", self.CHAIN_NAME,
                "-s", ip,
                "-j", "DROP",
                "-m", "comment",
                "--comment", f"FirewallIA-{reason}"
            ])
            
            # Record blocked IP
            self.blocked_ips[ip] = expiry
            self._save_blocked_ips()
            
            print(f"Blocked IP: {ip} until {expiry} ({reason})")
            return True
            
        except Exception as e:
            print(f"Failed to block IP {ip}: {e}")
            return False
    
    def unblock_ip(self, ip: str) -> bool:
        """Unblock an IP address"""
        if not self._is_valid_ip(ip):
            return False
        
        try:
            # Remove DROP rule for this IP
            self._run_iptables([
                "-D", self.CHAIN_NAME,
                "-s", ip,
                "-j", "DROP"
            ], check=False)
            
            # Remove from tracking
            if ip in self.blocked_ips:
                del self.blocked_ips[ip]
            self._save_blocked_ips()
            
            print(f"Unblocked IP: {ip}")
            return True
            
        except Exception as e:
            print(f"Failed to unblock IP {ip}: {e}")
            return False
    
    def _is_valid_ip(self, ip: str) -> bool:
        """Validate IP address format"""
        import re
        pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
        if not re.match(pattern, ip):
            return False
        
        # Check each octet
        parts = ip.split('.')
        return all(0 <= int(part) <= 255 for part in parts)
    
    def _save_blocked_ips(self):
        """Save blocked IPs to file"""
        self.blocked_ips_path.parent.mkdir(parents=True, exist_ok=True)
        
        data = {
            'blocked_ips': {
                ip: expiry.isoformat()
                for ip, expiry in self.blocked_ips.items()
            },
            'last_updated': datetime.now().isoformat()
        }
        
        with open(self.blocked_ips_path / "blocked.json", 'w') as f:
            json.dump(data, f, indent=2)
    
    def _load_blocked_ips(self):
        """Load blocked IPs from file"""
        path = self.blocked_ips_path / "blocked.json"
        if not path.exists():
            return
        
        try:
            with open(path, 'r') as f:
                data = json.load(f)
            
            self.blocked_ips = {
                ip: datetime.fromisoformat(expiry)
                for ip, expiry in data.get('blocked_ips', {}).items()
            }
        except Exception as e:
            print(f"Error loading blocked IPs: {e}")
    
    def cleanup_expired_blocks(self) -> int:
        """Remove expired IP blocks"""
        self._load_blocked_ips()
        
        now = datetime.now()
        expired = [
            ip for ip, expiry in self.blocked_ips.items()
            if expiry <= now
        ]
        
        removed_count = 0
        for ip in expired:
            if self.unblock_ip(ip):
                removed_count += 1
        
        if removed_count > 0:
            print(f"Cleaned up {removed_count} expired blocks")
        
        return removed_count
    
    def sync_rules(self):
        """Sync firewall rules with current state"""
        # Cleanup expired blocks
        self.cleanup_expired_blocks()
        
        # Ensure chain exists
        self._init_chain()
        
        # Reload blocked IPs
        self._load_blocked_ips()
        
        # Verify all tracked IPs are actually blocked
        try:
            result = self._run_iptables(["-L", self.CHAIN_NAME, "-n"], check=False)
            current_rules = result.stdout if result else ""
            
            for ip in self.blocked_ips:
                if ip not in current_rules:
                    print(f"Re-adding missing block for: {ip}")
                    self.block_ip(ip, reason="Sync")
                    
        except Exception as e:
            print(f"Error syncing rules: {e}")
    
    def get_blocked_ips(self) -> List[Dict]:
        """Get list of currently blocked IPs"""
        self._load_blocked_ips()
        
        return [
            {
                'ip': ip,
                'blocked_at': 'unknown',
                'expires_at': expiry.isoformat(),
                'duration_remaining': max(0, (expiry - datetime.now()).total_seconds())
            }
            for ip, expiry in self.blocked_ips.items()
        ]
    
    def list_current_blocks(self) -> List[str]:
        """List current blocks from iptables"""
        try:
            result = self._run_iptables(["-L", self.CHAIN_NAME, "-n"])
            lines = result.stdout.split('\n')
            
            ips = []
            for line in lines:
                if 'DROP' in line and ' anywhere' in line:
                    parts = line.split()
                    for i, part in enumerate(parts):
                        if part == 'DROP':
                            if i > 0 and parts[i-1] == 'anywhere':
                                continue
                            ip = parts[i-1] if i > 0 else None
                            if ip and ip != 'anywhere':
                                ips.append(ip)
            
            return ips
        except Exception as e:
            print(f"Error listing blocks: {e}")
            return []
    
    def flush_all_blocks(self):
        """Remove all blocks"""
        try:
            self._run_iptables(["-F", self.CHAIN_NAME])
            self.blocked_ips.clear()
            self._save_blocked_ips()
            print("Flushed all blocks")
        except Exception as e:
            print(f"Error flushing blocks: {e}")
    
    def get_statistics(self) -> Dict:
        """Get firewall statistics"""
        try:
            result = self._run_iptables(["-L", self.CHAIN_NAME, "-n", "-v", "-x"])
            
            stats = {
                'chain': self.CHAIN_NAME,
                'blocked_ips_count': len(self.blocked_ips),
                'rules': []
            }
            
            lines = result.stdout.split('\n')[2:]  # Skip header
            for line in lines:
                if line.strip():
                    stats['rules'].append(line.strip())
            
            return stats
        except Exception as e:
            return {'error': str(e)}


def main():
    """Main entry point for standalone execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Firewall Controller')
    parser.add_argument('--action', choices=['block', 'unblock', 'list', 'sync', 'flush'],
                       required=True, help='Action to perform')
    parser.add_argument('--ip', help='IP address to block/unblock')
    parser.add_argument('--duration', type=int, default=3600,
                       help='Block duration in seconds')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show commands without executing')
    
    args = parser.parse_args()
    
    controller = FirewallController(dry_run=args.dry_run)
    
    if args.action == 'block':
        if not args.ip:
            print("Error: --ip required for block action")
            return
        controller.block_ip(args.ip, args.duration)
        
    elif args.action == 'unblock':
        if not args.ip:
            print("Error: --ip required for unblock action")
            return
        controller.unblock_ip(args.ip)
        
    elif args.action == 'list':
        blocked = controller.get_blocked_ips()
        print(f"Blocked IPs ({len(blocked)}):")
        for item in blocked:
            print(f"  {item['ip']} - expires: {item['expires_at']}")
            
    elif args.action == 'sync':
        controller.sync_rules()
        
    elif args.action == 'flush':
        controller.flush_all_blocks()


if __name__ == "__main__":
    main()
