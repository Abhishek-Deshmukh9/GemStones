import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Cell as PieCell
} from 'recharts';
import { X, Filter, BarChart3, PieChart as PieIcon } from 'lucide-react';

export default function ChartsSection({
  bidders,
  stats,
  selectedScoreRange,
  selectedRiskLevel,
  onSelectScoreRange,
  onSelectRiskLevel,
  onClearScoreRange,
  onClearRiskLevel
}) {
  const getScoreData = () => {
    const buckets = {
      '0-39': { label: '0–39 (Critical)', count: 0, fill: '#dc2626', rangeKey: '0-39' },
      '40-59': { label: '40–59 (High)', count: 0, fill: '#ea580c', rangeKey: '40-59' },
      '60-79': { label: '60–79 (Medium)', count: 0, fill: '#d97706', rangeKey: '60-79' },
      '80-100': { label: '80–100 (Low)', count: 0, fill: '#16a34a', rangeKey: '80-100' }
    };

    bidders.forEach(b => {
      if (b.overall_score === null || b.overall_score === undefined) return;
      const score = b.overall_score;
      if (score < 40) buckets['0-39'].count++;
      else if (score < 60) buckets['40-59'].count++;
      else if (score < 80) buckets['60-79'].count++;
      else buckets['80-100'].count++;
    });

    return Object.values(buckets);
  };

  const getRiskData = () => {
    const breakdown = stats?.risk_breakdown || {};
    return [
      { name: 'LOW', value: breakdown.low || 0, fill: '#16a34a', label: 'Low Risk' },
      { name: 'MEDIUM', value: breakdown.medium || 0, fill: '#d97706', label: 'Medium Risk' },
      { name: 'HIGH', value: breakdown.high || 0, fill: '#ea580c', label: 'High Risk' },
      { name: 'CRITICAL', value: breakdown.critical || 0, fill: '#dc2626', label: 'Critical Risk' }
    ].filter(item => item.value > 0);
  };

  const scoreData = getScoreData();
  const riskData = getRiskData();

  const handleBarClick = (data) => {
    if (!data || !data.rangeKey) return;
    if (selectedScoreRange === data.rangeKey) {
      onClearScoreRange();
    } else {
      onSelectScoreRange(data.rangeKey);
    }
  };

  const handlePieClick = (entry) => {
    if (!entry || !entry.name) return;
    if (selectedRiskLevel === entry.name) {
      onClearRiskLevel();
    } else {
      onSelectRiskLevel(entry.name);
    }
  };

  return (
    <div className="charts-grid">
      {/* 1. Score Distribution Bar Chart */}
      <div className={`glass-card chart-card ${selectedScoreRange ? 'chart-card-filtered' : ''}`}>
        <div className="chart-header">
          <div className="chart-header-title">
            <BarChart3 size={16} className="chart-title-icon" />
            <h3 className="section-title">Compliance Score Distribution</h3>
          </div>
          {selectedScoreRange ? (
            <button 
              className="chart-filter-pill active" 
              onClick={onClearScoreRange}
              title="Click to clear score filter"
            >
              <span>Score: {selectedScoreRange}%</span>
              <X size={12} />
            </button>
          ) : (
            <span className="chart-hint">Click a tier to filter table</span>
          )}
        </div>

        <div className="chart-container" style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={scoreData} 
              layout="vertical" 
              margin={{ top: 10, right: 30, left: 24, bottom: 5 }}
            >
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis 
                dataKey="label" 
                type="category" 
                width={120} 
                tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(30, 58, 95, 0.05)' }}
                formatter={(value) => [`${value} Bidders`, 'Count']}
                contentStyle={{ 
                  borderRadius: '6px', 
                  border: '1px solid #cbd5e1', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: '0.8rem'
                }}
              />
              <Bar 
                dataKey="count" 
                radius={[0, 4, 4, 0]} 
                cursor="pointer"
                onClick={handleBarClick}
              >
                {scoreData.map((entry) => {
                  const isSelected = selectedScoreRange === entry.rangeKey;
                  return (
                    <Cell 
                      key={`bar-${entry.rangeKey}`} 
                      fill={entry.fill} 
                      stroke={isSelected ? '#0f172a' : 'transparent'}
                      strokeWidth={isSelected ? 2 : 0}
                      opacity={selectedScoreRange && !isSelected ? 0.45 : 1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-footer-legend">
          {scoreData.map(item => (
            <button
              key={item.rangeKey}
              className={`legend-badge ${selectedScoreRange === item.rangeKey ? 'legend-badge-active' : ''}`}
              onClick={() => handleBarClick(item)}
            >
              <span className="legend-color-dot" style={{ backgroundColor: item.fill }} />
              <span>{item.rangeKey}%</span>
              <span className="legend-count">({item.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Risk Level Breakdown Donut Chart */}
      <div className={`glass-card chart-card ${selectedRiskLevel ? 'chart-card-filtered' : ''}`}>
        <div className="chart-header">
          <div className="chart-header-title">
            <PieIcon size={16} className="chart-title-icon" />
            <h3 className="section-title">Risk Level Breakdown</h3>
          </div>
          {selectedRiskLevel ? (
            <button 
              className="chart-filter-pill active" 
              onClick={onClearRiskLevel}
              title="Click to clear risk level filter"
            >
              <span>Risk: {selectedRiskLevel}</span>
              <X size={12} />
            </button>
          ) : (
            <span className="chart-hint">Click a segment to filter table</span>
          )}
        </div>

        <div className="chart-container" style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={riskData} 
                cx="50%" 
                cy="50%" 
                innerRadius={60} 
                outerRadius={88} 
                paddingAngle={4} 
                dataKey="value"
                cursor="pointer"
                onClick={handlePieClick}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {riskData.map((entry) => {
                  const isSelected = selectedRiskLevel === entry.name;
                  return (
                    <PieCell 
                      key={`pie-${entry.name}`} 
                      fill={entry.fill} 
                      stroke={isSelected ? '#0f172a' : '#ffffff'}
                      strokeWidth={isSelected ? 3 : 1}
                      opacity={selectedRiskLevel && !isSelected ? 0.45 : 1}
                    />
                  );
                })}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} Bidders`, `${name} Risk`]}
                contentStyle={{ 
                  borderRadius: '6px', 
                  border: '1px solid #cbd5e1', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: '0.8rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-footer-legend">
          {riskData.map(item => (
            <button
              key={item.name}
              className={`legend-badge ${selectedRiskLevel === item.name ? 'legend-badge-active' : ''}`}
              onClick={() => handlePieClick(item)}
            >
              <span className="legend-color-dot" style={{ backgroundColor: item.fill }} />
              <span>{item.name}</span>
              <span className="legend-count">({item.value})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
