import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  FileWarning, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function PriorityActions({ bidders, onInspectBidder, onFilterByBidder }) {
  // Dynamically derive actionable priority issues from real bidder records
  const priorityItems = [];

  bidders.forEach(b => {
    // 1. Critical risk bidders
    if (b.risk_level === 'CRITICAL') {
      priorityItems.push({
        id: `crit-${b.id}`,
        bidderId: b.id,
        bidderName: b.company_name,
        sellerId: b.gem_seller_id,
        severity: 'CRITICAL',
        badgeClass: 'badge-critical',
        category: 'DEBARMENT & WATCHLIST',
        icon: AlertOctagon,
        title: `Critical Compliance Risk (${b.overall_score !== null ? `${b.overall_score}%` : 'Unverified'})`,
        detail: b.discrepancy_count > 0 
          ? `${b.discrepancy_count} statutory discrepancies detected. Immediate disqualification review required under GFR Rule 151.`
          : `High statutory non-compliance detected. Review seller debarment and portal verification history.`,
        actionLabel: 'Inspect Dossier'
      });
    } 
    // 2. High risk bidders
    else if (b.risk_level === 'HIGH') {
      priorityItems.push({
        id: `high-${b.id}`,
        bidderId: b.id,
        bidderName: b.company_name,
        sellerId: b.gem_seller_id,
        severity: 'HIGH',
        badgeClass: 'badge-high',
        category: 'STATUTORY MISMATCH',
        icon: AlertTriangle,
        title: `High Risk Variance (Score: ${b.overall_score}%)`,
        detail: `Portal verification detected discrepancies in statutory filings (GSTIN: ${b.gstin}). Officer review needed before bid acceptance.`,
        actionLabel: 'Review Discrepancies'
      });
    }
    // 3. Flagged status with Medium risk
    else if (b.verification_status === 'FLAGGED' && b.risk_level !== 'CRITICAL' && b.risk_level !== 'HIGH') {
      priorityItems.push({
        id: `flag-${b.id}`,
        bidderId: b.id,
        bidderName: b.company_name,
        sellerId: b.gem_seller_id,
        severity: 'MEDIUM',
        badgeClass: 'badge-medium',
        category: 'DOCUMENT DISCREPANCY',
        icon: FileWarning,
        title: `Flagged Statutory Verification`,
        detail: `${b.discrepancy_count} field variance(s) recorded in seller registration checks.`,
        actionLabel: 'Inspect Check'
      });
    }
  });

  // Limit to top 4 most critical to maintain high density
  const visibleItems = priorityItems.slice(0, 4);

  if (visibleItems.length === 0) {
    return (
      <div className="glass-card priority-actions-panel">
        <div className="priority-header">
          <div className="priority-title-group">
            <CheckCircle2 size={18} className="text-emerald" />
            <h3 className="section-title" style={{ margin: 0 }}>Priority Compliance Actions</h3>
          </div>
          <span className="priority-count-tag zero">0 Critical Issues Pending</span>
        </div>
        <div className="priority-clean-state">
          <CheckCircle2 size={24} className="text-emerald" />
          <div>
            <div className="clean-state-title">All Statutory Tolerances Satisfied</div>
            <div className="clean-state-subtext">No critical or high-risk non-compliance alerts requiring immediate officer intervention.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card priority-actions-panel">
      <div className="priority-header">
        <div className="priority-title-group">
          <ShieldAlert size={18} className="text-red" />
          <h3 className="section-title" style={{ margin: 0 }}>
            Priority Compliance Actions ({priorityItems.length} Urgent Items)
          </h3>
        </div>
        <span className="priority-count-tag active">
          Requires Procurement Officer Resolution
        </span>
      </div>

      <div className="priority-actions-list">
        {visibleItems.map(item => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              className={`priority-action-row severity-${item.severity.toLowerCase()}`}
              onClick={() => onInspectBidder(item.bidderId)}
              role="button"
              tabIndex={0}
            >
              <div className="priority-icon-column">
                <div className={`priority-icon-wrapper ${item.severity.toLowerCase()}`}>
                  <Icon size={16} />
                </div>
              </div>

              <div className="priority-content-column">
                <div className="priority-item-meta">
                  <span className={`badge ${item.badgeClass} priority-badge`}>
                    {item.severity}
                  </span>
                  <span className="priority-category">{item.category}</span>
                  <span className="priority-divider">•</span>
                  <span className="priority-seller-id font-mono">{item.sellerId}</span>
                </div>

                <div className="priority-item-title">
                  <span className="priority-company">{item.bidderName}:</span> {item.title}
                </div>
                
                <div className="priority-item-detail">
                  {item.detail}
                </div>
              </div>

              <div className="priority-action-column">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-inspect-priority"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectBidder(item.bidderId);
                  }}
                >
                  <span>{item.actionLabel}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
