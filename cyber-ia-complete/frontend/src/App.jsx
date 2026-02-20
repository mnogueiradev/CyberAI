import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Monitoring from './components/Monitoring';
import Alerts from './components/Alerts';
import Analysis from './components/Analysis';
import Reports from './components/Reports';
import Settings from './components/Settings';
import './index.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: 'dashboard' },
    { id: 'monitoring', name: 'Monitoramento', icon: 'network' },
    { id: 'alerts', name: 'Alertas', icon: 'warning' },
    { id: 'analysis', name: 'Análise', icon: 'analytics' },
    { id: 'reports', name: 'Relatórios', icon: 'document' },
    { id: 'settings', name: 'Configurações', icon: 'settings' }
  ];

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'dashboard': return '▣';
      case 'network': return '◉';
      case 'warning': return '▲';
      case 'analytics': return '▓';
      case 'document': return '◈';
      case 'settings': return '◉';
      default: return '○';
    }
  };

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
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0F172A',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: sidebarOpen ? '260px' : '70px',
        backgroundColor: '#1E293B',
        borderRight: '1px solid #334155',
        transition: 'width 0.3s ease',
        zIndex: 1000
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#3B82F6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            IA
          </div>
          {sidebarOpen && (
            <div>
              <h3 style={{ 
                color: '#F1F5F9', 
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: '600'
              }}>
                Cyber IA
              </h3>
              <p style={{ 
                color: '#94A3B8', 
                margin: '2px 0 0 0',
                fontSize: '0.75rem'
              }}>
                Security Platform
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ padding: '1rem 0' }}>
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                padding: sidebarOpen ? '0.875rem 1.5rem' : '0.875rem',
                border: 'none',
                backgroundColor: activeTab === item.id ? '#3B82F6' : 'transparent',
                color: activeTab === item.id ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: sidebarOpen ? '0.75rem' : '0',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                borderRadius: sidebarOpen ? '0.5rem' : '0',
                margin: sidebarOpen ? '0 0.5rem 0.25rem 0.5rem' : '0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.target.style.backgroundColor = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{getIcon(item.icon)}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            right: '1rem',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            color: '#F1F5F9',
            fontSize: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#4B5563';
            e.target.style.color = '#F1F5F9';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#374151';
            e.target.style.color = '#9CA3AF';
          }}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarOpen ? '260px' : '70px',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Top Header */}
        <header style={{
          backgroundColor: '#1E293B',
          borderBottom: '1px solid #334155',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ 
              color: '#F1F5F9', 
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              {navigation.find(item => item.id === activeTab)?.name || 'Dashboard'}
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              backgroundColor: '#10B981',
              borderRadius: '9999px',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#34D399',
                animation: 'pulse 2s ease-in-out infinite'
              }}></div>
              Sistema Ativo
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ 
              color: '#9CA3AF', 
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {currentTime}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#374151',
              borderRadius: '0.5rem',
              border: '1px solid #4B5563'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="16" height="16" fill="#D1D5DB" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span style={{ color: '#D1D5DB', fontSize: '0.875rem' }}>Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '2rem' }}>
          {activeTab === 'dashboard' && <Dashboard />}
          
          {activeTab === 'monitoring' && <Monitoring />}
          
          {activeTab === 'alerts' && <Alerts />}
          
          {activeTab === 'analysis' && <Analysis />}
          
          {activeTab === 'reports' && <Reports />}
          
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        button:hover {
          transform: translateY(-1px);
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default App;
