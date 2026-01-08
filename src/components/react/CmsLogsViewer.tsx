import { useState, useEffect, useRef } from 'react';
import '../../styles/cms-logs.scss';

interface LogsResponse {
  logs: string;
  timestamp: string;
  error?: string;
}

export default function CmsLogsViewer() {
  const [started, setStarted] = useState(false);
  const [varnishLogs, setVarnishLogs] = useState('Waiting for logs...');
  const [imgproxyLogs, setImgproxyLogs] = useState('Waiting for logs...');
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const varnishLogRef = useRef<HTMLDivElement>(null);
  const imgproxyLogRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const [varnishResponse, imgproxyResponse] = await Promise.all([
        fetch('/api/varnish-logs?lines=30'),
        fetch('/api/imgproxy-logs?lines=30')
      ]);

      const varnishData: LogsResponse = await varnishResponse.json();
      const imgproxyData: LogsResponse = await imgproxyResponse.json();

      if (varnishData.error) {
        setError(varnishData.error);
        setVarnishLogs(varnishData.logs || 'Error fetching logs');
      } else {
        setError(null);
        setVarnishLogs(varnishData.logs);
        // Auto-scroll to bottom
        setTimeout(() => {
          if (varnishLogRef.current) {
            varnishLogRef.current.scrollTop = varnishLogRef.current.scrollHeight;
          }
        }, 100);
      }

      if (imgproxyData.error) {
        setImgproxyLogs(imgproxyData.logs || 'Error fetching logs');
      } else {
        setImgproxyLogs(imgproxyData.logs);
        // Auto-scroll to bottom
        setTimeout(() => {
          if (imgproxyLogRef.current) {
            imgproxyLogRef.current.scrollTop = imgproxyLogRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setError('Network error');
    }
  };

  const handleStart = () => {
    setStarted(true);
    fetchLogs(); // Fetch immediately
    // Poll every 3 seconds
    intervalRef.current = setInterval(fetchLogs, 3000);
  };

  const handleStop = () => {
    setStarted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="cms-logs-container">
      <div className="cms-logs-header">
        <div className="command-box">
          <span className="command-prompt">$</span>
          <span className="command-text">docker logs -f strapi-varnish-cache strapi-imgproxy</span>
        </div>
        {!started && (
          <button className="start-button" onClick={handleStart}>
            ▶ Voir les logs
          </button>
        )}
        {started && (
          <div className="status-controls">
            <div className="status-badge">
              <span className="status-dot"></span>
              Live
            </div>
            <button className="stop-button" onClick={handleStop}>
              ⏹ Stop
            </button>
          </div>
        )}
      </div>

      {error && started && (
        <div className="error-banner">
          ⚠️ {error} - Assurez-vous que les containers Docker sont démarrés
        </div>
      )}

      {started && (
        <div className="logs-grid">
          <div className="log-panel">
            <div className="log-panel-header">
              <span className="service-icon">🚀</span>
              <span className="service-name">Varnish Cache</span>
              <span className="service-port">:8080</span>
            </div>
            <div className="log-content" ref={varnishLogRef}>
              <pre>{varnishLogs}</pre>
            </div>
          </div>

          <div className="log-panel">
            <div className="log-panel-header">
              <span className="service-icon">🖼️</span>
              <span className="service-name">Imgproxy</span>
              <span className="service-port">internal</span>
            </div>
            <div className="log-content" ref={imgproxyLogRef}>
              <pre>{imgproxyLogs}</pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
