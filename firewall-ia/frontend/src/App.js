import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [status, setStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, alertsRes, blockedRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/status`),
        fetch(`${API_URL}/api/alerts?limit=50`),
        fetch(`${API_URL}/api/blocked`),
        fetch(`${API_URL}/api/stats`)
      ]);

      setStatus(await statusRes.json());
      setAlerts(await alertsRes.json());
      setBlockedIPs((await blockedRes.json()).blocked_ips || []);
      setStats(await statsRes.json());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.container}><h1>Loading...</h1></div>;
  if (error) return <div style={styles.container}><h1>Error: {error}</h1></div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🛡️ Firewall IA</h1>
        <p style={styles.subtitle}>AI-Powered Network Security with Snort Integration</p>
      </header>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>System Status</h2>
          <div style={styles.statusItem}>
            <span>Model:</span>
            <span style={{color: status?.model_loaded ? '#4ade80' : '#f87171'}}>
              {status?.model_loaded ? 'Loaded' : 'Not Loaded'}
            </span>
          </div>
          <div style={styles.statusItem}>
            <span>Blocked IPs:</span>
            <span>{blockedIPs.length}</span>
          </div>
        </div>

        <div style={styles.card}>
          <h2>Statistics</h2>
          <div style={styles.statusItem}>
            <span>Total Alerts:</span>
            <span>{stats?.alerts?.total || 0}</span>
          </div>
          <div style={styles.statusItem}>
            <span>Model Type:</span>
            <span>{stats?.model?.type || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h2>Recent Alerts ({alerts.length})</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Source IP</th>
                <th>Dest IP</th>
                <th>Attack Type</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {alerts.slice(-20).reverse().map((alert, i) => (
                <tr key={i} style={styles.row}>
                  <td>{alert.timestamp?.slice(0, 16) || 'N/A'}</td>
                  <td>{alert.src_ip || 'N/A'}</td>
                  <td>{alert.dst_ip || 'N/A'}</td>
                  <td>{alert.attack_type || alert.message?.slice(0, 30) || 'Unknown'}</td>
                  <td style={{color: getSeverityColor(alert.severity || alert.priority)}}>
                    {alert.severity || `P${alert.priority}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {blockedIPs.length > 0 && (
        <div style={styles.section}>
          <h2>Blocked IPs ({blockedIPs.length})</h2>
          <ul style={styles.list}>
            {blockedIPs.map((block, i) => (
              <li key={i} style={styles.listItem}>
                <strong>{block.ip}</strong> - Expires: {new Date(block.expires_at).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer style={styles.footer}>
        <p>Firewall IA v1.0.0 | Snort + Machine Learning</p>
      </footer>
    </div>
  );
}

const getSeverityColor = (severity) => {
  if (typeof severity === 'number') {
    return severity <= 2 ? '#f87171' : severity === 3 ? '#fbbf24' : '#4ade80';
  }
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return '#f87171';
    case 'HIGH': return '#fb923c';
    case 'MEDIUM': return '#fbbf24';
    default: return '#4ade80';
  }
};

const styles = {
  container: { minHeight: '100vh', background: '#1a1a2e', color: '#eee', padding: '20px' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { fontSize: '2.5rem', margin: '0 0 10px 0', color: '#60a5fa' },
  subtitle: { color: '#9ca3af', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { background: '#1e293b', borderRadius: '8px', padding: '20px' },
  statusItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' },
  section: { background: '#1e293b', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  row: { borderBottom: '1px solid #334155' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { padding: '10px 0', borderBottom: '1px solid #334155' },
  footer: { textAlign: 'center', marginTop: '40px', color: '#6b7280' }
};

export default App;
