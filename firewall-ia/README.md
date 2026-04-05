# Firewall IA - AI-Powered Network Firewall with Snort Integration

## 🚀 Overview

Firewall IA is an advanced network security system that combines **Snort IDS/IPS** with **Machine Learning** to detect and block malicious network packets in real-time. The system uses Snort for rule-based detection and signature generation, while ML models learn patterns from Snort alerts to identify zero-day threats and sophisticated attacks.

## 🔥 Key Features

- **Snort Integration**: Real-time packet inspection using Snort IDS/IPS
- **ML-Powered Detection**: Train models on Snort alert data to recognize malicious patterns
- **Docker-Based Deployment**: Containerized architecture for easy deployment
- **Real-time Blocking**: Automatic firewall rules for detected threats
- **Hybrid Detection**: Combines signature-based (Snort) and anomaly-based (ML) detection
- **Automated Training Pipeline**: Continuous model improvement from new threat data
- **Web Dashboard**: Real-time monitoring and threat visualization

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Network Traffic                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Snort IDS/IPS                             │
│  - Packet Inspection                                        │
│  - Rule Matching                                            │
│  - Alert Generation                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Collection Layer                          │
│  - Alert Parsing                                            │
│  - Feature Extraction                                       │
│  - Label Generation                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           Machine Learning Engine                           │
│  - Model Training (Random Forest, XGBoost, Neural Nets)    │
│  - Real-time Inference                                      │
│  - Threat Classification                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Firewall Controller                            │
│  - IPTables/nftables Integration                            │
│  - Automatic Rule Generation                                │
│  - Threat Blocking                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Prerequisites

- Docker & Docker Compose
- Python 3.9+
- Linux host (for firewall functionality)
- Root/sudo privileges (for iptables integration)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd /workspace/firewall-ia
```

### 2. Build and Run with Docker

```bash
# Build all containers
docker-compose build

# Start the system
docker-compose up -d
```

### 3. Verify Services

```bash
# Check container status
docker-compose ps

# View Snort logs
docker-compose logs snort

# View ML training logs
docker-compose logs trainer
```

## 📊 Project Structure

```
firewall-ia/
├── docker-compose.yml          # Docker orchestration
├── Dockerfile.snort           # Snort IDS container
├── Dockerfile.backend         # ML backend API
├── Dockerfile.frontend        # Web dashboard
├── snort/
│   ├── config/
│   │   └── snort.conf         # Snort configuration
│   ├── rules/
│   │   └── local.rules        # Custom detection rules
│   └── logs/                  # Alert logs
├── src/
│   ├── ingest/
│   │   └── snort_parser.py    # Parse Snort alerts
│   ├── preprocess/
│   │   └── feature_extractor.py # Feature engineering
│   ├── train/
│   │   └── train_model.py     # Model training
│   ├── inference/
│   │   └── detector.py        # Real-time detection
│   └── firewall/
│       └── blocker.py         # Firewall rule management
├── scripts/
│   ├── setup_snort.sh         # Snort initialization
│   └── train_pipeline.sh      # Training automation
├── config/
│   └── ml_config.yaml         # ML hyperparameters
├── data/
│   ├── raw/                   # Raw Snort alerts
│   └── processed/             # Processed features
├── models/                    # Trained ML models
└── reports/                   # Detection reports
```

## 🔧 Configuration

### Snort Configuration

Edit `snort/config/snort.conf` to customize:
- Network variables (HOME_NET, EXTERNAL_NET)
- Preprocessor settings
- Rule includes
- Output plugins

### ML Configuration

Edit `config/ml_config.yaml` for:
- Model type selection
- Hyperparameters
- Training parameters
- Detection thresholds

## 📡 API Endpoints

The backend API provides:

- `GET /api/status` - System health check
- `GET /api/alerts` - Recent Snort alerts
- `GET /api/threats` - ML-detected threats
- `POST /api/train` - Trigger model retraining
- `GET /api/stats` - Traffic statistics
- `POST /api/block/{ip}` - Manual IP blocking
- `DELETE /api/block/{ip}` - Remove block rule

## 🎯 Usage Examples

### Monitor Real-time Alerts

```bash
docker-compose logs -f snort
```

### Train ML Model

```bash
docker-compose exec backend python src/train/train_model.py
```

### View Detection Reports

```bash
docker-compose exec backend cat reports/detection_report.json
```

### Manual IP Blocking

```bash
curl -X POST http://localhost:8000/api/block/192.168.1.100
```

## 🔍 Snort Rules

Custom rules are stored in `snort/rules/local.rules`. Example:

```
alert tcp any any -> $HOME_NET any (msg:"Potential Port Scan"; flags:S; threshold:type both,track by_src,count 20,seconds 60; classtype:attempted-recon; sid:1000001;)
alert tcp any any -> $HOME_NET 22 (msg:"SSH Brute Force Attempt"; flow:to_server; threshold:type both,track by_src,count 5,seconds 60; classtype:attempted-admin; sid:1000002;)
```

## 📈 ML Model Training

The training pipeline:

1. **Data Collection**: Snort alerts are parsed and stored
2. **Feature Extraction**: Network features are engineered
3. **Label Generation**: Alerts are labeled as malicious/benign
4. **Model Training**: ML model learns patterns
5. **Model Evaluation**: Performance metrics are calculated
6. **Deployment**: Model is deployed for real-time inference

### Training Command

```bash
docker-compose exec backend python src/train/train_model.py \
  --data data/processed/features.csv \
  --output models/threat_detector.pkl \
  --model-type random_forest
```

## 🛡️ Firewall Integration

The system integrates with iptables/nftables:

```python
# Automatic blocking example
from src.firewall.blocker import FirewallBlocker

blocker = FirewallBlocker()
blocker.block_ip("192.168.1.100", duration=3600)  # Block for 1 hour
blocker.unblock_ip("192.168.1.100")
```

## 📊 Dashboard

Access the web dashboard at `http://localhost:3000` for:

- Real-time threat monitoring
- Alert visualization
- Traffic statistics
- Model performance metrics
- Manual blocking interface

## 🔐 Security Considerations

- Run containers with minimal privileges
- Use secure network configurations
- Regularly update Snort rules
- Monitor false positive rates
- Implement rate limiting on API
- Use HTTPS in production

## 🧪 Testing

### Test Snort Detection

```bash
# Generate test traffic
docker-compose exec snort ping -c 5 target_host

# Check alerts
docker-compose exec snort cat /var/log/snort/alert
```

### Test ML Detection

```bash
# Run inference on sample data
docker-compose exec backend python src/inference/detector.py --test
```

## 📝 Troubleshooting

### Snort Not Starting

```bash
# Check configuration
docker-compose exec snort snort -T -c /etc/snort/snort.conf

# View logs
docker-compose logs snort
```

### ML Training Fails

```bash
# Check data format
docker-compose exec backend python src/preprocess/feature_extractor.py --validate

# View memory usage
docker stats
```

### Firewall Rules Not Applied

```bash
# Check iptables permissions
docker-compose exec firewall iptables -L

# Verify root privileges
docker-compose exec firewall whoami
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add Snort rules or ML improvements
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

## ⚠️ Disclaimer

This tool is for educational and defensive security purposes only. Ensure you have proper authorization before deploying in any network environment.

## 📞 Support

- GitHub Issues for bug reports
- Documentation for usage guides
- Community forum for discussions

---

**🚀 Protect your network with AI-powered threat detection!**
