import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Zap,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import { api } from '../../utils/api';

const ComplianceGauge = ({ score, riskLevel }) => {
  const isPending = score === null || score === undefined || riskLevel === 'PENDING';
  const [offset, setOffset] = useState(283);
  
  useEffect(() => {
    if (isPending) {
      setOffset(283);
      return;
    }
    const targetOffset = 283 - (283 * score) / 100;
    const timer = setTimeout(() => {
      setOffset(targetOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [score, isPending]);

  let strokeColor = '#94a3b8'; // Neutral slate for pending
  if (!isPending) {
    if (score < 40) strokeColor = '#dc2626'; // red
    else if (score < 65) strokeColor = '#ea580c'; // orange
    else if (score < 85) strokeColor = '#d97706'; // amber
    else strokeColor = '#16a34a'; // green
  }

  return (
    <div style={{ position: 'relative', width: '90px', height: '90px' }}>
      <svg width="90" height="90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle 
          cx="50" cy="50" r="45" fill="none" stroke={strokeColor} strokeWidth="8"
          strokeDasharray="283" strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: isPending ? '1.2rem' : '1.4rem', fontWeight: 800, lineHeight: 1, color: strokeColor }}>
          {isPending ? '--' : score}
        </span>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {isPending ? 'Pending' : '/ 100'}
        </span>
      </div>
    </div>
  );
};

export default function BiddersView({ selectedBidderId, onSelectBidder, selectedTenderId }) {
  const [bidders, setBidders] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedBidder, setSelectedBidder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [tenderContext, setTenderContext] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const loadBidders = async () => {
    try {
      if (selectedTenderId) {
        const tenderDetail = await api.getTenderDetail(selectedTenderId);
        setTenderContext(tenderDetail);
        const tenderBidders = tenderDetail.tender_bidders.map(tb => tb.bidder).filter(Boolean);
        setBidders(tenderBidders);
        
        // Auto-select first bidder if none selected
        if (!selectedBidder && tenderBidders.length > 0) {
          loadDetail(tenderBidders[0].id);
        } else if (selectedBidder) {
          loadDetail(selectedBidder.bidder.id);
        }
      } else {
        setTenderContext(null);
        const data = await api.getBidders({ search });
        setBidders(data);
        if (selectedBidderId) {
          loadDetail(selectedBidderId);
        } else if (data.length > 0 && !selectedBidder) {
          loadDetail(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDetail = async (id) => {
    try {
      setLoadingDetail(true);
      const detail = await api.getBidderDetail(id);
      setSelectedBidder(detail);
      if (onSelectBidder) onSelectBidder(id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadBidders();
  }, [search, selectedTenderId]);

  const handleRunVerify = async (id) => {
    try {
      setVerifying(true);
      await api.runVerification(id, selectedTenderId);
      await loadDetail(id);
      await loadBidders();
      setToast({ visible: true, message: 'Statutory verification completed successfully.', type: 'toast-success' });
      setTimeout(() => setToast({ visible: false, message: '', type: '' }), 4000);
    } catch (err) {
      console.error('Verification error:', err);
      setToast({ visible: true, message: 'Verification error occurred.', type: 'toast-error' });
      setTimeout(() => setToast({ visible: false, message: '', type: '' }), 4000);
    } finally {
      setVerifying(false);
    }
  };

  const handleRunTenderVerification = async () => {
    if (!selectedTenderId) return;
    try {
      setVerifyingAll(true);
      await api.runTenderVerification(selectedTenderId);
      await loadBidders();
      if (selectedBidder) {
        await loadDetail(selectedBidder.bidder.id);
      }
      setToast({ visible: true, message: 'Batch tender verification complete.', type: 'toast-success' });
      setTimeout(() => setToast({ visible: false, message: '', type: '' }), 4000);
    } catch (err) {
      console.error('Tender verification error:', err);
    } finally {
      setVerifyingAll(false);
    }
  };

  const handleOfficerDecision = async (decision) => {
    if (!selectedBidder) return;
    try {
      const res = await api.submitOfficerDecision(selectedBidder.bidder.id, {
        decision,
        notes: decisionNotes || `Officer applied status: ${decision}`,
        officer_name: 'GeM Nodal Officer (Desk 4)'
      });
      setDecisionNotes('');
      await loadDetail(selectedBidder.bidder.id);
      await loadBidders();
      
      let toastType = 'toast-success';
      if (decision === 'FLAGGED_FOR_INSPECTION') toastType = 'toast-warning';
      if (decision === 'REJECTED') toastType = 'toast-error';
      
      setToast({ visible: true, message: `Decision recorded: ${res.new_status}`, type: toastType });
      setTimeout(() => setToast({ visible: false, message: '', type: '' }), 4000);
    } catch (err) {
      console.error('Decision error:', err);
      setToast({ visible: true, message: 'Failed to record decision.', type: 'toast-error' });
      setTimeout(() => setToast({ visible: false, message: '', type: '' }), 4000);
    }
  };

  const pendingCount = bidders.filter(b => b.verification_status === 'PENDING').length;
  const verifiedCount = bidders.filter(b => b.verification_status === 'VERIFIED').length;
  const flaggedCount = bidders.filter(b => b.verification_status === 'FLAGGED').length;
  const rejectedCount = bidders.filter(b => b.verification_status === 'REJECTED').length;

  const filteredBidders = bidders.filter(b => {
    if (filterStatus === 'PENDING') return b.verification_status === 'PENDING';
    if (filterStatus === 'VERIFIED') return b.verification_status === 'VERIFIED';
    if (filterStatus === 'FLAGGED') return b.verification_status === 'FLAGGED';
    if (filterStatus === 'REJECTED') return b.verification_status === 'REJECTED';
    return true;
  });

  const isCurrentBidderPending = selectedBidder?.bidder?.verification_status === 'PENDING';

  return (
    <>
      {toast.visible && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'toast-success' && <CheckCircle size={20} />}
            {toast.type === 'toast-warning' && <AlertTriangle size={20} />}
            {toast.type === 'toast-error' && <XCircle size={20} />}
            <span style={{ fontWeight: 500 }}>{toast.message}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
        {/* Bidder List Left Column */}
        <div className="glass-card" style={{ padding: '20px', height: 'fit-content' }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              {tenderContext ? `Bidders for ${tenderContext.tender_id}` : 'Bidder Master Directory'}
            </h3>
            
            {tenderContext && (
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginBottom: '12px', justifyContent: 'center' }}
                onClick={handleRunTenderVerification}
                disabled={verifyingAll}
              >
                <Zap size={14} className={verifyingAll ? 'animate-pulse' : ''} />
                <span>{verifyingAll ? 'Verifying All Bidders...' : 'Verify Tender Bidders Batch'}</span>
              </button>
            )}

            {!tenderContext && (
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search company, GSTIN, GeM ID..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            )}

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button 
                className={`tab-chip ${filterStatus === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterStatus('ALL')}
              >
                All ({bidders.length})
              </button>
              <button 
                className={`tab-chip ${filterStatus === 'PENDING' ? 'active' : ''}`}
                onClick={() => setFilterStatus('PENDING')}
              >
                Pending ({pendingCount})
              </button>
              <button 
                className={`tab-chip ${filterStatus === 'VERIFIED' ? 'active' : ''}`}
                onClick={() => setFilterStatus('VERIFIED')}
              >
                Verified ({verifiedCount})
              </button>
              <button 
                className={`tab-chip ${filterStatus === 'FLAGGED' ? 'active' : ''}`}
                onClick={() => setFilterStatus('FLAGGED')}
              >
                Flagged ({flaggedCount})
              </button>
              {rejectedCount > 0 && (
                <button 
                  className={`tab-chip ${filterStatus === 'REJECTED' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('REJECTED')}
                >
                  Rejected ({rejectedCount})
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '640px', overflowY: 'auto' }}>
            {filteredBidders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No bidders match the selected filter.
              </div>
            ) : (
              filteredBidders.map((b) => {
                const isSelected = selectedBidder?.bidder?.id === b.id;
                const isBidderPending = b.verification_status === 'PENDING';
                return (
                  <div 
                    key={b.id}
                    onClick={() => loadDetail(b.id)}
                    className="glass-card glass-card-interactive"
                    style={{
                      padding: '14px',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-glass)',
                      background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{b.company_name}</div>
                      <span className={`badge ${
                        isBidderPending 
                          ? 'badge-pending' 
                          : b.risk_level === 'LOW' 
                            ? 'badge-low' 
                            : b.risk_level === 'MEDIUM' 
                              ? 'badge-medium' 
                              : b.risk_level === 'HIGH' 
                                ? 'badge-high' 
                                : 'badge-critical'
                      }`}>
                        {b.risk_level}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span className="font-mono">{b.gem_seller_id}</span>
                      <span style={{ 
                        fontWeight: 700, 
                        color: isBidderPending 
                          ? 'var(--text-muted)' 
                          : b.overall_score >= 80 
                            ? '#10b981' 
                            : b.overall_score >= 50 
                              ? '#f59e0b' 
                              : '#ef4444' 
                      }}>
                        {b.overall_score !== null && b.overall_score !== undefined ? `${b.overall_score}%` : '--'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Bidder Detail Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {selectedBidder ? (
            <>
              {/* Unverified Callout Banner if Pending */}
              {isCurrentBidderPending && (
                <div style={{ 
                  padding: '14px 18px', 
                  background: '#f8fafc', 
                  border: '1px solid #cbd5e1', 
                  borderLeft: '4px solid #3b82f6', 
                  borderRadius: 'var(--radius-md)', 
                  display: 'flex', 
                  gap: '14px', 
                  alignItems: 'center' 
                }}>
                  <Clock size={22} color="#3b82f6" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '0.9rem' }}>
                      Bid Status: Awaiting Statutory Cross-Verification
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                      Declared credentials have been ingested into GeM but have not yet been evaluated against government statutory registries. Click <strong>"Run Statutory Verification"</strong> to begin.
                    </div>
                  </div>
                </div>
              )}

              {/* Header Card */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{selectedBidder.bidder.company_name}</h2>
                      <span className={`badge ${
                        isCurrentBidderPending 
                          ? 'badge-pending' 
                          : selectedBidder.bidder.verification_status === 'VERIFIED' 
                            ? 'badge-low' 
                            : selectedBidder.bidder.verification_status === 'FLAGGED' 
                              ? 'badge-medium' 
                              : 'badge-critical'
                      }`}>
                        {selectedBidder.bidder.verification_status}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                      GeM ID: <span className="font-mono">{selectedBidder.bidder.gem_seller_id}</span> • 
                      Trade: {selectedBidder.bidder.trade_name || 'N/A'}
                    </div>
                    {tenderContext && (
                      <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#1e3a5f', fontWeight: 600 }}>
                        Evaluating against Tender: {tenderContext.tender_id}
                      </div>
                    )}
                    <button 
                      className="btn btn-primary"
                      style={{ marginTop: '16px', padding: '9px 18px' }}
                      onClick={() => handleRunVerify(selectedBidder.bidder.id)}
                      disabled={verifying}
                    >
                      <RefreshCw size={14} className={verifying ? 'animate-spin' : ''} />
                      <span>{verifying ? 'Querying Portals...' : isCurrentBidderPending ? 'Run Statutory Verification' : 'Re-verify Statutory Portals'}</span>
                    </button>
                  </div>

                  <div style={{ paddingRight: '12px' }}>
                    <ComplianceGauge 
                      key={`${selectedBidder.bidder.id}-${selectedBidder.bidder.overall_score}`} 
                      score={selectedBidder.bidder.overall_score} 
                      riskLevel={selectedBidder.bidder.risk_level} 
                    />
                  </div>
                </div>

                {/* Statutory ID Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GSTIN (Form GST REG-06)</div>
                    <div className="font-mono" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{selectedBidder.bidder.gstin}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Permanent Account Number (PAN)</div>
                    <div className="font-mono" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{selectedBidder.bidder.pan}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Corporate ID (CIN - MCA21)</div>
                    <div className="font-mono" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{selectedBidder.bidder.cin || 'Unregistered LLP/Prop'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Udyam MSME Registration</div>
                    <div className="font-mono" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{selectedBidder.bidder.udyam_reg_number || 'Non-MSME'}</div>
                  </div>
                </div>
              </div>

              {/* Portal Verification Checks Grid */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 className="section-title">Government Portal Cross-Verification Checks</h3>
                {selectedBidder.checks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-glass)' }}>
                    <Building2 size={36} color="#64748b" style={{ marginBottom: '12px' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e3a5f', marginBottom: '6px' }}>
                      No Statutory Checks Executed Yet
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '520px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
                      Cross-verification will audit Form GST REG-06, MCA21 corporate status, MSME Udyam categorization, GeM Debarment Watchlist, and OEM authorization validity.
                    </p>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleRunVerify(selectedBidder.bidder.id)}
                      disabled={verifying}
                    >
                      <Zap size={14} />
                      <span>Execute Statutory Audit</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedBidder.checks.map((chk) => (
                      <div 
                        key={chk.id}
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-glass)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>{chk.portal_name}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>• {chk.check_type}</span>
                          </div>
                          {chk.discrepancy_details && (
                            <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                              ⚠ {chk.discrepancy_details}
                            </div>
                          )}
                        </div>
                        <span className={`badge ${
                          chk.status === 'COMPLIANT' 
                            ? 'badge-low' 
                            : chk.status === 'MISMATCH' 
                              ? 'badge-medium' 
                              : chk.status === 'NOT_APPLICABLE' 
                                ? 'badge-not_applicable' 
                                : 'badge-critical'
                        }`}>
                          {chk.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Recommendation Panel */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0' }}>
                  <ShieldCheck size={20} style={{ color: '#1e3a5f' }} />
                  Automated Statutory Evaluation Report
                </h3>
                
                {selectedBidder.bidder.ai_recommendation ? (
                  <div style={{
                    padding: '16px 20px',
                    backgroundColor: 'var(--bg-app)',
                    borderLeft: `4px solid ${
                      selectedBidder.bidder.risk_level === 'LOW' ? '#16a34a' :
                      selectedBidder.bidder.risk_level === 'MEDIUM' ? '#d97706' : '#dc2626'
                    }`,
                    borderRadius: '4px',
                    marginTop: '16px'
                  }}>
                    <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      "{selectedBidder.bidder.ai_recommendation}"
                    </p>
                    <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {selectedBidder.bidder.ai_recommendation.includes("Based on statutory cross-verification") 
                        ? "Statutory Rule Assessment Engine" 
                        : "Automated Statutory Evaluation"}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                    Automated assessment will be generated upon executing statutory cross-verification.
                  </div>
                )}
              </div>

              {/* Officer Decision Console */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 className="section-title">Nodal Officer Decision Console</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '14px' }}>
                  Review statutory discrepancies and record an administrative decision with justification notes.
                </p>
                {isCurrentBidderPending ? (
                  <div style={{ padding: '14px 16px', background: '#f1f5f9', borderRadius: 'var(--radius-md)', color: '#475569', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    ⚠ Please run statutory verification above to populate audit evidence before recording an administrative decision.
                  </div>
                ) : (
                  <>
                    <textarea 
                      rows={3}
                      placeholder="Enter officer rationale / justification notes..."
                      value={decisionNotes}
                      onChange={(e) => setDecisionNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        marginBottom: '16px',
                        fontFamily: 'inherit'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button className="btn btn-success" onClick={() => handleOfficerDecision('APPROVED')}>
                        <CheckCircle size={16} />
                        <span>Approve Bidder for Tender</span>
                      </button>
                      <button className="btn btn-secondary" onClick={() => handleOfficerDecision('FLAGGED_FOR_INSPECTION')}>
                        <AlertTriangle size={16} />
                        <span>Flag for Physical Inspection</span>
                      </button>
                      <button className="btn btn-danger" onClick={() => handleOfficerDecision('REJECTED')}>
                        <XCircle size={16} />
                        <span>Reject Bidder</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a bidder from the directory to review their statutory profile.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
