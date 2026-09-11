import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users
} from 'lucide-react';
import { api } from '../../utils/api';
import '../Dashboard/Dashboard.css';

export default function TendersView({ onSelectTender, onNavigateTab }) {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getTenders();
      setTenders(data);
    } catch (err) {
      console.error('Error loading tenders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTenderStatusBadge = (tender) => {
    const bidders = tender.tender_bidders || [];
    if (bidders.length === 0) return { label: 'No Bidders', class: 'badge-pending' };
    
    const hasRejected = bidders.some(tb => tb.overall_status === 'REJECTED' || tb.bidder?.risk_level === 'CRITICAL');
    if (hasRejected) return { label: 'Critical / Debarred', class: 'badge-critical' };

    const hasFlagged = bidders.some(tb => tb.overall_status === 'FLAGGED' || tb.bidder?.risk_level === 'HIGH' || tb.bidder?.risk_level === 'MEDIUM');
    if (hasFlagged) return { label: 'Flags Detected', class: 'badge-medium' };

    const allVerified = bidders.every(tb => tb.overall_status === 'VERIFIED' || tb.bidder?.verification_status === 'VERIFIED');
    if (allVerified) return { label: 'All Verified', class: 'badge-low' };

    return { label: `${bidders.length} Bids Staged`, class: 'badge-pending' };
  };

  return (
    <div className="dashboard-container">
      {/* Top Banner */}
      <div className="banner-glass">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>
            Tender Selection & Statutory Compliance Scope
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '680px', margin: 0 }}>
            Select an active procurement tender to inspect enrolled bids against tender-specific statutory criteria (e.g. OEM Authorization, MSME Udyam, Form GST REG-06, and Central Debarment lists).
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      <div className="tenders-grid" style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', marginTop: '10px' }}>
        {tenders.map((tender) => {
          const statusBadge = getTenderStatusBadge(tender);
          const enrolledCount = tender.tender_bidders?.length || 0;

          return (
            <div key={tender.id} className="glass-card stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#1e3a5f', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                    {tender.tender_id}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {tender.organisation}
                  </div>
                </div>
                <span className={`badge ${statusBadge.class}`}>
                  {statusBadge.label}
                </span>
              </div>
              
              <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tender.tender_title}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Users size={14} color="#64748b" />
                <span>{enrolledCount} {enrolledCount === 1 ? 'Bidder' : 'Bidders'} Enrolled</span>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {tender.required_checks && JSON.parse(tender.required_checks).map(check => (
                    <span key={check} style={{ fontSize: '0.7rem', padding: '3px 8px', backgroundColor: '#e2e8f0', borderRadius: '4px', fontWeight: 600, color: '#475569' }}>
                      {check}
                    </span>
                  ))}
                </div>
                <button 
                  className="btn btn-primary"
                  style={{ padding: '7px 16px', fontSize: '0.8rem' }}
                  onClick={() => {
                    if (onSelectTender) onSelectTender(tender.id);
                    if (onNavigateTab) onNavigateTab('bidders');
                  }}
                >
                  <span>Evaluate Bids</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
