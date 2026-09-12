import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Columns
} from 'lucide-react';

export default function BidderTable({
  bidders,
  loading,
  onRefresh,
  onInspectBidder,
  // External filter states passed down from parent if set from KPIs or charts
  searchTerm,
  setSearchTerm,
  riskFilter,
  setRiskFilter,
  statusFilter,
  setStatusFilter,
  scoreFilter,
  setScoreFilter,
  onClearAllFilters
}) {
  // Local sorting and pagination state
  const [sortField, setSortField] = useState('overall_score'); // 'company_name', 'overall_score', 'risk_level', 'verification_status'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    gemSellerId: true,
    gstin: true,
    msme: true,
    score: true,
    risk: true,
    status: true
  });

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
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

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED': return 'badge-low';
      case 'FLAGGED': return 'badge-high';
      case 'REJECTED': return 'badge-critical';
      default: return 'badge-pending';
    }
  };

  // Filter logic
  const filteredBidders = useMemo(() => {
    return bidders.filter(b => {
      // 1. Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = b.company_name?.toLowerCase().includes(query);
        const matchesTrade = b.trade_name?.toLowerCase().includes(query);
        const matchesGstin = b.gstin?.toLowerCase().includes(query);
        const matchesGem = b.gem_seller_id?.toLowerCase().includes(query);
        const matchesPan = b.pan?.toLowerCase().includes(query);
        if (!matchesName && !matchesTrade && !matchesGstin && !matchesGem && !matchesPan) {
          return false;
        }
      }

      // 2. Risk filter
      if (riskFilter !== 'ALL') {
        if (riskFilter === 'CRITICAL_OR_HIGH') {
          if (b.risk_level !== 'CRITICAL' && b.risk_level !== 'HIGH') return false;
        } else if (b.risk_level?.toUpperCase() !== riskFilter.toUpperCase()) {
          return false;
        }
      }

      // 3. Status filter
      if (statusFilter !== 'ALL') {
        if (b.verification_status?.toUpperCase() !== statusFilter.toUpperCase()) {
          return false;
        }
      }

      // 4. Score filter
      if (scoreFilter !== 'ALL') {
        const score = b.overall_score;
        if (score === null || score === undefined) return false;
        if (scoreFilter === '0-39' && score >= 40) return false;
        if (scoreFilter === '40-59' && (score < 40 || score >= 60)) return false;
        if (scoreFilter === '60-79' && (score < 60 || score >= 80)) return false;
        if (scoreFilter === '80-100' && score < 80) return false;
        if (scoreFilter === 'HIGH_COMPLIANCE' && score < 70) return false;
      }

      return true;
    });
  }, [bidders, searchTerm, riskFilter, statusFilter, scoreFilter]);

  // Sorting logic
  const sortedBidders = useMemo(() => {
    const list = [...filteredBidders];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Special handling for null scores
      if (sortField === 'overall_score') {
        if (valA === null || valA === undefined) valA = -1;
        if (valB === null || valB === undefined) valB = -1;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredBidders, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedBidders.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedBidders = sortedBidders.slice(startIndex, startIndex + pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const hasActiveFilters = searchTerm.trim() !== '' || 
    riskFilter !== 'ALL' || 
    statusFilter !== 'ALL' || 
    scoreFilter !== 'ALL';

  return (
    <div className="glass-card bidder-table-card">
      {loading && (
        <div className="table-loading-bar">
          <div className="progress-bar-indeterminate" />
        </div>
      )}

      {/* Table Controls Header */}
      <div className="table-controls-header">
        <div className="table-header-titles">
          <h3 className="section-title" style={{ margin: 0 }}>
            Live Bidder Evaluation Overview
          </h3>
          <div className="table-header-caption">
            Statutory registry cross-verification records ({filteredBidders.length} of {bidders.length} bidders matching active filters)
          </div>
        </div>

        <div className="table-actions-toolbar">
          {/* Search Input */}
          <div className="table-search-box">
            <Search size={15} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search Organization, GSTIN, GeM ID..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="table-search-input"
            />
            {searchTerm && (
              <button 
                className="search-clear-btn" 
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Risk Filter Select */}
          <div className="filter-select-wrapper">
            <select 
              value={riskFilter} 
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="table-select-control"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
              <option value="CRITICAL_OR_HIGH">High & Critical</option>
            </select>
          </div>

          {/* Status Filter Select */}
          <div className="filter-select-wrapper">
            <select 
              value={statusFilter} 
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="table-select-control"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="FLAGGED">Flagged</option>
              <option value="REJECTED">Rejected</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Score Range Filter Select */}
          <div className="filter-select-wrapper">
            <select 
              value={scoreFilter} 
              onChange={(e) => {
                setScoreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="table-select-control"
            >
              <option value="ALL">All Score Ranges</option>
              <option value="80-100">80–100% (Compliant)</option>
              <option value="60-79">60–79% (Moderate)</option>
              <option value="40-59">40–59% (High Risk)</option>
              <option value="0-39">0–39% (Critical)</option>
              <option value="HIGH_COMPLIANCE">≥ 70% High Compliance</option>
            </select>
          </div>

          {/* Columns Visibility Menu Toggle */}
          <div style={{ position: 'relative' }}>
            <button 
              type="button" 
              className={`btn btn-secondary btn-icon-only ${showColumnMenu ? 'active' : ''}`}
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              title="Customize Columns"
            >
              <Columns size={14} />
            </button>

            {showColumnMenu && (
              <div className="column-visibility-dropdown">
                <div className="column-dropdown-title">Visible Columns</div>
                <label className="column-checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.gemSellerId} 
                    onChange={() => toggleColumn('gemSellerId')} 
                  />
                  <span>GeM Seller ID</span>
                </label>
                <label className="column-checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.gstin} 
                    onChange={() => toggleColumn('gstin')} 
                  />
                  <span>GSTIN</span>
                </label>
                <label className="column-checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.msme} 
                    onChange={() => toggleColumn('msme')} 
                  />
                  <span>MSME Category</span>
                </label>
                <label className="column-checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.score} 
                    onChange={() => toggleColumn('score')} 
                  />
                  <span>Compliance Score</span>
                </label>
                <label className="column-checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.risk} 
                    onChange={() => toggleColumn('risk')} 
                  />
                  <span>Risk Tier</span>
                </label>
                <label className="column-checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.status} 
                    onChange={() => toggleColumn('status')} 
                  />
                  <span>Status</span>
                </label>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button 
            type="button" 
            className="btn btn-secondary btn-refresh-table" 
            onClick={onRefresh} 
            disabled={loading}
            title="Refresh Table Data"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="active-filters-bar">
          <span className="filters-label">Active Filters:</span>
          
          {searchTerm.trim() && (
            <span className="filter-chip">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm('')}><X size={11} /></button>
            </span>
          )}

          {riskFilter !== 'ALL' && (
            <span className="filter-chip">
              Risk: {riskFilter === 'CRITICAL_OR_HIGH' ? 'High & Critical' : riskFilter}
              <button onClick={() => setRiskFilter('ALL')}><X size={11} /></button>
            </span>
          )}

          {statusFilter !== 'ALL' && (
            <span className="filter-chip">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('ALL')}><X size={11} /></button>
            </span>
          )}

          {scoreFilter !== 'ALL' && (
            <span className="filter-chip">
              Score: {scoreFilter}%
              <button onClick={() => setScoreFilter('ALL')}><X size={11} /></button>
            </span>
          )}

          <button className="clear-all-filters-btn" onClick={onClearAllFilters}>
            Clear All
          </button>
        </div>
      )}

      {/* Table Body */}
      <div className="table-responsive-wrapper">
        <table className="quick-table command-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('company_name')} className="th-sortable">
                <div className="th-content">
                  <span>Bidder / Organization</span>
                  {sortField === 'company_name' ? (
                    sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : (
                    <ArrowUpDown size={12} className="sort-icon-idle" />
                  )}
                </div>
              </th>

              {visibleColumns.gemSellerId && <th>GeM Seller ID</th>}
              {visibleColumns.gstin && <th>GSTIN</th>}
              {visibleColumns.msme && <th>MSME Type</th>}

              {visibleColumns.score && (
                <th onClick={() => handleSort('overall_score')} className="th-sortable">
                  <div className="th-content">
                    <span>Compliance Score</span>
                    {sortField === 'overall_score' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={12} className="sort-icon-idle" />
                    )}
                  </div>
                </th>
              )}

              {visibleColumns.risk && (
                <th onClick={() => handleSort('risk_level')} className="th-sortable">
                  <div className="th-content">
                    <span>Risk Tier</span>
                    {sortField === 'risk_level' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={12} className="sort-icon-idle" />
                    )}
                  </div>
                </th>
              )}

              {visibleColumns.status && (
                <th onClick={() => handleSort('verification_status')} className="th-sortable">
                  <div className="th-content">
                    <span>Status</span>
                    {sortField === 'verification_status' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={12} className="sort-icon-idle" />
                    )}
                  </div>
                </th>
              )}

              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedBidders.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty-cell">
                  <div className="empty-state-content">
                    <Filter size={32} className="text-muted" />
                    <div className="empty-state-text">No bidder records match current filter criteria</div>
                    <button className="btn btn-secondary btn-sm" onClick={onClearAllFilters}>
                      Reset All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedBidders.map((b) => (
                <tr 
                  key={b.id} 
                  className="table-bidder-row"
                  onClick={() => onInspectBidder(b.id)}
                >
                  <td>
                    <div className="bidder-name-cell">
                      <span className="bidder-company-name">{b.company_name}</span>
                      {b.trade_name && (
                        <span className="bidder-trade-name">Trade: {b.trade_name}</span>
                      )}
                    </div>
                  </td>

                  {visibleColumns.gemSellerId && (
                    <td><span className="font-mono gem-id-tag">{b.gem_seller_id}</span></td>
                  )}

                  {visibleColumns.gstin && (
                    <td><span className="font-mono gstin-tag">{b.gstin}</span></td>
                  )}

                  {visibleColumns.msme && (
                    <td>
                      <span className="msme-pill">
                        {b.msme_category || 'N/A'}
                      </span>
                    </td>
                  )}

                  {visibleColumns.score && (
                    <td>
                      <div className="score-cell-wrapper">
                        <span className="score-value-bold" style={{ 
                          color: b.overall_score === null 
                            ? 'var(--text-muted)' 
                            : b.overall_score >= 80 
                              ? '#16a34a' 
                              : b.overall_score >= 50 
                                ? '#d97706' 
                                : '#dc2626' 
                        }}>
                          {b.overall_score !== null && b.overall_score !== undefined ? `${b.overall_score}%` : '--'}
                        </span>
                        {b.overall_score !== null && (
                          <div className="score-mini-track">
                            <div 
                              className="score-mini-fill" 
                              style={{ 
                                width: `${b.overall_score}%`,
                                backgroundColor: b.overall_score >= 80 ? '#16a34a' : b.overall_score >= 50 ? '#d97706' : '#dc2626'
                              }} 
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  )}

                  {visibleColumns.risk && (
                    <td>
                      <span className={`badge ${getRiskBadgeClass(b.risk_level)}`}>
                        {b.risk_level}
                      </span>
                    </td>
                  )}

                  {visibleColumns.status && (
                    <td>
                      <span className={`badge ${getStatusBadgeClass(b.verification_status)}`}>
                        {b.verification_status}
                      </span>
                    </td>
                  )}

                  <td style={{ textAlign: 'right' }}>
                    <button 
                      type="button"
                      className={`btn ${b.verification_status === 'PENDING' ? 'btn-primary' : 'btn-secondary'} btn-table-action`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectBidder(b.id);
                      }}
                      title="Inspect bidder dossier & statutory checks"
                    >
                      <span>{b.verification_status === 'PENDING' ? 'Verify Now' : 'Inspect'}</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="table-pagination-footer">
        <div className="pagination-info">
          Showing <strong>{sortedBidders.length > 0 ? startIndex + 1 : 0}</strong> to <strong>{Math.min(startIndex + pageSize, sortedBidders.length)}</strong> of <strong>{sortedBidders.length}</strong> entries
        </div>

        <div className="pagination-controls">
          <div className="page-size-selector">
            <span className="page-size-label">Rows per page:</span>
            <select 
              value={pageSize} 
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="page-size-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="page-nav-buttons">
            <button 
              type="button" 
              className="btn btn-secondary btn-nav-page" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={validCurrentPage === 1}
              title="Previous page"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="page-indicator">
              Page <strong>{validCurrentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <button 
              type="button" 
              className="btn btn-secondary btn-nav-page" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={validCurrentPage === totalPages}
              title="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
