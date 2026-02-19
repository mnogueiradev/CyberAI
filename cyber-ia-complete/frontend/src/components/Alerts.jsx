import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertStats, setAlertStats] = useState({ total: 0, high: 0, medium: 0, low: 0 });

  useEffect(() => {
    fetchAlerts();
    fetchAlertStats();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertStats = async () => {
    try {
      const data = await apiService.getAlertCount();
      setAlertStats(data);
    } catch (error) {
      console.error('Error fetching alert stats:', error);
      // Fallback para cálculo local
      const allAlerts = await apiService.getAlerts();
      const stats = {
        total: allAlerts.length,
        high: allAlerts.filter(a => a.severity === 'high').length,
        medium: allAlerts.filter(a => a.severity === 'medium').length,
        low: allAlerts.filter(a => a.severity === 'low').length
      };
      setAlertStats(stats);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.anomalyType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'high':
        return 'rgba(239, 68, 68, 0.1)';
      case 'medium':
        return 'rgba(245, 158, 11, 0.1)';
      case 'low':
        return 'rgba(16, 185, 129, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      case 'low':
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            border: '3px solid #EF4444', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          Carregando alertas...
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: '#F1F5F9' }}>
      {/* Header com Estatísticas */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem' 
            }}>
              Painel de Alertas
            </h2>
            <p style={{ color: '#9CA3AF', margin: 0 }}>
              {alertStats.total} alertas ativos no sistema
            </p>
          </div>
          
          <button
            onClick={() => {
              fetchAlerts();
              fetchAlertStats();
            }}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}
          >
            🔄 Atualizar
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <div style={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#F1F5F9',
              marginBottom: '0.5rem'
            }}>
              {alertStats.total}
            </div>
            <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
              Total de Alertas
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#EF4444',
              marginBottom: '0.5rem'
            }}>
              {alertStats.high}
            </div>
            <div style={{ color: '#EF4444', fontSize: '0.875rem' }}>
              🚨 Alertas Críticos
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#F59E0B',
              marginBottom: '0.5rem'
            }}>
              {alertStats.medium}
            </div>
            <div style={{ color: '#F59E0B', fontSize: '0.875rem' }}>
              ⚠️ Alertas Médios
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#10B981',
              marginBottom: '0.5rem'
            }}>
              {alertStats.low}
            </div>
            <div style={{ color: '#10B981', fontSize: '0.875rem' }}>
              ℹ️ Alertas Baixos
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Buscar por IP ou tipo de anomalia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
        
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          style={{
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <option value="all">Todas Severidades</option>
          <option value="high">Críticos</option>
          <option value="medium">Médios</option>
          <option value="low">Baixos</option>
        </select>
      </div>

      {/* Lista de Alertas */}
      <div style={{ 
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        overflow: 'hidden'
      }}>
        {filteredAlerts.length === 0 ? (
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center',
            color: '#9CA3AF'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              Nenhum alerta encontrado
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Tente ajustar os filtros ou atualize a lista
            </p>
          </div>
        ) : (
          <div>
            {filteredAlerts.map((alert, index) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                style={{
                  padding: '1.5rem',
                  borderBottom: index < filteredAlerts.length - 1 ? '1px solid #334155' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#0F172A';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.25rem' }}>
                        {getSeverityIcon(alert.severity)}
                      </span>
                      <div>
                        <h3 style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: '600', 
                          margin: 0,
                          color: '#F1F5F9'
                        }}>
                          {alert.ip}
                        </h3>
                        <p style={{ 
                          color: '#9CA3AF', 
                          margin: '0.25rem 0 0 0',
                          fontSize: '0.875rem'
                        }}>
                          {alert.anomalyType}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      backgroundColor: getSeverityBg(alert.severity),
                      color: getSeverityColor(alert.severity),
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      {alert.severity}
                    </span>
                    <p style={{ 
                      color: '#6B7280', 
                      fontSize: '0.75rem', 
                      margin: '0.5rem 0 0 0' 
                    }}>
                      ID: #{alert.id}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Alerta */}
      {selectedAlert && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedAlert(null)}
        >
          <div
            style={{
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                margin: 0,
                color: '#F1F5F9'
              }}>
                Detalhes do Alerta #{selectedAlert.id}
              </h3>
              
              <button
                onClick={() => setSelectedAlert(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem' 
              }}>
                <div style={{
                  backgroundColor: '#0F172A',
                  padding: '1rem',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                    IP Suspeito
                  </p>
                  <p style={{ 
                    color: '#F1F5F9', 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    margin: 0 
                  }}>
                    {selectedAlert.ip}
                  </p>
                </div>

                <div style={{
                  backgroundColor: '#0F172A',
                  padding: '1rem',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                    Severidade
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>
                      {getSeverityIcon(selectedAlert.severity)}
                    </span>
                    <span style={{ 
                      color: getSeverityColor(selectedAlert.severity),
                      fontSize: '1.125rem', 
                      fontWeight: '600', 
                      textTransform: 'uppercase'
                    }}>
                      {selectedAlert.severity}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#0F172A',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <h4 style={{ 
                  color: '#F1F5F9', 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  margin: '0 0 1rem 0' 
                }}>
                  Informações do Alerta
                </h4>
                
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9CA3AF' }}>Tipo de Anomalia:</span>
                    <span style={{ color: '#F1F5F9' }}>{selectedAlert.anomalyType}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9CA3AF' }}>ID do Alerta:</span>
                    <span style={{ color: '#F1F5F9' }}>#{selectedAlert.id}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9CA3AF' }}>Data/Hora:</span>
                    <span style={{ color: '#F1F5F9' }}>
                      {formatTimestamp(selectedAlert.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#0F172A',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <h4 style={{ 
                  color: '#F1F5F9', 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  margin: '0 0 1rem 0' 
                }}>
                  Ações Recomendadas
                </h4>
                
                <div style={{ color: '#9CA3AF', lineHeight: '1.6' }}>
                  {selectedAlert.severity === 'high' && (
                    <div>
                      <p><strong>Ação Imediata:</strong></p>
                      <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                        <li>Isolar o dispositivo da rede</li>
                        <li>Investigar atividades recentes</li>
                        <li>Verificar arquivos e processos suspeitos</li>
                        <li>Contatar equipe de segurança</li>
                      </ul>
                    </div>
                  )}
                  
                  {selectedAlert.severity === 'medium' && (
                    <div>
                      <p><strong>Ação Recomendada:</strong></p>
                      <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                        <li>Monitorar atividades do dispositivo</li>
                        <li>Verificar logs de acesso</li>
                        <li>Atualizar sistemas de segurança</li>
                      </ul>
                    </div>
                  )}
                  
                  {selectedAlert.severity === 'low' && (
                    <div>
                      <p><strong>Ação Preventiva:</strong></p>
                      <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                        <li>Manter monitoramento</li>
                        <li>Documentar ocorrência</li>
                        <li>Revisar políticas de acesso</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
