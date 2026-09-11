import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  ShieldCheck, 
  FileUp, 
  History, 
  Cpu
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'bidders', label: 'Bidder Directory', icon: Building2 },
    { id: 'verification', label: 'Tender Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Document Auditor (AI)', icon: FileUp },
    { id: 'audit', label: 'Audit Trail', icon: History },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">GS</div>
        <div>
          <div className="brand-title">GeMStones</div>
          <div className="brand-subtitle">Compliance AI</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status-indicator">
          <span className="status-dot" />
          <span>Gov Portals: Online (Sim)</span>
        </div>
        <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#64748b' }}>
          SIH 2026 Prototype v1.0
        </div>
      </div>
    </aside>
  );
}
