import React, { useState, useEffect } from 'react';
import { History, Shield, RefreshCw } from 'lucide-react';
import { api } from '../../utils/api';

export default function AuditView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs({ limit: 100 });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const formatTimestamp = (ts) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 className="section-title" style={{ margin: 0 }}>Statutory Procurement Audit Log</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Cryptographically-traceable ledger of automated verification runs, officer decisions, and certificate inspections.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadLogs} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="quick-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action / Event</th>
              <th>Actor</th>
              <th>Bidder ID</th>
              <th>Details & Justification</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td>
                    <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.actor}</td>
                  <td>{log.bidder_id ? `#${log.bidder_id}` : 'Global'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {log.details || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
