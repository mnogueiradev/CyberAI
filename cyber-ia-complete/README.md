# Cyber IA - Network Security Analysis with Machine Learning

A comprehensive cybersecurity project that uses machine learning models to detect network anomalies and potential threats through traffic analysis.

## 🚀 Features

- **Anomaly Detection**: Isolation Forest and Autoencoder models for network traffic analysis
- **Real-time Analysis**: API server for integration with monitoring dashboards
- **Automated Response**: Optional IP blocking capabilities (lab environment only)
- **Data Processing**: PCAP to CSV conversion and feature engineering
- **Comprehensive Reporting**: JSON and CSV reports with detailed threat analysis

## 📋 Prerequisites

- Python 3.8+
- Git
- Administrative privileges (for optional IP blocking)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cyber-ia-complete
```

### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install pandas numpy scikit-learn tensorflow joblib fastapi uvicorn scapy
```

## 📊 Project Structure

```
cyber-ia-complete/
├── Data/
│   ├── Datasets/           # Public datasets (UNSW-NB15)
│   ├── Processed/          # Generated processed data
│   └── Raw/               # Raw network captures
├── models/                # Trained ML models
├── src/
│   ├── api/              # FastAPI server
│   ├── data/             # Data processing scripts
│   ├── features/         # Feature engineering
│   ├── ingest/           # Data ingestion
│   └── models/           # ML training and inference
├── reports/              # Analysis reports
└── .venv/               # Virtual environment
```

## 🚀 Quick Start

### Step 1: Process Training Data

```bash
python src/data/load.py
```

This will:
- Load UNSW-NB15 dataset from `Data/Datasets/unsw_nb15/csv/`
- Process and clean the data
- Save processed features to `Data/Processed/features.csv`

### Step 2: Train Machine Learning Models

```bash
# Train Isolation Forest
python src/models/train_detection.py

# Train Autoencoder
python src/models/train_autoencoder.py
```

### Step 3: Run Inference on Network Data

```bash
# Using processed features
python src/models/run_inference.py

# Or with custom data and optional blocking (dry-run by default)
python src/models/infer_and_act.py --features Data/Processed/features.csv --dry
```

### Step 4: Start API Server

```bash
cd src/api
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## 📡 API Endpoints

- `GET /` - API status and available endpoints
- `GET /summary` - Overall analysis summary
- `GET /results` - Complete list of analyzed hosts
- `GET /host/{ip}` - Detailed information for specific IP
- `GET /alerts` - Only flagged suspicious hosts

## 🔧 Advanced Usage

### Processing PCAP Files

Convert network captures to CSV format:

```bash
python debug_teste_csv.py
```

This processes `Data/Raw/exemplo.pcap` and generates `Data/Processed/exemplo.csv`

### Nmap Integration

Convert Nmap XML scans to CSV:

```bash
python nmap_to_csv.py
```

### Custom Inference with Action

Run inference with optional IP blocking (⚠️ **LAB ENVIRONMENT ONLY**):

```bash
# Dry run (safe - shows commands without executing)
python src/models/infer_and_act.py --features your_data.csv --dry

# Real blocking (requires sudo/Linux and explicit confirmation)
python src/models/infer_and_act.py --features your_data.csv --block
```

## 📈 Model Information

### Isolation Forest
- **Purpose**: Anomaly detection using ensemble methods
- **Input**: Numerical network features
- **Output**: Anomaly scores and binary classification

### Autoencoder
- **Purpose**: Reconstruction-based anomaly detection
- **Architecture**: Neural network with encoder-decoder structure
- **Output**: Mean squared error reconstruction scores

### Combined Detection
- **Logic**: Flag as suspicious if EITHER model detects anomaly
- **Threshold**: 95th percentile (configurable)

## 🛡️ Security Considerations

- **IP Blocking**: Disabled by default, requires explicit flags
- **CORS**: Configured for development (restrict in production)
- **Data Privacy**: No sensitive information in public datasets
- **Model Security**: Models are version-controlled but can be retrained

## 📝 Reports

After running inference, check:

- `reports/infer.json` - Detailed JSON report with statistics
- `reports/infer.csv` - Tabular data with all hosts and scores

## 🔍 Troubleshooting

### Common Issues

1. **ModuleNotFoundError**: Ensure virtual environment is activated
2. **File not found**: Check data paths and run data processing first
3. **Permission denied**: Use sudo for IP blocking (Linux only)
4. **Memory issues**: Reduce dataset size or increase system RAM

### Debug Mode

Enable verbose logging:

```bash
python src/models/run_inference.py
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is for educational and research purposes. Use responsibly and in accordance with applicable laws and regulations.

## ⚠️ Disclaimer

- **IP Blocking**: Only use in isolated lab environments
- **Network Analysis**: Ensure proper authorization before analyzing network traffic
- **Model Accuracy**: False positives/negatives may occur
- **Legal Compliance**: Follow local cybersecurity laws and regulations

## 📞 Support

For issues and questions:
1. Check this README
2. Review error logs
3. Verify data paths
4. Test with sample data first

---

**Remember**: This is a research/educational tool. Always validate results and use in conjunction with other security measures.
