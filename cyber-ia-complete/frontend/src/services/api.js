import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const apiService = {
  // Dashboard
  async getNetworkStatus() {
    try {
      const [summaryResponse, resultsResponse] = await Promise.all([
        api.get('/summary'),
        api.get('/results')
      ]);
      
      const summary = summaryResponse.data;
      const results = resultsResponse.data;
      
      // Transformar dados para o formato esperado pelo Dashboard
      return {
        status: summary.anomalies_detected > 0 ? 'warning' : 'safe',
        hostsMonitored: results.length || 0,
        threatsDetected: summary.anomalies_detected || 0,
        trafficPerSecond: Math.floor(Math.random() * 1000) + 500, // Mock
        topProtocols: ['HTTP', 'HTTPS', 'TCP', 'UDP', 'DNS']
      };
    } catch (error) {
      console.error('Error fetching network status:', error);
      throw error;
    }
  },

  // Monitoramento
  async getHosts() {
    const response = await api.get('/monitoring/hosts');
    return response.data;
  },

  async getHostDetails(ip) {
    const response = await api.get(`/monitoring/hosts/${ip}`);
    return response.data;
  },

  // Alertas
  async getAlerts(severity) {
    try {
      const response = await api.get('/alerts');
      const alerts = response.data.alerts || [];
      
      // Filtrar por severity se especificado
      const filteredAlerts = severity 
        ? alerts.filter(alert => {
            if (severity === 'high') return alert.combined_flag === 1;
            return true;
          })
        : alerts;
      
      // Transformar para o formato esperado
      return filteredAlerts.map((alert, index) => ({
        id: index + 1,
        ip: alert.src_ip,
        anomalyType: alert.anomaly_type || 'Unknown',
        severity: alert.combined_flag === 1 ? 'high' : 'low'
      }));
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  },

  async getAlertCount() {
    const response = await api.get('/alerts/count');
    return response.data;
  },

  // Inferência e Análise
  async runInference(dataFile) {
    if (dataFile) {
      const formData = new FormData();
      formData.append('file', dataFile);
      const response = await api.post('/inference/run', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await api.post('/inference/run');
      return response.data;
    }
  },

  async getLatestResults() {
    const response = await api.get('/inference/results');
    return response.data;
  },

  // Previsões
  async getPredictions() {
    const response = await api.get('/predictions/trends');
    return response.data;
  },

  // Relatórios
  async getReports() {
    const response = await api.get('/reports');
    return response.data;
  },

  async generateReport(type) {
    const response = await api.post('/reports/generate', { type });
    return response.data;
  },

  async downloadReport(reportId) {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Logs
  async getLogs(limit) {
    const params = limit ? { limit } : {};
    const response = await api.get('/system/logs', { params });
    return response.data;
  },

  // Configurações
  async getSettings() {
    const response = await api.get('/settings');
    return response.data;
  },

  async updateSettings(settings) {
    const response = await api.put('/settings', settings);
    return response.data;
  },

  // Upload de arquivos
  async uploadDataFile(file, type) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Treinamento
  async startTraining(params) {
    const response = await api.post('/training/start', params);
    return response.data;
  },

  async getTrainingStatus(trainingId) {
    const response = await api.get(`/training/${trainingId}/status`);
    return response.data;
  }
};

export default apiService;
