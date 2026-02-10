import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const apiService = {
  // Dashboard
  async getNetworkStatus() {
    const response = await api.get('/dashboard/status');
    return response.data;
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
    const params = severity ? { severity } : {};
    const response = await api.get('/alerts', { params });
    return response.data;
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
