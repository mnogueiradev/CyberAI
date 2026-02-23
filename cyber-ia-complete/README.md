# Cyber IA - Network Security Analysis with Machine Learning

A comprehensive cybersecurity project that uses machine learning models to detect network anomalies and potential threats through traffic analysis.

## 🚀 Features

- **Anomaly Detection**: Isolation Forest and Autoencoder models for network traffic analysis
- **Real-time Analysis**: API server for integration with monitoring dashboards
- **Automated Response**: Optional IP blocking capabilities (lab environment only)
- **Data Processing**: PCAP to CSV conversion and feature engineering
- **Comprehensive Reporting**: JSON and CSV reports with detailed threat analysis
- **Modern Frontend**: React-based dashboard with minimalist design
- **Data Analysis Tools**: Built-in CSV viewer and analysis utilities

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+ (for frontend)
- Git
- Administrative privileges (for optional IP blocking)

## 🛠️ Installation & Setup - Complete Guide

### 🔧 Step 1: Clone the Repository

```bash
git clone https://github.com/mnogueiradev/CyberAI.git
cd cyber-ia-complete
```

### 🐍 Step 2: Setup Python Virtual Environment

**Windows:**
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate
```

**Linux/macOS:**
```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate
```

### 📦 Step 3: Install Python Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install required packages
pip install pandas numpy scikit-learn tensorflow joblib fastapi uvicorn scapy python-multipart

# Install additional packages for data processing
pip install matplotlib seaborn tabulate
```

### 🌐 Step 4: Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Return to root directory
cd ..
```

## 🚀 Quick Start - From Zero to Running

### 📊 Step 5: Process Training Data (Optional - if you have raw data)

```bash
# Load and process UNSW-NB15 dataset
python src/data/load.py
```

**This will:**
- Load dataset from `Data/Datasets/unsw_nb15/csv/`
- Process and clean the data
- Save processed features to `Data/Processed/features.csv`

### 🤖 Step 6: Train Machine Learning Models (Optional - if models don't exist)

```bash
# Train Isolation Forest model
python src/models/train_detection.py

# Train Autoencoder model
python src/models/train_autoencoder.py
```

**This will create trained models in the `models/` directory.**

### 🔍 Step 7: Run Inference on Network Data

```bash
# Run inference on processed data
python src/models/run_inference.py

# Or with custom data
python src/models/infer_and_act.py --features Data/Processed/features.csv --dry
```

**This generates:**
- `reports/infer.json` - Analysis summary
- `reports/infer.csv` - Detailed results

### 📡 Step 8: Start the Backend API Server

```bash
# Navigate to source directory
cd src

# Start FastAPI server
python -m uvicorn api.server:app --reload --host 0.0.0.0 --port 8000
```

**The API will be available at `http://localhost:8000`**

### 🎨 Step 9: Start the Frontend Dashboard

**Open a NEW terminal window and run:**

```bash
# Navigate to frontend directory
cd frontend

# Start React development server
npm start
```

**The dashboard will be available at `http://localhost:3000`**

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
├── frontend/             # React dashboard
│   ├── src/             # React components
│   ├── public/          # Static files
│   └── package.json     # Node.js dependencies
├── reports/              # Analysis reports
├── csv_viewer_simple.py  # CSV analysis tool
├── analisar_csv.bat     # Windows shortcut for CSV analysis
└── .venv/               # Virtual environment
```

## 🎯 Running the Application - Two Terminal Method

### 📡 Terminal 1: Backend Server

```bash
# Activate virtual environment (if not already active)
.venv\Scripts\activate

# Navigate to source directory
cd src

# Start FastAPI server
python -m uvicorn api.server:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
```

### 🎨 Terminal 2: Frontend Dashboard

```bash
# Navigate to frontend directory (in NEW terminal)
cd frontend

# Start React development server
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view cyber-ia in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

## 📡 API Endpoints

