import React from 'react';
import { UserCheck } from 'lucide-react';

export default function Header({ activeTab, onQuickVerify }) {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Procurement Compliance Overview';
      case 'bidders':
        return 'Registered Bidder Master Registry';
      case 'verification':
        return 'Multi-Portal Verification & Risk Engine';
      case 'upload':
        return 'Statutory Document Ingestion & AI Extractor';
      case 'audit':
        return 'Government Procurement Audit Trail';
      default:
        return 'GeM Procurement Dashboard';
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-title">{getPageTitle()}</h1>
      </div>

      <div className="header-right">
        <div className="officer-badge">
          <UserCheck size={14} color="#10b981" />
          <span>GeM Nodal Officer (Desk 4)</span>
        </div>
      </div>
    </header>
  );
}
