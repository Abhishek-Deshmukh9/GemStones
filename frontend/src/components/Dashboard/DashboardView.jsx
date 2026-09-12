import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../utils/api';
import CommandHeader from './CommandHeader';
import KpiCards from './KpiCards';
import ChartsSection from './ChartsSection';
import PriorityActions from './PriorityActions';
import BidderTable from './BidderTable';
import BidderDrawer from './BidderDrawer';
import LiveActivityFeed from './LiveActivityFeed';
import ToastNotification from './ToastNotification';
import './Dashboard.css';

export default function DashboardView({ onSelectBidder, onNavigateTab }) {
  // Master API data state
  const [stats, setStats] = useState(null);
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [lastVerifiedTime, setLastVerifiedTime] = useState(null);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);

  // Drawer Inspection State
  const [inspectingBidderId, setInspectingBidderId] = useState(null);

  // Filter and Search states (synchronized across KPIs, charts, and table)
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [scoreFilter, setScoreFilter] = useState('ALL');

  // Institutional Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    subtext: '',
    type: 'info'
  });

  const showToast = (message, subtext = '', type = 'info', duration = 4000) => {
    setToast({ visible: true, message, subtext, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, duration);
  };

  // Load dashboard data from backend
  const loadData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [statsRes, biddersRes] = await Promise.all([
        api.getBidderStats(),
        api.getBidders()
      ]);
      setStats(statsRes);
      setBidders(biddersRes);
    } catch (err) {
      console.error('Error loading command center data:', err);
      showToast('Error fetching statutory registry data', 'Check backend connectivity.', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Default formatted time
    const now = new Date();
    setLastVerifiedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [loadData]);

  // Handle batch verification across all bidders
  const handleRunBatchVerification = async () => {
    try {
      setVerifyingAll(true);
      const minDelay = new Promise(resolve => setTimeout(resolve, 1400));
      await Promise.all([
        api.runBatchVerification(),
        minDelay
      ]);
      await loadData(true);
      const now = new Date();
      setLastVerifiedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setActivityRefreshKey(prev => prev + 1);
      showToast(
        'Batch Cross-Verification Executed',
        'All 10 bidder records verified across GSTN, MCA21, MSME & Debarment portals.',
        'success'
      );
    } catch (err) {
      console.error('Batch verification error:', err);
      showToast('Batch verification encountered an error', 'Review system logs.', 'error');
    } finally {
      setVerifyingAll(false);
    }
  };

  // Handle reset to unverified demo state
  const handleResetDemo = async () => {
    try {
      setResetting(true);
      await api.resetVerification();
      await loadData(true);
      handleClearAllFilters();
      setActivityRefreshKey(prev => prev + 1);
      showToast(
        'Demo State Reset',
        'All bidder evaluations restored to unverified baseline for testing.',
        'warning'
      );
    } catch (err) {
      console.error('Reset error:', err);
      showToast('Reset action failed', 'Please retry.', 'error');
    } finally {
      setResetting(false);
    }
  };

  // KPI card selection handler
  const handleSelectKpi = (kpiType) => {
    if (kpiType === 'ALL') {
      handleClearAllFilters();
    } else if (kpiType === 'HIGH_COMPLIANCE') {
      setScoreFilter(scoreFilter === 'HIGH_COMPLIANCE' ? 'ALL' : 'HIGH_COMPLIANCE');
    } else if (kpiType === 'PENDING') {
      setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING');
    } else if (kpiType === 'CRITICAL_OR_HIGH') {
      setRiskFilter(riskFilter === 'CRITICAL_OR_HIGH' ? 'ALL' : 'CRITICAL_OR_HIGH');
    }
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchTerm('');
    setRiskFilter('ALL');
    setStatusFilter('ALL');
    setScoreFilter('ALL');
  };

  // Focus on critical issues button handler
  const handleReviewCritical = () => {
    setRiskFilter('CRITICAL_OR_HIGH');
    // Scroll down smoothly to priority actions or table
    const target = document.querySelector('.priority-actions-panel') || document.querySelector('.bidder-table-card');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle bidder reverified from drawer
  const handleBidderReverified = async (bidderId) => {
    await loadData(true);
    setActivityRefreshKey(prev => prev + 1);
    showToast(
      `Bidder #${bidderId} Re-verified`,
      'Statutory registries updated and compliance score re-calculated.',
      'success'
    );
  };

  // Determine current active filter representation for KPI cards
  const getActiveFilterDescriptor = () => {
    if (scoreFilter === 'HIGH_COMPLIANCE') return { type: 'HIGH_COMPLIANCE' };
    if (statusFilter === 'PENDING') return { type: 'STATUS', value: 'PENDING' };
    if (riskFilter === 'CRITICAL_OR_HIGH' || riskFilter === 'CRITICAL') return { type: 'RISK', value: riskFilter };
    if (searchTerm === '' && riskFilter === 'ALL' && statusFilter === 'ALL' && scoreFilter === 'ALL') {
      return { type: 'ALL' };
    }
    return { type: 'CUSTOM' };
  };

  return (
    <div className="dashboard-container command-center-view">
      {/* 1. Command Center Header */}
      <CommandHeader 
        stats={stats}
        lastVerifiedTime={lastVerifiedTime}
        verifyingAll={verifyingAll}
        resetting={resetting}
        onRunBatchVerification={handleRunBatchVerification}
        onResetDemo={handleResetDemo}
        onReviewCritical={handleReviewCritical}
      />

      {/* 2. Interactive KPI Cards */}
      <KpiCards 
        stats={stats}
        activeFilter={getActiveFilterDescriptor()}
        onSelectKpi={handleSelectKpi}
      />

      {/* 3. Interactive Charts (Score Distribution & Risk Breakdown) */}
      <ChartsSection 
        bidders={bidders}
        stats={stats}
        selectedScoreRange={scoreFilter !== 'ALL' && scoreFilter !== 'HIGH_COMPLIANCE' ? scoreFilter : null}
        selectedRiskLevel={riskFilter !== 'ALL' && riskFilter !== 'CRITICAL_OR_HIGH' ? riskFilter : null}
        onSelectScoreRange={(rangeKey) => setScoreFilter(rangeKey)}
        onSelectRiskLevel={(riskName) => setRiskFilter(riskName)}
        onClearScoreRange={() => setScoreFilter('ALL')}
        onClearRiskLevel={() => setRiskFilter('ALL')}
      />

      {/* 4. Priority Actions Panel */}
      <PriorityActions 
        bidders={bidders}
        onInspectBidder={(bidderId) => setInspectingBidderId(bidderId)}
        onFilterByBidder={(bidderId) => {
          const found = bidders.find(b => b.id === bidderId);
          if (found) setSearchTerm(found.gem_seller_id);
        }}
      />

      {/* 5. Live Bidder Evaluation Table */}
      <BidderTable 
        bidders={bidders}
        loading={loading}
        onRefresh={() => loadData(false)}
        onInspectBidder={(bidderId) => setInspectingBidderId(bidderId)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        riskFilter={riskFilter}
        setRiskFilter={setRiskFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        scoreFilter={scoreFilter}
        setScoreFilter={setScoreFilter}
        onClearAllFilters={handleClearAllFilters}
      />

      {/* 6. Live Verification Activity Feed */}
      <LiveActivityFeed 
        onInspectBidder={(bidderId) => setInspectingBidderId(bidderId)}
        refreshTrigger={activityRefreshKey}
      />

      {/* 7. Bidder Inspection Drawer/Sheet (Slide-Over) */}
      {inspectingBidderId && (
        <BidderDrawer 
          bidderId={inspectingBidderId}
          onClose={() => setInspectingBidderId(null)}
          onReverified={handleBidderReverified}
          onNavigateAudit={() => onNavigateTab && onNavigateTab('audit')}
          onNavigateBidders={(id) => {
            if (onSelectBidder) onSelectBidder(id);
            if (onNavigateTab) onNavigateTab('bidders');
          }}
        />
      )}

      {/* 8. Institutional Toast Notification */}
      <ToastNotification 
        toast={toast}
        onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