- `GET /` - API status and available endpoints
- `GET /summary` - Overall analysis summary
- `GET /results` - Complete list of analyzed hosts
- `GET /host/{ip}` - Detailed information for specific IP
- `GET /alerts` - Only flagged suspicious hosts
- `GET /dashboard/real-data` - Real dashboard metrics (no mock data)

## 🔧 Data Analysis Tools

### 📊 CSV Analysis Tool

**Built-in tool for analyzing `reports/infer.csv`:**

```bash
# Method 1: Use the batch file (Windows)
analisar_csv.bat

# Method 2: Use Python directly
python csv_viewer_simple.py
```

**Features:**
- Complete statistical analysis of 257,673 network events
- Anomaly detection summary (27.89% anomaly rate)
- Traffic statistics and protocol analysis
- Formatted tables with K/M/GB notation
- Sample data visualization

## 📈 Dashboard Features

### 🎯 Real-time Metrics
- **Hosts Monitored**: Based on actual network events
- **Threats Detected**: Real anomaly counts from ML models
- **Traffic/Second**: Calculated from actual network data
- **Top Protocols**: Most used protocols in your data

### 🚨 Alert System
- Real-time anomaly detection
- Color-coded threat levels
- Detailed host information
- Historical alert tracking

### 📊 Analysis Views
- **Dashboard**: Overview with key metrics
- **Monitoring**: Host-by-host analysis
- **Alerts**: Suspicious activity details
- **Analysis**: Deep dive into network patterns
- **Reports**: Comprehensive analysis reports

## 🔍 Advanced Usage

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
- **Threshold**: Configurable (default: 95th percentile)

## 🛡️ Security Considerations

- **IP Blocking**: Disabled by default, requires explicit flags
- **CORS**: Configured for development (restrict in production)
- **Data Privacy**: No sensitive information in public datasets
- **Model Security**: Models are version-controlled but can be retrained
- **Authentication**: Add API keys/tokens for production use

## 📝 Reports

After running inference, check:

- `reports/infer.json` - Detailed JSON report with statistics
- `reports/infer.csv` - Tabular data with all hosts and scores

## 🔍 Troubleshooting

### Common Issues

1. **ModuleNotFoundError**: Ensure virtual environment is activated
   ```bash
   # Windows
   .venv\Scripts\activate
   
   # Linux/macOS
   source .venv/bin/activate
   ```

2. **File not found**: Check data paths and run data processing first
   ```bash
   # Ensure reports directory exists
   mkdir reports
   
   # Run inference first
   python src/models/run_inference.py
   ```

3. **Permission denied**: Use sudo for IP blocking (Linux only)
4. **Memory issues**: Reduce dataset size or increase system RAM
5. **Port already in use**: Change port numbers
   ```bash
   # Backend on different port
   python -m uvicorn api.server:app --port 8001
   
   # Frontend on different port
   PORT=3001 npm start
   ```

6. **Frontend not connecting to backend**: Check CORS settings
   - Backend should be running on port 8000
   - Frontend expects API at `http://localhost:8000`

### Debug Mode

Enable verbose logging:

```bash
# Backend with debug
python src/models/run_inference.py

# Frontend with debug
cd frontend
npm start --verbose
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
5. Check GitHub Issues

## 🎯 Quick Reference Commands

### Environment Setup
```bash
# Activate virtual environment
.venv\Scripts\activate

# Install dependencies
pip install pandas numpy scikit-learn tensorflow joblib fastapi uvicorn scapy

# Frontend dependencies
cd frontend && npm install
```

### Application Startup
```bash
# Terminal 1 - Backend
cd src && python -m uvicorn api.server:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend  
cd frontend && npm start
```

### Data Analysis
```bash
# Analyze CSV results
python csv_viewer_simple.py

# Or use shortcut
analisar_csv.bat
```

---

**Remember**: This is a research/educational tool. Always validate results and use in conjunction with other security measures.

**🚀 Ready to start analyzing network traffic with AI!**
