import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

const useCountUp = (endValue, duration = 600) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const end = typeof endValue === 'number' && !isNaN(endValue) ? endValue : 0;
    
    if (end === 0) {
      setCount(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [endValue, duration]);

  return count;
};

export default function KpiCards({ 
  stats, 
  activeFilter, 
  onSelectKpi 
}) {
  const totalBidders = useCountUp(stats?.total_bidders || 0);
  const avgScore = useCountUp(stats?.avg_compliance_score || 0);
  const criticalHigh = useCountUp((stats?.risk_breakdown?.critical || 0) + (stats?.risk_breakdown?.high || 0));
  const pendingCount = stats?.pending_count !== undefined ? stats.pending_count : 0;
  const isAllPending = stats?.pending_count === stats?.total_bidders && (stats?.total_bidders || 0) > 0;

  const isTotalActive = activeFilter.type === 'ALL';
  const isScoreActive = activeFilter.type === 'HIGH_COMPLIANCE';
  const isPendingActive = activeFilter.type === 'STATUS' && activeFilter.value === 'PENDING';
  const isCriticalActive = activeFilter.type === 'RISK' && (activeFilter.value === 'CRITICAL_OR_HIGH' || activeFilter.value === 'CRITICAL');

  return (
    <div className="kpi-cards-grid">
      {/* 1. Total Enrolled */}
      <div 
        className={`glass-card kpi-card ${isTotalActive ? 'kpi-card-active' : ''}`}
        onClick={() => onSelectKpi('ALL')}
        role="button"
        tabIndex={0}
        title="Click to reset filters and view all enrolled bidders"
      >
        <div className="kpi-card-header">
          <span className="kpi-title">Total Enrolled Bidders</span>
          <div className="kpi-icon-box icon-navy">
            <Building2 size={18} />
          </div>
        </div>
        
        <div className="kpi-value-row">
          <span className="kpi-value">{stats ? totalBidders : '--'}</span>
          {isTotalActive && <span className="kpi-filter-tag">All Records</span>}
        </div>

        <div className="kpi-footer-row">
          <span className="kpi-subtext">GeM Master Registry Feed</span>
          <span className="kpi-click-hint">View All →</span>
        </div>
      </div>

      {/* 2. Avg Compliance Score */}
      <div 
        className={`glass-card kpi-card ${isScoreActive ? 'kpi-card-active' : ''}`}
        onClick={() => onSelectKpi('HIGH_COMPLIANCE')}
        role="button"
        tabIndex={0}
        title="Click to filter high compliance bidders (score ≥ 70%)"
      >
        <div className="kpi-card-header">
          <span className="kpi-title">Avg Compliance Score</span>
          <div className="kpi-icon-box icon-green">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="kpi-value-row">
          <span 
            className="kpi-value" 
            style={{ color: stats?.avg_compliance_score !== null ? '#1e3a5f' : 'var(--text-muted)' }}
          >
            {stats && stats.avg_compliance_score !== null ? `${avgScore}%` : '--'}
          </span>
          {isScoreActive && <span className="kpi-filter-tag tag-score">Score ≥ 70%</span>}
        </div>

        <div className="kpi-footer-row">
          <span className="kpi-subtext">
            {stats && stats.avg_compliance_score !== null 
              ? 'Multi-portal statutory average' 
              : 'Awaiting batch execution'}
          </span>
          <span className="kpi-click-hint">Filter High →</span>
        </div>
      </div>

      {/* 3. Pending Verification */}
      <div 
        className={`glass-card kpi-card ${isPendingActive ? 'kpi-card-active' : ''}`}
        onClick={() => onSelectKpi('PENDING')}
        role="button"
        tabIndex={0}
        title="Click to filter pending bidders awaiting verification"
      >
        <div className="kpi-card-header">
          <span className="kpi-title">Pending Verification</span>
          <div className="kpi-icon-box icon-slate">
            <Clock size={18} />
          </div>
        </div>

        <div className="kpi-value-row">
          <span 
            className="kpi-value" 
            style={{ color: pendingCount > 0 ? '#475569' : '#16a34a' }}
          >
            {stats ? pendingCount : '--'}
          </span>
          {isPendingActive && <span className="kpi-filter-tag tag-pending">Pending Only</span>}
        </div>

        <div className="kpi-footer-row">
          <span className="kpi-subtext">
            {pendingCount > 0 ? 'Awaiting cross-checks' : 'All profiles evaluated'}
          </span>
          <span className="kpi-click-hint">Filter Pending →</span>
        </div>
      </div>

      {/* 4. Critical / High Risk Flags */}
      <div 
        className={`glass-card kpi-card ${isCriticalActive ? 'kpi-card-active kpi-card-danger-active' : ''}`}
        onClick={() => onSelectKpi('CRITICAL_OR_HIGH')}
        role="button"
        tabIndex={0}
        title="Click to filter high and critical risk bidders"
      >
        <div className="kpi-card-header">
          <span className="kpi-title">Critical / High Risk Flags</span>
          <div className="kpi-icon-box icon-red">
            <ShieldAlert size={18} />
          </div>
        </div>

        <div className="kpi-value-row">
          <span 
            className="kpi-value" 
            style={{ color: criticalHigh > 0 && !isAllPending ? '#dc2626' : 'var(--text-muted)' }}
          >
            {stats ? (isAllPending ? '--' : criticalHigh) : '--'}
          </span>
          {isCriticalActive && <span className="kpi-filter-tag tag-critical">High & Critical</span>}
        </div>

        <div className="kpi-footer-row">
          <span className="kpi-subtext">
            {isAllPending ? 'Pending evaluation' : 'Requires officer scrutiny'}
          </span>
          <span className="kpi-click-hint text-red">Inspect Flags →</span>
        </div>
      </div>
    </div>
  );
}
