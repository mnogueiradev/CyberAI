import React, { useState } from 'react';
import Dashboard from './components/Dashboard';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', name: '🏠 Dashboard', icon: '🏠' },
    { id: 'monitoring', name: '🌐 Monitoramento', icon: '🌐' },
    { id: 'alerts', name: '⚠️ Alertas', icon: '⚠️' },
    { id: 'analysis', name: '📈 Análise', icon: '📈' },
    { id: 'reports', name: '📄 Relatórios', icon: '📄' },
    { id: 'settings', name: '⚙️ Config', icon: '⚙️' },
  ];

  const getCurrentTime = () => {
    return new Date().toLocaleString('pt-BR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1E1E1E' }}>
      {/* Header Kaspersky-style */}
      <header className="cyber-header">
        <div className="container">
          <div className="flex">
            {/* Logo e Nome */}
            <div className="flex space-x-3">
              <div className="logo-icon">
                <svg className="w-6 h-6" style={{ color: '#00A652' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>CYBER IA</h1>
                <p style={{ color: '#00A652', fontSize: '0.75rem', fontWeight: '500' }}>PROTEÇÃO ATIVA</p>
              </div>
            </div>

            {/* Data/Hora */}
            <div style={{ display: 'none' }} className="hidden md:block">
              <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>{currentTime}</div>
            </div>

            {/* Status de Proteção */}
            <div className="flex space-x-4">
              <div className="flex space-x-2">
                <div style={{ 
                  width: '0.5rem', 
                  height: '0.5rem', 
                  backgroundColor: '#00A652', 
                  borderRadius: '50%',
                  animation: 'pulse-slow 3s ease-in-out infinite'
                }}></div>
                <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>Proteção Ativa</span>
              </div>
              <div style={{ 
                width: '2rem', 
                height: '2rem', 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav>
        <div className="container">
          <div className="nav-items">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ padding: '1.5rem 0' }}>
        {activeTab === 'dashboard' && <Dashboard />}
        
        {activeTab === 'monitoring' && (
          <div className="cyber-card p-8">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Monitoramento de Rede</h2>
            <p style={{ color: '#D1D5DB' }}>Monitoramento em desenvolvimento...</p>
          </div>
        )}
        
        {activeTab === 'alerts' && (
          <div className="cyber-card p-8">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Painel de Alertas</h2>
            <p style={{ color: '#D1D5DB' }}>Alertas em desenvolvimento...</p>
          </div>
        )}
        
        {activeTab === 'analysis' && (
          <div className="cyber-card p-8">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Análise Avançada</h2>
            <p style={{ color: '#D1D5DB' }}>Análise em desenvolvimento...</p>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="cyber-card p-8">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Relatórios</h2>
            <p style={{ color: '#D1D5DB' }}>Relatórios em desenvolvimento...</p>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="cyber-card p-8">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Configurações</h2>
            <p style={{ color: '#D1D5DB' }}>Configurações em desenvolvimento...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="flex">
            <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
              © 2026 Cyber IA - Network Security Analysis
            </div>
            <div className="flex space-x-4">
              <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                Versão 1.0.0
              </div>
              <div className="flex space-x-1">
                <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#00A652', borderRadius: '50%' }}></div>
                <span style={{ color: '#00A652', fontSize: '0.875rem', fontWeight: '500' }}>Online</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
