import React from 'react';
import { 
  Zap, 
  RotateCcw, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Activity,
  Server
} from 'lucide-react';

export default function CommandHeader({ 
  stats, 
  lastVerifiedTime, 
  verifyingAll, 
  resetting, 
  onRunBatchVerification, 
  onResetDemo, 
  onReviewCritical 
}) {
  const totalBidders = stats?.total_bidders || 0;
  const pendingCount = stats?.pending_count !== undefined ? stats.pending_count : 0;
  const criticalHigh = (stats?.risk_breakdown?.critical || 0) + (stats?.risk_breakdown?.high || 0);
  const isAllPending = stats?.pending_count === stats?.total_bidders && totalBidders > 0;

  return (
    <div className="command-header-panel">
      <div className="command-header-top">
        <div className="command-header-title-block">
          <div className="command-system-status-row">
            <span className="system-pill">
              <span className="live-dot" />
              <span className="system-pill-text">Live Registry Feed</span>
            </span>
            <span className="system-divider">•</span>
            <span className="portal-status">
              <Server size={12} className="portal-icon" />
              GSTN • MCA21 • Udyam • Debarment Online
            </span>
            {lastVerifiedTime && (
              <>
                <span className="system-divider">•</span>
                <span className="timestamp-info">
                  <Clock size={12} />
                  Last verified: {lastVerifiedTime}
                </span>
              </>
            )}
          </div>

          <h1 className="command-main-title">
            Procurement Compliance Command Center
          </h1>
          <p className="command-subtext">
            Automated statutory cross-verification of seller declarations against official registries under General Financial Rules (GFR) 2017.
          </p>
        </div>

        <div className="command-actions-block">
          <button 
            type="button"
            className="btn btn-secondary action-btn-compact" 
            onClick={onResetDemo} 
            disabled={verifyingAll || resetting}
            title="Reset bidder evaluations to unverified state for testing"
          >
            <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
            <span>{resetting ? 'Resetting...' : 'Reset Demo'}</span>
          </button>

          <button 
            type="button"
            className={`btn ${criticalHigh > 0 ? 'btn-critical-alert' : 'btn-secondary'} action-btn-compact`}
            onClick={onReviewCritical}
            disabled={verifyingAll}
            title="Focus on critical & high risk compliance flags"
          >
            <ShieldAlert size={14} />
            <span>Review Critical Issues ({isAllPending ? 0 : criticalHigh})</span>
          </button>
          
          <button 
            type="button"
            className="btn btn-primary action-btn-primary" 
            onClick={onRunBatchVerification} 
            disabled={verifyingAll || resetting}
          >
            <Zap size={15} className={verifyingAll ? 'animate-pulse' : ''} />
            <span>{verifyingAll ? 'Executing Multi-Portal Checks...' : 'Run Batch Verification'}</span>
          </button>
        </div>
      </div>

      {/* Operational Summary Strip */}
      <div className="command-metrics-strip">
        <div className="strip-item">
          <span className="strip-label">Evaluated Bids:</span>
          <span className="strip-value">
            {totalBidders - pendingCount} / {totalBidders}
          </span>
          <span className="strip-tag tag-neutral">
            {pendingCount === 0 && totalBidders > 0 ? '100% Verified' : `${pendingCount} In-Flight`}
          </span>
        </div>

        <div className="strip-item">
          <span className="strip-label">Statutory Portals:</span>
          <span className="strip-value text-emerald">5 Connected</span>
          <span className="strip-tag tag-success">Active API Bridge</span>
        </div>

        <div className="strip-item">
          <span className="strip-label">Compliance Tolerance:</span>
          <span className="strip-value text-amber">Strict (Rule 144)</span>
          <span className="strip-tag tag-warning">Audited</span>
        </div>

        <div className="strip-item strip-item-right">
          <span className="strip-label">Overall Status:</span>
          <span className={`strip-status-pill ${criticalHigh > 0 && !isAllPending ? 'status-pill-alert' : 'status-pill-normal'}`}>
            {isAllPending ? 'Awaiting Verification' : criticalHigh > 0 ? `${criticalHigh} Non-Compliant Flags` : 'Clean Compliance State'}
          </span>
        </div>
      </div>

      {verifyingAll && (
        <div className="command-header-progress">
          <div className="progress-bar-indeterminate" />
        </div>
      )}
    </div>
  );
}
