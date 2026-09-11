import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  ArrowUpRight,
  RefreshCw,
  Clock,
  RotateCcw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Cell as PieCell
} from 'recharts';
import { api } from '../../utils/api';
import './Dashboard.css';

const useCountUp = (endValue, duration = 800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * endValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    if (endValue > 0) {
      window.requestAnimationFrame(step);
    } else {
      setCount(0);
    }
  }, [endValue, duration]);

  return count;
};

export default function DashboardView({ onSelectBidder, onNavigateTab }) {
  const [stats, setStats] = useState(null);
  const [recentBidders, setRecentBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, biddersRes] = await Promise.all([
        api.getBidderStats(),
        api.getBidders()
      ]);
      setStats(statsRes);
      setRecentBidders(biddersRes);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAll = async () => {
    try {
      setVerifyingAll(true);
      const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
      await Promise.all([
        api.runBatchVerification(),
        minDelay
      ]);
      await loadData();
    } catch (err) {
      console.error('Batch verification error:', err);
    } finally {
      setVerifyingAll(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      await api.resetVerification();
      await loadData();
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setResetting(false);
    }
  };

  const getRiskBadgeClass = (level) => {
    switch (level?.toUpperCase()) {
      case 'LOW': return 'badge-low';
      case 'MEDIUM': return 'badge-medium';
      case 'HIGH': return 'badge-high';
      case 'CRITICAL': return 'badge-critical';
      default: return 'badge-pending';
    }
  };

  const totalBidders = useCountUp(stats?.total_bidders || 0);
  const avgScore = useCountUp(stats?.avg_compliance_score || 0);
  const criticalHigh = useCountUp((stats?.risk_breakdown?.critical || 0) + (stats?.risk_breakdown?.high || 0));
  const pendingCount = stats?.pending_count !== undefined ? stats.pending_count : 0;
  const isAllPending = stats?.pending_count === stats?.total_bidders && (stats?.total_bidders || 0) > 0;

  const getScoreData = () => {
    const buckets = {
      '0-39 (Critical)': 0,
      '40-59 (High)': 0,
      '60-79 (Medium)': 0,
      '80-100 (Low)': 0
    };
    recentBidders.forEach(b => {
      if (b.overall_score === null || b.overall_score === undefined) return;
      const score = b.overall_score;
      if (score < 40) buckets['0-39 (Critical)']++;
      else if (score < 60) buckets['40-59 (High)']++;
      else if (score < 80) buckets['60-79 (Medium)']++;
      else buckets['80-100 (Low)']++;
    });
    return [
      { name: '0-39 (Critical)', count: buckets['0-39 (Critical)'], fill: '#dc2626' },
      { name: '40-59 (High)', count: buckets['40-59 (High)'], fill: '#ea580c' },
      { name: '60-79 (Medium)', count: buckets['60-79 (Medium)'], fill: '#d97706' },
      { name: '80-100 (Low)', count: buckets['80-100 (Low)'], fill: '#16a34a' }
    ];
  };

  const getRiskData = () => {
    const breakdown = stats?.risk_breakdown || {};
    return [
      { name: 'LOW', value: breakdown.low || 0, fill: '#16a34a' },
      { name: 'MEDIUM', value: breakdown.medium || 0, fill: '#d97706' },
      { name: 'HIGH', value: breakdown.high || 0, fill: '#ea580c' },
      { name: 'CRITICAL', value: breakdown.critical || 0, fill: '#dc2626' }
    ].filter(item => item.value > 0);
  };

  return (
    <div className="dashboard-container">
      {/* Top Banner */}
      <div className="banner-glass" style={{ position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '8px' }}>
            <span 
              className={`badge ${isAllPending ? 'badge-pending' : pendingCount > 0 ? 'badge-medium' : 'badge-low'}`} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '3px 10px', fontWeight: 600 }}
            >
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: isAllPending ? '#64748b' : pendingCount > 0 ? '#d97706' : '#16a34a' 
              }}></span>
              {isAllPending 
                ? `${stats?.total_bidders || 10} Bids Awaiting Statutory Verification` 
                : pendingCount > 0 
                  ? `${pendingCount} of ${stats?.total_bidders || 10} Bids Pending Verification` 
                  : 'All Registered Bids Fully Evaluated'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: '0 0 6px 0', color: '#1e3a5f', letterSpacing: '-0.01em' }}>
            Automated Statutory Compliance Intelligence
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '680px', margin: 0, lineHeight: 1.5 }}>
            Automated cross-verification of seller declarations against GSTN (REG-06), MCA21, MSME Udyam, Debarment Watchlist & OEM databases.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleReset} 
            disabled={verifyingAll || resetting}
            title="Reset all bidders to unverified state for demo testing"
            style={{ fontSize: '0.82rem', padding: '9px 14px' }}
          >
            <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
            <span>{resetting ? 'Resetting...' : 'Reset Demo State'}</span>
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={handleRunAll} 
            disabled={verifyingAll || resetting}
            style={{ fontSize: '0.82rem', padding: '9px 18px' }}
          >
            <Zap size={15} className={verifyingAll ? 'animate-pulse' : ''} />
            <span>{verifyingAll ? 'Verifying All Portals...' : 'Run Batch Verification'}</span>
          </button>
        </div>

        {verifyingAll && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: 'var(--primary-glow)' }}>
            <div className="progress-bar-indeterminate" />
          </div>
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-card-header">
            <span>Total Enrolled Bidders</span>
            <div className="stat-icon-wrapper" style={{ color: '#3b82f6' }}>
              <Building2 size={20} />
            </div>
          </div>
          <div className="stat-value">{stats ? totalBidders : '--'}</div>
          <div className="stat-subtext">GeM Seller Registry Feed</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card-header">
            <span>Avg Compliance Score</span>
            <div className="stat-icon-wrapper" style={{ color: '#10b981' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: stats?.avg_compliance_score !== null ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {stats && stats.avg_compliance_score !== null ? `${avgScore}%` : '--'}
          </div>
          <div className="stat-subtext">
            {stats && stats.avg_compliance_score !== null ? 'Statutory multi-portal average' : 'Awaiting batch verification'}
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card-header">
            <span>Pending Verification</span>
            <div className="stat-icon-wrapper" style={{ color: '#64748b' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: pendingCount > 0 ? '#64748b' : '#10b981' }}>
            {stats ? pendingCount : '--'}
          </div>
          <div className="stat-subtext">
            {pendingCount > 0 ? 'Awaiting statutory checks' : 'All bidder profiles verified'}
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card-header">
            <span>Critical / High Risk Flags</span>
            <div className="stat-icon-wrapper" style={{ color: '#ef4444' }}>
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: criticalHigh > 0 ? '#ef4444' : 'var(--text-muted)' }}>
            {stats ? (isAllPending ? '--' : criticalHigh) : '--'}
          </div>
          <div className="stat-subtext">
            {isAllPending ? 'Pending evaluation' : 'Requires officer inspection'}
          </div>
        </div>
      </div>

      {/* Charts or Unverified State Callout */}
      {isAllPending ? (
        <div className="glass-card" style={{ padding: '36px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(30, 58, 95, 0.08)', color: '#1e3a5f', marginBottom: '16px' }}>
            <Clock size={36} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '8px' }}>
            Bids Enrolled — Awaiting Statutory Cross-Verification
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '640px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
            All 10 bidder records are enrolled in the procurement database with unverified statutory credentials. 
            Click <strong>"Run Batch Verification"</strong> to execute automated cross-checks against GSTN, MCA21, MSME Udyam, Debarment Watchlist & OEM Authorization registries.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={handleRunAll} 
            disabled={verifyingAll}
            style={{ padding: '10px 24px' }}
          >
            <Zap size={16} />
            <span>Execute Batch Verification Now</span>
          </button>
        </div>
      ) : (
        <div className="charts-grid">
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 className="section-title">Score Distribution</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getScoreData()} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={110} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {getScoreData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 className="section-title">Risk Level Breakdown</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={getRiskData()} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={90} 
                    paddingAngle={5} 
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getRiskData().map((entry, index) => (
                      <PieCell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Bidder Registry Table */}
      <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: 'var(--border-glass)' }}>
            <div className="progress-bar-indeterminate" style={{ backgroundColor: 'var(--primary)' }} />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>
              Live Bidder Evaluation Overview
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Review compliance scores, risk classifications, and statutory inspection status.
            </div>
          </div>
          <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="quick-table">
            <thead>
              <tr>
                <th>Bidder / Organization</th>
                <th>GeM Seller ID</th>
                <th>GSTIN</th>
                <th>MSME Type</th>
                <th>Compliance Score</th>
                <th>Risk Tier</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentBidders.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.company_name}</div>
                    {b.trade_name && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Trade: {b.trade_name}
                      </div>
                    )}
                  </td>
                  <td><span className="font-mono">{b.gem_seller_id}</span></td>
                  <td><span className="font-mono">{b.gstin}</span></td>
                  <td>{b.msme_category || 'N/A'}</td>
                  <td>
                    <div style={{ 
                      fontWeight: 700, 
                      color: b.overall_score === null 
                        ? 'var(--text-muted)' 
                        : b.overall_score >= 80 
                          ? '#10b981' 
                          : b.overall_score >= 50 
                            ? '#f59e0b' 
                            : '#ef4444' 
                    }}>
                      {b.overall_score !== null && b.overall_score !== undefined ? `${b.overall_score}%` : '--'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getRiskBadgeClass(b.risk_level)}`}>
                      {b.risk_level}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${b.verification_status === 'VERIFIED' ? 'badge-low' : b.verification_status === 'FLAGGED' ? 'badge-medium' : b.verification_status === 'REJECTED' ? 'badge-critical' : 'badge-pending'}`}>
                      {b.verification_status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`btn ${b.verification_status === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      onClick={() => {
                        if (onSelectBidder) onSelectBidder(b.id);
                        if (onNavigateTab) onNavigateTab('bidders');
                      }}
                    >
                      <span>{b.verification_status === 'PENDING' ? 'Verify Now' : 'Inspect'}</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
