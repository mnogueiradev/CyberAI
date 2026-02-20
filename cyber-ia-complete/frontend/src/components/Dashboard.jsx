import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Dashboard = () => {
  const [networkStatus, setNetworkStatus] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar dados da API
      const [statusData, alertsData] = await Promise.all([
        apiService.getNetworkStatus(),
        apiService.getAlerts().catch(() => [])
      ]);
      
      setNetworkStatus(statusData);
      setRecentAlerts(alertsData.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Falha ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const NetworkStatusIndicator = ({ status }) => {
    const statusConfig = {
      online: { color: '#10B981', text: 'Online', bg: 'rgba(16, 185, 129, 0.1)' },
      offline: { color: '#EF4444', text: 'Offline', bg: 'rgba(239, 68, 68, 0.1)' },
      warning: { color: '#F59E0B', text: 'Atenção', bg: 'rgba(245, 158, 11, 0.1)' }
    };

    const config = statusConfig[status] || statusConfig.offline;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: config.bg,
        borderRadius: '0.5rem',
        marginBottom: '2rem',
        border: `1px solid ${config.color}20`
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: config.color,
          animation: status === 'online' ? 'pulse 2s infinite' : 'none'
        }}></div>
        <span style={{ color: config.color, fontWeight: '600' }}>
          Sistema {config.text}
        </span>
      </div>
    );
  };

  const StatusCard = ({ title, value, icon, color, subtitle }) => {
    const colorConfig = {
      safe: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10B981' },
      warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#F59E0B' },
      danger: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#EF4444' }
    };

    const config = colorConfig[color] || colorConfig.safe;

    return (
      <div style={{
        backgroundColor: '#1E293B',
        border: `1px solid ${config.border}`,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: config.text
        }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
              {title}
            </p>
            <p style={{ 
              color: '#F1F5F9', 
              fontSize: '1.875rem', 
              fontWeight: '700', 
              margin: '0 0 0.25rem 0' 
            }}>
              {value}
            </p>
            <p style={{ color: config.text, fontSize: '0.75rem', margin: 0 }}>
              {subtitle}
            </p>
          </div>
          
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '0.5rem',
            backgroundColor: config.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.text
          }}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  const AlertItem = ({ alert }) => {
    const severityColors = {
      high: '#EF4444',
      medium: '#F59E0B',
      low: '#10B981'
    };

    return (
      <div style={{
        padding: '0.75rem',
        borderBottom: '1px solid #334155',
        '&:last-child': { borderBottom: 'none' }
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <p style={{ 
              color: '#F1F5F9', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              margin: '0 0 0.25rem 0' 
            }}>
              {alert.message || 'Alerta detectado'}
            </p>
            <p style={{ color: '#6B7280', fontSize: '0.75rem', margin: 0 }}>
              {alert.ip} • {new Date(alert.timestamp).toLocaleTimeString()}
            </p>
          </div>
          
          <span style={{
            backgroundColor: `${severityColors[alert.severity]}20`,
            color: severityColors[alert.severity],
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'uppercase'
          }}>
            {alert.severity}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: '#9CA3AF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #3B82F6', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          Carregando dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
          marginBottom: '0.5rem' 
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
        </h2>
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
        <StatusCard
          title="Hosts Monitorados"
          value={networkStatus.hostsMonitored.toLocaleString()}
          icon={<span style={{ fontSize: '1.5rem' }}>◉</span>}
          color="safe"
          subtitle="Dispositivos ativos"
        />

        <StatusCard
          title="Ameaças Detectadas"
          value={networkStatus.threatsDetected.toLocaleString()}
          icon={<span style={{ fontSize: '1.5rem' }}>▲</span>}
          color={networkStatus.threatsDetected > 0 ? 'danger' : 'safe'}
          subtitle={`${threatPercentage.toFixed(1)}% do total`}
        />

        <StatusCard
          title="Tráfego/Segundo"
          value={networkStatus.trafficPerSecond.toLocaleString()}
          icon={<span style={{ fontSize: '1.5rem' }}>▓</span>}
          color="warning"
          subtitle="Pacotes em tempo real"
        />

        <StatusCard
          title="Top Protocolos"
          value={networkStatus.topProtocols.length}
          icon={<span style={{ fontSize: '1.5rem' }}>◈</span>}
          color="safe"
          subtitle={networkStatus.topProtocols.slice(0, 3).join(', ')}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 2fr',
        gap: '1.5rem'
      }}>
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
              textAlign: 'center', 
              padding: '2rem',
              color: '#9CA3AF' 
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>○</div>
              <p>Nenhum alerta recente</p>
            </div>
          )}
        </div>

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
            Protocolos Mais Usados
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {networkStatus.topProtocols.map((protocol, index) => (
              <div key={protocol} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: '#0F172A',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ 
                    color: '#3B82F6', 
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}>
                    #{index + 1}
                  </span>
                  <span style={{ 
                    color: '#F1F5F9', 
                    fontWeight: '500' 
                  }}>
                    {protocol}
                  </span>
                </div>
                <span style={{ 
                  color: '#9CA3AF', 
                  fontSize: '0.875rem' 
                }}>
                  {Math.floor(Math.random() * 1000 + 100)} pacotes
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
