import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    general: {
      systemName: 'Cyber IA',
      refreshInterval: 30,
      autoRefresh: true,
      theme: 'dark',
      language: 'pt-BR'
    },
    monitoring: {
      maxHostsDisplay: 100,
      alertThreshold: 70,
      enableRealTime: true,
      logLevel: 'info',
      dataRetention: 30
    },
    alerts: {
      emailNotifications: false,
      smsNotifications: false,
      webhookUrl: '',
      alertCooldown: 300,
      severityFilter: ['high', 'medium']
    },
    analysis: {
      modelAccuracy: 70,
      falsePositiveRate: 5,
      enableAutoML: false,
      retrainingInterval: 7,
      featureSelection: true
    },
    api: {
      rateLimit: 1000,
      timeout: 30,
      enableCors: true,
      apiKeyRequired: false,
      logRequests: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Buscar configurações do backend (se existirem)
      const response = await apiService.getSettings().catch(() => null);
      if (response) {
        setSettings(response);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // Salvar configurações no backend
      await apiService.updateSettings(settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = async () => {
    try {
      setLoading(true);
      // Resetar para configurações padrão
      const defaultSettings = {
        general: {
          systemName: 'Cyber IA',
          refreshInterval: 30,
          autoRefresh: true,
          theme: 'dark',
          language: 'pt-BR'
        },
        monitoring: {
          maxHostsDisplay: 100,
          alertThreshold: 70,
          enableRealTime: true,
          logLevel: 'info',
          dataRetention: 30
        },
        alerts: {
          emailNotifications: false,
          smsNotifications: false,
          webhookUrl: '',
          alertCooldown: 300,
          severityFilter: ['high', 'medium']
        },
        analysis: {
          modelAccuracy: 70,
          falsePositiveRate: 5,
          enableAutoML: false,
          retrainingInterval: 7,
          featureSelection: true
        },
        api: {
          rateLimit: 1000,
          timeout: 30,
          enableCors: true,
          apiKeyRequired: false,
          logRequests: true
        }
      };
      setSettings(defaultSettings);
      await apiService.updateSettings(defaultSettings);
      setSaveStatus('reset');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error resetting settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'Geral', icon: '⚙️' },
    { id: 'monitoring', name: 'Monitoramento', icon: '🌐' },
    { id: 'alerts', name: 'Alertas', icon: '🚨' },
    { id: 'analysis', name: 'Análise', icon: '📈' },
    { id: 'api', name: 'API', icon: '🔌' }
  ];

  const renderGeneralSettings = () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Nome do Sistema
        </label>
        <input
          type="text"
          value={settings.general.systemName}
          onChange={(e) => handleSettingChange('general', 'systemName', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Intervalo de Atualização (segundos)
        </label>
        <input
          type="number"
          value={settings.general.refreshInterval}
          onChange={(e) => handleSettingChange('general', 'refreshInterval', parseInt(e.target.value))}
          min="5"
          max="300"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          <input
            type="checkbox"
            checked={settings.general.autoRefresh}
            onChange={(e) => handleSettingChange('general', 'autoRefresh', e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          Atualização Automática
        </label>
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Tema
        </label>
        <select
          value={settings.general.theme}
          onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <option value="dark">🌙 Escuro</option>
          <option value="light">☀️ Claro</option>
          <option value="auto">🔄 Automático</option>
        </select>
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Idioma
        </label>
        <select
          value={settings.general.language}
          onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <option value="pt-BR">🇧🇷 Português (Brasil)</option>
          <option value="en-US">🇺🇸 English (US)</option>
          <option value="es-ES">🇪🇸 Español</option>
        </select>
      </div>
    </div>
  );

  const renderMonitoringSettings = () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Máximo de Hosts Exibidos
        </label>
        <input
          type="number"
          value={settings.monitoring.maxHostsDisplay}
          onChange={(e) => handleSettingChange('monitoring', 'maxHostsDisplay', parseInt(e.target.value))}
          min="10"
          max="1000"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Limiar de Alerta (%)
        </label>
        <input
          type="number"
          value={settings.monitoring.alertThreshold}
          onChange={(e) => handleSettingChange('monitoring', 'alertThreshold', parseInt(e.target.value))}
          min="0"
          max="100"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          <input
            type="checkbox"
            checked={settings.monitoring.enableRealTime}
            onChange={(e) => handleSettingChange('monitoring', 'enableRealTime', e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          Monitoramento em Tempo Real
        </label>
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Nível de Log
        </label>
        <select
          value={settings.monitoring.logLevel}
          onChange={(e) => handleSettingChange('monitoring', 'logLevel', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <option value="debug">🔍 Debug</option>
          <option value="info">ℹ️ Info</option>
          <option value="warning">⚠️ Warning</option>
          <option value="error">❌ Error</option>
        </select>
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Retenção de Dados (dias)
        </label>
        <input
          type="number"
          value={settings.monitoring.dataRetention}
          onChange={(e) => handleSettingChange('monitoring', 'dataRetention', parseInt(e.target.value))}
          min="1"
          max="365"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
      </div>
    </div>
  );

  const renderAlertsSettings = () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          <input
            type="checkbox"
            checked={settings.alerts.emailNotifications}
            onChange={(e) => handleSettingChange('alerts', 'emailNotifications', e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          Notificações por E-mail
        </label>
      </div>

      <div>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          <input
            type="checkbox"
            checked={settings.alerts.smsNotifications}
            onChange={(e) => handleSettingChange('alerts', 'smsNotifications', e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          Notificações por SMS
        </label>
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          URL do Webhook
        </label>
        <input
          type="url"
          value={settings.alerts.webhookUrl}
          onChange={(e) => handleSettingChange('alerts', 'webhookUrl', e.target.value)}
          placeholder="https://api.example.com/webhook"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Tempo de Espera entre Alertas (segundos)
        </label>
        <input
          type="number"
          value={settings.alerts.alertCooldown}
          onChange={(e) => handleSettingChange('alerts', 'alertCooldown', parseInt(e.target.value))}
          min="0"
          max="3600"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Filtro de Severidade
        </label>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['high', 'medium', 'low'].map(severity => (
            <label key={severity} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: '#F1F5F9', 
              fontSize: '0.875rem', 
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.alerts.severityFilter.includes(severity)}
                onChange={(e) => {
                  const newFilter = e.target.checked
                    ? [...settings.alerts.severityFilter, severity]
                    : settings.alerts.severityFilter.filter(s => s !== severity);
                  handleSettingChange('alerts', 'severityFilter', newFilter);
                }}
                style={{ width: '16px', height: '16px' }}
              />
              {severity === 'high' ? '🚨 Alto' : severity === 'medium' ? '⚠️ Médio' : 'ℹ️ Baixo'}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalysisSettings = () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Precisão Mínima do Modelo (%)
        </label>
        <input
          type="number"
          value={settings.analysis.modelAccuracy}
          onChange={(e) => handleSettingChange('analysis', 'modelAccuracy', parseInt(e.target.value))}
          min="0"
          max="100"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Taxa Máxima de Falsos Positivos (%)
        </label>
        <input
          type="number"
          value={settings.analysis.falsePositiveRate}
          onChange={(e) => handleSettingChange('analysis', 'falsePositiveRate', parseInt(e.target.value))}
          min="0"
          max="50"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          <input
            type="checkbox"
            checked={settings.analysis.enableAutoML}
            onChange={(e) => handleSettingChange('analysis', 'enableAutoML', e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          Habilitar AutoML
        </label>
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Intervalo de Retreinamento (dias)
        </label>
        <input
          type="number"
          value={settings.analysis.retrainingInterval}
          onChange={(e) => handleSettingChange('analysis', 'retrainingInterval', parseInt(e.target.value))}
          min="1"
          max="90"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          <input
            type="checkbox"
            checked={settings.analysis.featureSelection}
            onChange={(e) => handleSettingChange('analysis', 'featureSelection', e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          Seleção Automática de Features
        </label>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Limite de Requisições (por minuto)
        </label>
        <input
          type="number"
          value={settings.api.rateLimit}
          onChange={(e) => handleSettingChange('api', 'rateLimit', parseInt(e.target.value))}
          min="10"
          max="10000"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          Timeout (segundos)
        </label>
        <input
          type="number"
          value={settings.api.timeout}
          onChange={(e) => handleSettingChange('api', 'timeout', parseInt(e.target.value))}
          min="5"
          max="300"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: '#F1F5F9',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          <input
            type="checkbox"
            checked={settings.api.enableCors}
            onChange={(e) => handleSettingChange('api', 'enableCors', e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          Habilitar CORS
        </label>
      </div>

      <div>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          <input
            type="checkbox"
            checked={settings.api.apiKeyRequired}
            onChange={(e) => handleSettingChange('api', 'apiKeyRequired', e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          Requerir API Key
        </label>
      </div>

      <div>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#F1F5F9', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          <input
            type="checkbox"
            checked={settings.api.logRequests}
            onChange={(e) => handleSettingChange('api', 'logRequests', e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          Log de Requisições
        </label>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'monitoring':
        return renderMonitoringSettings();
      case 'alerts':
        return renderAlertsSettings();
      case 'analysis':
        return renderAnalysisSettings();
      case 'api':
        return renderApiSettings();
      default:
        return renderGeneralSettings();
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
            border: '3px solid #6B7280', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          Carregando configurações...
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
            Configurações do Sistema
          </h2>
          <p style={{ color: '#9CA3AF', margin: 0 }}>
            Personalize as configurações do Cyber IA
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={resetSettings}
            style={{
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#DC2626'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#EF4444'}
          >
            🔄 Restaurar Padrão
          </button>
          
          <button
            onClick={saveSettings}
            style={{
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}
          >
            💾 Salvar Configurações
          </button>
        </div>
      </div>

      {/* Status Message */}
      {saveStatus && (
        <div style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          {saveStatus === 'success' && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              ✅ Configurações salvas com sucesso!
            </div>
          )}
          {saveStatus === 'error' && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              ❌ Erro ao salvar configurações. Tente novamente.
            </div>
          )}
          {saveStatus === 'reset' && (
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              🔄 Configurações restauradas para o padrão!
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Sidebar */}
        <div>
          <div style={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: activeTab === tab.id ? '#3B82F6' : 'transparent',
                    color: '#F1F5F9',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = '#334155';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <div style={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: '2rem'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '1.5rem',
              color: '#F1F5F9'
            }}>
              {tabs.find(tab => tab.id === activeTab)?.name}
            </h3>
            
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
