import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Analysis = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    fetchAnalysisData();
  }, [selectedTimeRange]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      // Buscar dados 100% reais da API
      const realData = await apiService.getAnalysisData();
      setAnalysisData(realData);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

  
  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
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
            border: '3px solid #8B5CF6', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          Carregando análise avançada...
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: '#9CA3AF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>▓</div>
          <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Dados de análise não disponíveis
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
            Execute a inferência para gerar dados de análise
          </p>
          <button
            onClick={fetchAnalysisData}
            style={{
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: '#F1F5F9' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '0.5rem' 
          }}>
            Análise Avançada
          </h2>
          <p style={{ color: '#9CA3AF', margin: 0 }}>
            Insights detalhados e padrões de comportamento
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
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
            <option value="1h">Última Hora</option>
            <option value="24h">Últimas 24 Horas</option>
            <option value="7d">Últimos 7 Dias</option>
            <option value="30d">Últimos 30 Dias</option>
          </select>
          
          <button
            onClick={fetchAnalysisData}
            style={{
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#7C3AED'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#8B5CF6'}
          >
            Atualizar
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>▓</span>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: 0 }}>
                Total de Eventos
              </p>
              <p style={{ 
                color: '#F1F5F9', 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                margin: 0 
              }}>
                {formatNumber(analysisData.overview.totalEvents)}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>▲</span>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: 0 }}>
                Anomalias Detectadas
              </p>
              <p style={{ 
                color: '#EF4444', 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                margin: 0 
              }}>
                {formatNumber(analysisData.overview.anomaliesDetected)}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>▓</span>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: 0 }}>
                Taxa de Anomalia
              </p>
              <p style={{ 
                color: '#F59E0B', 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                margin: 0 
              }}>
                {analysisData.overview.anomalyRate}%
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>◉</span>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: 0 }}>
                Precisão do Modelo
              </p>
              <p style={{ 
                color: '#10B981', 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                margin: 0 
              }}>
                {analysisData.performance.modelAccuracy}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Análises */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {/* Top Anomalias */}
        <div style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem',
            color: '#F1F5F9'
          }}>
            Principais Tipos de Anomalia
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analysisData.patterns.topAnomalies.map((anomaly, index) => (
              <div key={index}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#F1F5F9', fontSize: '0.875rem' }}>
                    {anomaly.type}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      color: getSeverityColor(anomaly.severity),
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      {anomaly.severity}
                    </span>
                    <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                      {anomaly.count} ({anomaly.percentage}%)
                    </span>
                  </div>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#334155',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${anomaly.percentage}%`,
                    height: '100%',
                    backgroundColor: getSeverityColor(anomaly.severity),
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição de Protocolos */}
        <div style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem',
            color: '#F1F5F9'
          }}>
            Distribuição de Protocolos
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analysisData.patterns.protocolDistribution.map((protocol, index) => (
              <div key={index}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#F1F5F9', fontSize: '0.875rem' }}>
                    {protocol.protocol}
                  </span>
                  <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                    {formatNumber(protocol.count)} ({protocol.percentage}%)
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#334155',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${protocol.percentage}%`,
                    height: '100%',
                    backgroundColor: protocol.color,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Hosts com Anomalias */}
        <div style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem',
            color: '#F1F5F9'
          }}>
            Hosts com Maior Score de Anomalia
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analysisData.patterns.topHosts.map((host, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#0F172A',
                  borderRadius: '0.5rem',
                  borderLeft: `3px solid ${host.anomalyScore > 70 ? '#EF4444' : host.anomalyScore > 30 ? '#F59E0B' : '#10B981'}`
                }}
              >
                <div>
                  <p style={{ 
                    color: '#F1F5F9', 
                    fontSize: '0.875rem', 
                    fontWeight: '500',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {host.ip}
                  </p>
                  <p style={{ 
                    color: '#9CA3AF', 
                    fontSize: '0.75rem', 
                    margin: 0 
                  }}>
                    {host.alertCount} alertas
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ 
                    color: host.maxScore > 70 ? '#EF4444' : host.maxScore > 30 ? '#F59E0B' : '#10B981',
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    margin: 0 
                  }}>
                    {host.maxScore.toFixed(1)}
                  </p>
                  <p style={{ 
                    color: '#9CA3AF', 
                    fontSize: '0.75rem', 
                    margin: 0 
                  }}>
                    Score
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance do Modelo */}
        <div style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem',
            color: '#F1F5F9'
          }}>
            Performance do Modelo IA
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#0F172A',
              borderRadius: '0.5rem'
            }}>
              <div>
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
                  Precisão
                </p>
                <p style={{ color: '#F1F5F9', fontSize: '0.875rem', margin: 0 }}>
                  Taxa de acerto do modelo
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ 
                  color: '#10B981',
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  margin: 0 
                }}>
                  {analysisData.performance.modelAccuracy}%
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#0F172A',
              borderRadius: '0.5rem'
            }}>
              <div>
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
                  Falsos Positivos
                </p>
                <p style={{ color: '#F1F5F9', fontSize: '0.875rem', margin: 0 }}>
                  Alertas incorretos
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ 
                  color: '#F59E0B',
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  margin: 0 
                }}>
                  {analysisData.performance.falsePositiveRate}%
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#0F172A',
              borderRadius: '0.5rem'
            }}>
              <div>
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
                  Tempo de Detecção
                </p>
                <p style={{ color: '#F1F5F9', fontSize: '0.875rem', margin: 0 }}>
                    Velocidade de análise
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ 
                  color: '#3B82F6',
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  margin: 0 
                }}>
                  {analysisData.performance.detectionTime}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#0F172A',
              borderRadius: '0.5rem'
            }}>
              <div>
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
                  Velocidade de Processamento
                </p>
                <p style={{ color: '#F1F5F9', fontSize: '0.875rem', margin: 0 }}>
                    Throughput de dados
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ 
                  color: '#8B5CF6',
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  margin: 0 
                }}>
                  {analysisData.performance.processingSpeed}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tendências Horárias */}
      <div style={{
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginTop: '1.5rem'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          marginBottom: '1.5rem',
          color: '#F1F5F9'
        }}>
          Tendências das Últimas 24 Horas
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
          gap: '0.5rem' 
        }}>
          {analysisData.trends.hourly.map((hour, index) => (
            <div
              key={index}
              style={{
                textAlign: 'center',
                padding: '0.5rem',
                backgroundColor: '#0F172A',
                borderRadius: '0.5rem',
                border: index === new Date().getHours() ? '1px solid #3B82F6' : '1px solid #334155'
              }}
            >
              <p style={{ 
                color: '#9CA3AF', 
                fontSize: '0.75rem', 
                margin: '0 0 0.5rem 0' 
              }}>
                {hour.hour}h
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: '#334155',
                  borderRadius: '2px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(hour.normal / 1000) * 100}%`,
                    height: '100%',
                    backgroundColor: '#10B981',
                    borderRadius: '2px'
                  }}></div>
                </div>
                <div style={{
                  width: '100%',
                  height: '15px',
                  backgroundColor: '#334155',
                  borderRadius: '2px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(hour.anomalies / 100) * 100}%`,
                    height: '100%',
                    backgroundColor: '#F59E0B',
                    borderRadius: '2px'
                  }}></div>
                </div>
                <div style={{
                  width: '100%',
                  height: '10px',
                  backgroundColor: '#334155',
                  borderRadius: '2px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(hour.threats / 50) * 100}%`,
                    height: '100%',
                    backgroundColor: '#EF4444',
                    borderRadius: '2px'
                  }}></div>
                </div>
              </div>
              <p style={{ 
                color: '#6B7280', 
                fontSize: '0.625rem', 
                margin: '0.5rem 0 0 0' 
              }}>
                {hour.normal + hour.anomalies + hour.threats}
              </p>
            </div>
          ))}
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem',
          marginTop: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#10B981', 
              borderRadius: '2px' 
            }}></div>
            <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Normal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#F59E0B', 
              borderRadius: '2px' 
            }}></div>
            <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Anomalias</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#EF4444', 
              borderRadius: '2px' 
            }}></div>
            <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Ameaças</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
