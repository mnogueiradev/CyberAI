import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Monitoring = () => {
  const [hosts, setHosts] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getHosts();
      setHosts(data);
    } catch (error) {
      console.error('Error fetching hosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHostClick = async (host) => {
    try {
      const details = await apiService.getHostDetails(host.ip);
      setSelectedHost(details);
    } catch (error) {
      console.error('Error fetching host details:', error);
    }
  };

  const filteredHosts = hosts.filter(host => {
    const matchesSearch = host.ip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || host.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe':
        return '#10B981';
      case 'suspicious':
        return '#F59E0B';
      case 'dangerous':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe':
        return '✅';
      case 'suspicious':
        return '⚠️';
      case 'dangerous':
        return '🚨';
      default:
        return '❓';
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
            border: '3px solid #3B82F6', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          Carregando hosts monitorados...
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
            Monitoramento de Rede
          </h2>
          <p style={{ color: '#9CA3AF', margin: 0 }}>
            {hosts.length} hosts monitorados em tempo real
          </p>
        </div>
        
        <button
          onClick={fetchHosts}
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

      {/* Filtros */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Buscar por IP..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
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
          <option value="all">Todos Status</option>
          <option value="safe">Seguros</option>
          <option value="suspicious">Suspeitos</option>
          <option value="dangerous">Perigosos</option>
        </select>
      </div>

      {/* Grid de Hosts */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {filteredHosts.map((host) => (
          <div
            key={host.id}
            onClick={() => handleHostClick(host)}
            style={{
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderLeft: `4px solid ${getStatusColor(host.status)}`
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  margin: 0,
                  color: '#F1F5F9'
                }}>
                  {host.ip}
                </h3>
                <p style={{ 
                  color: '#9CA3AF', 
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.875rem'
                }}>
                  {getStatusIcon(host.status)} {host.status.charAt(0).toUpperCase() + host.status.slice(1)}
                </p>
              </div>
              
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(host.status),
                boxShadow: `0 0 8px ${getStatusColor(host.status)}`
              }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ color: '#6B7280', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>
                  Tráfego
                </p>
                <p style={{ color: '#F1F5F9', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  {host.trafficCount}
                </p>
              </div>
              
              <div>
                <p style={{ color: '#6B7280', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>
                  Score Anomalia
                </p>
                <p style={{ 
                  color: host.anomalyScore > 70 ? '#EF4444' : host.anomalyScore > 30 ? '#F59E0B' : '#10B981',
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  margin: 0 
                }}>
                  {host.anomalyScore.toFixed(1)}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: '#6B7280', fontSize: '0.75rem', margin: '0 0 0.5rem 0' }}>
                Protocolos
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {host.protocols.map((protocol, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#334155',
                      color: '#9CA3AF',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    {protocol}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes */}
      {selectedHost && (
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
          onClick={() => setSelectedHost(null)}
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
                Detalhes do Host: {selectedHost.ip}
              </h3>
              
              <button
                onClick={() => setSelectedHost(null)}
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
                    Status
                  </p>
                  <p style={{ 
                    color: getStatusColor(selectedHost.status), 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    margin: 0 
                  }}>
                    {getStatusIcon(selectedHost.status)} {selectedHost.status.charAt(0).toUpperCase() + selectedHost.status.slice(1)}
                  </p>
                </div>

                <div style={{
                  backgroundColor: '#0F172A',
                  padding: '1rem',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                    Score de Anomalia
                  </p>
                  <p style={{ 
                    color: selectedHost.anomalyScore > 70 ? '#EF4444' : selectedHost.anomalyScore > 30 ? '#F59E0B' : '#10B981',
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    margin: 0 
                  }}>
                    {selectedHost.anomalyScore.toFixed(1)}
                  </p>
                </div>
              </div>

              {selectedHost.details && (
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
                    Detalhes da Análise
                  </h4>
                  
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#9CA3AF' }}>Tipo de Anomalia:</span>
                      <span style={{ color: '#F1F5F9' }}>{selectedHost.details.anomalyType}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#9CA3AF' }}>Score Isolation Forest:</span>
                      <span style={{ color: '#F1F5F9' }}>{selectedHost.details.isoScore?.toFixed(3) || 'N/A'}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#9CA3AF' }}>Erro Autoencoder:</span>
                      <span style={{ color: '#F1F5F9' }}>{selectedHost.details.aeMse?.toFixed(2) || 'N/A'}</span>
                    </div>
                    
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                        Descrição
                      </p>
                      <p style={{ color: '#F1F5F9', lineHeight: '1.6', margin: 0 }}>
                        {selectedHost.details.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Monitoring;
