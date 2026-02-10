import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

// Componente de Card de Status
const StatusCard = ({ title, value, icon, color, subtitle }) => {
  const colorClasses = {
    safe: 'status-safe',
    warning: 'status-warning', 
    danger: 'status-danger'
  };

  return (
    <div className="cyber-card metric-card">
      <div className="flex items-center space-x-4">
        <div className={`cyber-icon ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <div className="metric-label">{title}</div>
          <div className={`metric-value ${color === 'safe' ? 'text-kaspersky-green' : color === 'warning' ? 'text-kaspersky-yellow' : 'text-kaspersky-red'}`}>
            {value}
          </div>
          {subtitle && (
            <div className="text-gray-400 text-sm mt-1">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Indicador de Status da Rede
const NetworkStatusIndicator = ({ status }) => {
  const statusConfig = {
    safe: {
      label: 'Seguro',
      color: 'status-safe',
      icon: '🛡️',
      description: 'Nenhuma ameaça detectada'
    },
    warning: {
      label: 'Atenção',
      color: 'status-warning',
      icon: '⚠️',
      description: 'Atividade suspeita detectada'
    },
    danger: {
      label: 'Perigo',
      color: 'status-danger',
      icon: '🚨',
      description: 'Ameaças críticas detectadas'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`alert-card ${config.color} mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="text-lg font-semibold">
              Status da Rede: {config.label}
            </h3>
            <p className="text-gray-300 text-sm">{config.description}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
      </div>
    </div>
  );
};

// Componente de Alerta
const AlertItem = ({ alert }) => {
  const severityColors = {
    low: 'bg-kaspersky-green/20 text-kaspersky-green border-kaspersky-green',
    medium: 'bg-kaspersky-yellow/20 text-kaspersky-yellow border-kaspersky-yellow',
    high: 'bg-kaspersky-red/20 text-kaspersky-red border-kaspersky-red'
  };

  return (
    <div className={`alert-card ${severityColors[alert.severity]} mb-3`}>
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{alert.ip}</div>
          <div className="text-sm text-gray-300">{alert.anomalyType}</div>
        </div>
        <div className="text-xs px-2 py-1 rounded bg-gray-800">
          {alert.severity.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

// Componente Principal Dashboard
const Dashboard = () => {
  const [networkStatus, setNetworkStatus] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statusData, alertsData] = await Promise.all([
          apiService.getNetworkStatus(),
          apiService.getAlerts('high')
        ]);
        setNetworkStatus(statusData);
        setRecentAlerts(alertsData.slice(0, 5));
      } catch (err) {
        setError('Falha ao carregar dados do dashboard');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-card status-danger">
        <div className="font-semibold">Erro</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  if (!networkStatus) {
    return (
      <div className="alert-card bg-gray-800 text-gray-300">
        <div>Nenhum dado disponível</div>
      </div>
    );
  }

  const threatPercentage = networkStatus.hostsMonitored > 0 
    ? (networkStatus.threatsDetected / networkStatus.hostsMonitored) * 100 
    : 0;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Dashboard de Segurança de Rede
      </h1>

      <NetworkStatusIndicator status={networkStatus.status} />

      <div className="cyber-grid mb-8">
        {/* Cards de Status */}
        <StatusCard
          title="Hosts Monitorados"
          value={networkStatus.hostsMonitored.toLocaleString()}
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>}
          color="safe"
          subtitle="Dispositivos ativos"
        />

        <StatusCard
          title="Ameaças Detectadas"
          value={networkStatus.threatsDetected.toLocaleString()}
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>}
          color={networkStatus.threatsDetected > 0 ? 'danger' : 'safe'}
          subtitle={`${threatPercentage.toFixed(1)}% do total`}
        />

        <StatusCard
          title="Tráfego/Segundo"
          value={networkStatus.trafficPerSecond.toLocaleString()}
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
          </svg>}
          color="warning"
          subtitle="Pacotes em tempo real"
        />

        <StatusCard
          title="Top Protocolos"
          value={networkStatus.topProtocols.length}
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h-.5a1 1 0 000-2H8a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2h-1.5a1 1 0 000 2H14v11H6V5z" clipRule="evenodd"/>
          </svg>}
          color="safe"
          subtitle={networkStatus.topProtocols.slice(0, 3).join(', ')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas Recentes */}
        <div className="cyber-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Alertas Recentes</h2>
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))
          ) : (
            <div className="text-gray-400 text-center py-8">
              Nenhum alerta recente
            </div>
          )}
        </div>

        {/* Protocolos Mais Usados */}
        <div className="cyber-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Protocolos Mais Ativos</h2>
          {networkStatus.topProtocols.map((protocol, index) => (
            <div key={protocol} className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">{protocol}</span>
                <span className="text-gray-400 text-sm">
                  {Math.max(0, 100 - index * 20)}%
                </span>
              </div>
              <div className="cyber-progress">
                <div 
                  className="cyber-progress-bar"
                  style={{ width: `${Math.max(0, 100 - index * 20)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
