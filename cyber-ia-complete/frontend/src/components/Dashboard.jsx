import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

// Componente de Card de Status
const StatusCard = ({ title, value, icon, color, subtitle }) => {
  const colorConfig = {
    safe: { bg: '#10B981', text: '#34D399', border: '#059669' },
    warning: { bg: '#F59E0B', text: '#FBBF24', border: '#D97706' },
    danger: { bg: '#EF4444', text: '#F87171', border: '#DC2626' }
  };

  const currentColor = colorConfig[color] || colorConfig.safe;

  return (
    <div style={{
      backgroundColor: '#1E293B',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid #334155',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '0.5rem',
          backgroundColor: currentColor.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: currentColor.text,
          fontSize: '1.25rem'
        }}>
          {icon}
        </div>
        <div>
          <div style={{ 
            color: '#9CA3AF', 
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.25rem'
          }}>
            {title}
          </div>
          <div style={{ 
            color: '#F1F5F9', 
            fontSize: '2rem',
            fontWeight: '700',
            lineHeight: '1'
          }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ 
              color: '#6B7280', 
              fontSize: '0.875rem',
              marginTop: '0.25rem'
            }}>
              {subtitle}
            </div>
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
      color: '#10B981',
      bg: '#059669',
      icon: '🛡️',
      description: 'Nenhuma ameaça detectada'
    },
    warning: {
      label: 'Atenção',
      color: '#F59E0B',
      bg: '#D97706',
      icon: '⚠️',
      description: 'Atividade suspeita detectada'
    },
    danger: {
      label: 'Perigo',
      color: '#EF4444',
      bg: '#DC2626',
      icon: '🚨',
      description: 'Ameaças críticas detectadas'
    }
  };

  const config = statusConfig[status];

  return (
    <div style={{
      backgroundColor: '#1E293B',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid #334155',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{config.icon}</span>
          <div>
            <h3 style={{ 
              color: '#F1F5F9', 
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: '600'
            }}>
              Status da Rede: {config.label}
            </h3>
            <p style={{ 
              color: '#9CA3AF', 
              margin: '2px 0 0 0',
              fontSize: '0.875rem'
            }}>
              {config.description}
            </p>
          </div>
        </div>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: config.bg,
          boxShadow: `0 0 0 4px ${config.color}33`,
          animation: 'pulse 2s ease-in-out infinite'
        }}></div>
      </div>
    </div>
  );
};

