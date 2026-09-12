import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCw, 
  ExternalLink, 
  FileText, 
  Clock, 
  Check
} from 'lucide-react';
import { api } from '../../utils/api';

export default function BidderDrawer({
  bidderId,
  onClose,
  onReverified,
  onNavigateAudit,
  onNavigateBidders
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reverifying, setReverifying] = useState(false);
  const [activeTab, setActiveTab] = useState('checks'); // 'checks' | 'issues' | 'timeline' | 'profile'
  const [error, setError] = useState(null);

  const loadDetail = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getBidderDetail(id);
      setDetail(res);
    } catch (err) {
      console.error('Failed to load bidder detail:', err);
      setError('Unable to load bidder verification dossier.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bidderId) {
      loadDetail(bidderId);
    }
  }, [bidderId]);

  // ESC key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleReverify = async () => {
    if (!bidderId) return;
    try {
      setReverifying(true);
      await api.runVerification(bidderId);
      await loadDetail(bidderId);
      if (onReverified) onReverified(bidderId);
    } catch (err) {
      console.error('Re-verification error:', err);
    } finally {
      setReverifying(false);
    }
  };

  if (!bidderId) return null;

  const bidder = detail?.bidder;
  const checks = detail?.checks || [];
  const documents = detail?.documents || [];

  const getRiskBadge = (level) => {
    switch (level?.toUpperCase()) {
      case 'LOW': return 'badge-low';
      case 'MEDIUM': return 'badge-medium';
      case 'HIGH': return 'badge-high';
      case 'CRITICAL': return 'badge-critical';
      default: return 'badge-pending';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED': return 'badge-low';
      case 'FLAGGED': return 'badge-high';
      case 'REJECTED': return 'badge-critical';
      default: return 'badge-pending';
    }
  };

  const failedOrWarningChecks = checks.filter(c => c.status === 'FAIL' || c.status === 'WARNING');

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className="drawer-panel" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Top Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-header-badge">
              <Building2 size={20} />
            </div>
            <div>
              <div className="drawer-pre-title">Bidder Statutory Dossier</div>
              <h2 className="drawer-company-title">
                {bidder ? bidder.company_name : 'Loading Bidder Details...'}
              </h2>
              {bidder?.trade_name && (
                <div className="drawer-trade-name">Trade Name: {bidder.trade_name}</div>
              )}
            </div>
          </div>

          <button 
            type="button" 
            className="drawer-close-btn" 
            onClick={onClose} 
            title="Close dossier (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Statutory Metrics Bar */}
        {bidder && (
          <div className="drawer-metrics-strip">
            <div className="drawer-stat-item">
              <span className="drawer-stat-label">GeM Seller ID</span>
              <span className="drawer-stat-val font-mono">{bidder.gem_seller_id}</span>
            </div>

            <div className="drawer-stat-item">
              <span className="drawer-stat-label">GSTIN</span>
              <span className="drawer-stat-val font-mono">{bidder.gstin}</span>
            </div>

            <div className="drawer-stat-item">
              <span className="drawer-stat-label">MSME Category</span>
              <span className="drawer-stat-val">{bidder.msme_category || 'General'}</span>
            </div>

            <div className="drawer-stat-item">
              <span className="drawer-stat-label">Compliance Score</span>
              <div className="drawer-score-box">
                <span className="drawer-score-num" style={{
                  color: bidder.overall_score === null ? '#64748b' : bidder.overall_score >= 80 ? '#16a34a' : bidder.overall_score >= 50 ? '#d97706' : '#dc2626'
                }}>
                  {bidder.overall_score !== null && bidder.overall_score !== undefined ? `${bidder.overall_score}%` : '--'}
                </span>
                <span className={`badge ${getRiskBadge(bidder.risk_level)} drawer-risk-tag`}>
                  {bidder.risk_level}
                </span>
              </div>
            </div>

            <div className="drawer-stat-item">
              <span className="drawer-stat-label">Status</span>
              <span className={`badge ${getStatusBadge(bidder.verification_status)} drawer-status-tag`}>
                {bidder.verification_status}
              </span>
            </div>
          </div>
        )}

        {/* Drawer Tabs Navigation */}
        <div className="drawer-tabs-nav">
          <button 
            type="button"
            className={`drawer-tab-btn ${activeTab === 'checks' ? 'active' : ''}`}
            onClick={() => setActiveTab('checks')}
          >
            <ShieldCheck size={14} />
            <span>Compliance Checks ({checks.length})</span>
          </button>

          <button 
            type="button"
            className={`drawer-tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <AlertTriangle size={14} />
            <span>Detected Issues ({failedOrWarningChecks.length})</span>
          </button>

          <button 
            type="button"
            className={`drawer-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <Clock size={14} />
            <span>Verification Timeline</span>
          </button>

          <button 
            type="button"
            className={`drawer-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FileText size={14} />
            <span>Statutory Profile</span>
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="drawer-body-scroll">
          {loading ? (
            <div className="drawer-loading-box">
              <RotateCw size={24} className="animate-spin text-muted" />
              <div>Fetching verified portal records...</div>
            </div>
          ) : error ? (
            <div className="drawer-error-box">
              <AlertTriangle size={20} className="text-red" />
              <div>{error}</div>
            </div>
          ) : (
            <>
              {/* TAB 1: COMPLIANCE CHECKS */}
              {activeTab === 'checks' && (
                <div className="drawer-tab-pane">
                  <div className="drawer-section-lead">
                    Automated multi-portal cross-verification results comparing bidder submitted tender documents against official government registries.
                  </div>

                  {checks.length === 0 ? (
                    <div className="drawer-empty-message">
                      <Clock size={20} className="text-muted" />
                      <span>No checks run yet for this bidder. Click "Run Re-verification" below.</span>
                    </div>
                  ) : (
                    <div className="compliance-checks-list">
                      {checks.map(check => {
                        const isPass = check.status === 'PASS';
                        const isFail = check.status === 'FAIL';
                        const isWarn = check.status === 'WARNING';
                        
                        return (
                          <div 
                            key={check.id} 
                            className={`compliance-check-card check-${check.status?.toLowerCase() || 'pending'}`}
                          >
                            <div className="check-card-header">
                              <div className="check-portal-info">
                                <span className="check-portal-name">{check.portal_name}</span>
                                <span className="check-type-tag">{check.check_type}</span>
                              </div>

                              <div className="check-status-info">
                                <span className={`badge ${isPass ? 'badge-low' : isFail ? 'badge-critical' : isWarn ? 'badge-medium' : 'badge-pending'}`}>
                                  {check.status}
                                </span>
                                <span className="check-confidence">
                                  Confidence: {Math.round(check.confidence_score * 100)}%
                                </span>
                              </div>
                            </div>

                            {/* Extracted vs Portal comparison */}
                            <div className="check-values-grid">
                              <div className="check-val-col">
                                <span className="val-label">Submitted / Extracted:</span>
                                <span className="val-text font-mono">
                                  {check.extracted_value || 'None provided'}
                                </span>
                              </div>

                              <div className="check-val-col">
                                <span className="val-label">Registry Value:</span>
                                <span className="val-text font-mono">
                                  {check.portal_value || 'No match found'}
                                </span>
                              </div>
                            </div>

                            {check.discrepancy_details && (
                              <div className="check-discrepancy-note">
                                <AlertTriangle size={13} className="text-red" />
                                <span>{check.discrepancy_details}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DETECTED ISSUES */}
              {activeTab === 'issues' && (
                <div className="drawer-tab-pane">
                  <div className="drawer-section-lead">
                    Detailed summary of non-compliance flags and discrepancies requiring officer review.
                  </div>

                  {failedOrWarningChecks.length === 0 ? (
                    <div className="drawer-empty-clean">
                      <CheckCircle2 size={32} className="text-emerald" />
                      <div className="clean-title">No Statutory Non-Compliance Issues Detected</div>
                      <div className="clean-desc">
                        All cross-portal statutory validations for GST, MSME, EPFO, and debarment lists passed with acceptable tolerances.
                      </div>
                    </div>
                  ) : (
                    <div className="issues-list">
                      {failedOrWarningChecks.map((issue) => (
                        <div key={issue.id} className="issue-detail-card">
                          <div className="issue-card-top">
                            <div className="issue-severity-badge">
                              {issue.status === 'FAIL' ? (
                                <span className="badge badge-critical">CRITICAL RISK</span>
                              ) : (
                                <span className="badge badge-medium">WARNING / VARIANCE</span>
                              )}
                            </div>
                            <span className="issue-portal font-mono">{issue.portal_name}</span>
                          </div>

                          <h4 className="issue-title">
                            {issue.check_type.replace(/_/g, ' ')} Discrepancy
                          </h4>

                          <div className="issue-body">
                            {issue.discrepancy_details || 'Field variance detected between bidder uploaded documentation and the government API registry.'}
                          </div>

                          <div className="issue-comparison-pill">
                            <span>Uploaded: <strong className="font-mono">{issue.extracted_value || 'N/A'}</strong></span>
                            <span className="comp-divider">vs</span>
                            <span>Portal Registry: <strong className="font-mono">{issue.portal_value || 'None'}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VERIFICATION TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="drawer-tab-pane">
                  <div className="drawer-section-lead">
                    Chronological lifecycle of statutory verification milestones and audit history.
                  </div>

                  <div className="verification-steps-timeline">
                    <div className="timeline-step step-completed">
                      <div className="timeline-marker">
                        <Check size={12} />
                      </div>
                      <div className="timeline-step-content">
                        <div className="timeline-step-title">Tender Bid Ingestion & Registration</div>
                        <div className="timeline-step-desc">
                          Bidder master details enrolled into GeM compliance database (ID: #{bidder.id}).
                        </div>
                        <div className="timeline-step-time font-mono">
                          {bidder.created_at ? new Date(bidder.created_at).toLocaleString() : 'Enrolled'}
                        </div>
                      </div>
                    </div>

                    <div className="timeline-step step-completed">
                      <div className="timeline-marker">
                        <Check size={12} />
                      </div>
                      <div className="timeline-step-content">
                        <div className="timeline-step-title">AI Statutory Document OCR & Extraction</div>
                        <div className="timeline-step-desc">
                          Tax invoices, GST REG-06, and MSME certificates processed for metadata extraction.
                        </div>
                        <div className="timeline-step-time font-mono">
                          {documents.length} document(s) verified
                        </div>
                      </div>
                    </div>

                    <div className={`timeline-step ${checks.length > 0 ? 'step-completed' : 'step-pending'}`}>
                      <div className="timeline-marker">
                        {checks.length > 0 ? <Check size={12} /> : <Clock size={12} />}
                      </div>
                      <div className="timeline-step-content">
                        <div className="timeline-step-title">Multi-Portal External Registry Verification</div>
                        <div className="timeline-step-desc">
                          Cross-checked against GSTN, MCA21, Udyam, Debarment Watchlist, and EPFO endpoints.
                        </div>
                        <div className="timeline-step-time font-mono">
                          {checks.length} portal check(s) executed
                        </div>
                      </div>
                    </div>

                    <div className={`timeline-step ${bidder.overall_score !== null ? 'step-completed' : 'step-pending'}`}>
                      <div className="timeline-marker">
                        {bidder.overall_score !== null ? <Check size={12} /> : <Clock size={12} />}
                      </div>
                      <div className="timeline-step-content">
                        <div className="timeline-step-title">AI Compliance Scoring & Risk Classification</div>
                        <div className="timeline-step-desc">
                          Weighted statutory scoring applied. Assigned Risk Tier: <strong>{bidder.risk_level}</strong> (Score: {bidder.overall_score ?? '--'}%).
                        </div>
                      </div>
                    </div>

                    <div className="timeline-step step-pending">
                      <div className="timeline-marker">
                        <Clock size={12} />
                      </div>
                      <div className="timeline-step-content">
                        <div className="timeline-step-title">Officer Final Decision & GFR Sign-off</div>
                        <div className="timeline-step-desc">
                          Current evaluation status: <strong>{bidder.verification_status}</strong>. Awaiting official nodal desk clearance.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: STATUTORY PROFILE */}
              {activeTab === 'profile' && (
                <div className="drawer-tab-pane">
                  <div className="drawer-section-lead">
                    Master registration attributes and statutory identifiers on file with GeM.
                  </div>

                  <div className="profile-attributes-grid">
                    <div className="attr-group">
                      <span className="attr-label">Company Legal Name</span>
                      <span className="attr-value">{bidder.company_name}</span>
                    </div>

                    <div className="attr-group">
                      <span className="attr-label">Trade / Brand Name</span>
                      <span className="attr-value">{bidder.trade_name || 'N/A'}</span>
                    </div>

                    <div className="attr-group">
                      <span className="attr-label">GeM Seller ID</span>
                      <span className="attr-value font-mono">{bidder.gem_seller_id}</span>
                    </div>

                    <div className="attr-group">
                      <span className="attr-label">GSTIN (REG-06)</span>
                      <span className="attr-value font-mono">{bidder.gstin}</span>
                    </div>

                    <div className="attr-group">
                      <span className="attr-label">Permanent Account Number (PAN)</span>
                      <span className="attr-value font-mono">{bidder.pan}</span>
                    </div>

                    <div className="attr-group">
                      <span className="attr-label">Corporate Identification No (CIN)</span>
                      <span className="attr-value font-mono">{bidder.cin || 'Not incorporated (Proprietorship/Partnership)'}</span>
                    </div>

                    <div className="attr-group">
                      <span className="attr-label">MSME Udyam Registration</span>
                      <span className="attr-value font-mono">{bidder.udyam_reg_number || 'Not Registered'}</span>
                    </div>

                    <div className="attr-group">
                      <span className="attr-label">EPFO Establishment Code</span>
                      <span className="attr-value font-mono">{bidder.epfo_code || 'Not Registered'}</span>
                    </div>

                    <div className="attr-group">
                      <span className="attr-label">ESIC Registration No</span>
                      <span className="attr-value font-mono">{bidder.esic_number || 'Exempt / Not Registered'}</span>
                    </div>

                    <div className="attr-group" style={{ gridColumn: 'span 2' }}>
                      <span className="attr-label">Registered Office Address</span>
                      <span className="attr-value">{bidder.registered_address || 'Address on file in GeM Seller Master'}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="drawer-footer">
          <div className="drawer-footer-left">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (onNavigateAudit) onNavigateAudit();
                onClose();
              }}
            >
              <FileText size={13} />
              <span>Open Audit Trail</span>
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (onNavigateBidders) onNavigateBidders(bidder?.id);
                onClose();
              }}
            >
              <ExternalLink size={13} />
              <span>Full Bidder Profile</span>
            </button>
          </div>

          <div className="drawer-footer-right">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Close
            </button>

            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleReverify}
              disabled={reverifying || loading}
            >
              <RotateCw size={14} className={reverifying ? 'animate-spin' : ''} />
              <span>{reverifying ? 'Re-verifying...' : 'Run Re-verification'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