// Componente de Alerta
const AlertItem = ({ alert }) => {
  const severityConfig = {
    low: { bg: '#10B98120', text: '#34D399', border: '#059669' },
    medium: { bg: '#F59E0B20', text: '#FBBF24', border: '#D97706' },
    high: { bg: '#EF444420', text: '#F87171', border: '#DC2626' }
  };

  const config = severityConfig[alert.severity] || severityConfig.low;

  return (
    <div style={{
      backgroundColor: '#1E293B',
      borderRadius: '0.75rem',
      padding: '1rem',
      border: `1px solid ${config.border}`,
      marginBottom: '0.75rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ 
            color: '#F1F5F9', 
            fontWeight: '500',
            fontSize: '0.875rem',
            marginBottom: '0.25rem'
          }}>
            {alert.ip}
          </div>
          <div style={{ 
            color: '#9CA3AF', 
            fontSize: '0.75rem'
          }}>
            {alert.anomalyType}
          </div>
        </div>
        <div style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: config.bg,
          color: config.text,
          fontSize: '0.75rem',
          fontWeight: '600',
          borderRadius: '0.25rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #1E293B',
          borderTop: '4px solid #3B82F6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ 
          color: '#9CA3AF', 
          marginTop: '1rem',
          fontSize: '0.875rem'
        }}>
          Carregando dados...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#1E293B',
        borderRadius: '0.75rem',
        padding: '2rem',
        border: '1px solid #EF4444',
        textAlign: 'center'
      }}>
        <div style={{ 
          color: '#EF4444', 
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '0.5rem'
        }}>
          Erro
        </div>
        <div style={{ color: '#9CA3AF' }}>{error}</div>
      </div>
    );
  }

  if (!networkStatus) {
    return (
      <div style={{
        backgroundColor: '#1E293B',
        borderRadius: '0.75rem',
        padding: '2rem',
        border: '1px solid #334155',
        textAlign: 'center'
      }}>
        <div style={{ color: '#9CA3AF' }}>Nenhum dado disponível</div>
      </div>
    );
  }

  const threatPercentage = networkStatus.hostsMonitored > 0 
    ? (networkStatus.threatsDetected / networkStatus.hostsMonitored) * 100 
    : 0;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: '#F1F5F9',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        Dashboard de Segurança de Rede
      </h1>

      <NetworkStatusIndicator status={networkStatus.status} />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Cards de Status */}
        <StatusCard
          title="Hosts Monitorados"
          value={networkStatus.hostsMonitored.toLocaleString()}
          icon={<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 3 3 0 016 6zM9 15a3 3 0 11-6 3 3 0 016 6zM12.35 6.35a.5.5 0 00-.7-.7l-8 8a.5.5 0 00.7-.7l8-8a.5.5 0 00-.7.7z"/>
          </svg>}
          color="safe"
          subtitle="Dispositivos ativos"
        />

        <StatusCard
          title="Ameaças Detectadas"
          value={networkStatus.threatsDetected.toLocaleString()}
          icon={<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0h6a1 1 0 102 0v-4a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>}
          color={networkStatus.threatsDetected > 0 ? 'danger' : 'safe'}
          subtitle={`${threatPercentage.toFixed(1)}% do total`}
        />

        <StatusCard
          title="Tráfego/Segundo"
          value={networkStatus.trafficPerSecond.toLocaleString()}
          icon={<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
          </svg>}
          color="warning"
          subtitle="Pacotes em tempo real"
        />

        <StatusCard
          title="Top Protocolos"
          value={networkStatus.topProtocols.length}
          icon={<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a1 1 0 011-1h2a1 1 0 100 2H5a1 1 0 01-1-1zM9 8a1 1 0 000 2h2a1 1 0 100-2H9zM14 11a1 1 0 011-1h2a1 1 0 100 2h-2a1 1 0 01-1-1z"/>
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H4zm6 6a1 1 0 100 2h2a1 1 0 100-2h-2a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4z" clipRule="evenodd"/>
          </svg>}
          color="safe"
          subtitle={networkStatus.topProtocols.slice(0, 3).join(', ')}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 2fr',
        gap: '1.5rem'
      }}>
        {/* Alertas Recentes */}
        <div style={{
          backgroundColor: '#1E293B',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          border: '1px solid #334155'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#F1F5F9', 
            marginBottom: '1rem' 
          }}>
            Alertas Recentes
          </h2>
          {recentAlerts.length > 0 ? (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {recentAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <div style={{ 
              color: '#9CA3AF', 
              textAlign: 'center', 
              padding: '2rem 0' 
            }}>
              Nenhum alerta recente
            </div>
          )}
        </div>

        {/* Protocolos Mais Usados */}
        <div style={{
          backgroundColor: '#1E293B',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          border: '1px solid #334155'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#F1F5F9', 
            marginBottom: '1rem' 
          }}>
            Protocolos Mais Ativos
          </h2>
          {networkStatus.topProtocols.map((protocol, index) => (
            <div key={protocol} style={{ marginBottom: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ 
                  color: '#F1F5F9', 
                  fontWeight: '500' 
                }}>
                  {protocol}
                </span>
                <span style={{ 
                  color: '#9CA3AF', 
                  fontSize: '0.875rem' 
                }}>
                  {Math.max(0, 100 - index * 20)}%
                </span>
              </div>
              <div style={{
                height: '8px',
                backgroundColor: '#374151',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#3B82F6',
                  width: `${Math.max(0, 100 - index * 20)}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Estilos globais
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  * {
    box-sizing: border-box;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #1E293B;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #4B5563;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #6B7280;
  }
`;

// Injetar estilos globais
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}
