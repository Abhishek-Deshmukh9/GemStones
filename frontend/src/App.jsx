import React, { useState } from 'react';
import Hero from './components/Hero/Hero';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DashboardView from './components/Dashboard/DashboardView';
import TendersView from './components/Tenders/TendersView';
import BiddersView from './components/Bidders/BiddersView';
import UploadView from './components/Upload/UploadView';
import AuditView from './components/Audit/AuditView';
import './components/Layout/Layout.css';

export default function App() {
  const [showHero, setShowHero] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBidderId, setSelectedBidderId] = useState(null);
  const [selectedTenderId, setSelectedTenderId] = useState(null);

  const handleSelectBidderFromAnywhere = (id) => {
    setSelectedTenderId(null);
    setSelectedBidderId(id);
    setActiveTab('bidders');
  };

  const handleSelectTender = (id) => {
    setSelectedTenderId(id);
    setActiveTab('bidders');
  };

  return (
    <>
      {showHero && <Hero onEnter={() => setShowHero(false)} />}

      {!showHero && (
        <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="app-main">
        <Header activeTab={activeTab} />
        
        <div className="content-wrapper">
          {activeTab === 'verification' && (
            <TendersView 
              onSelectTender={handleSelectTender} 
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView 
              onSelectBidder={handleSelectBidderFromAnywhere} 
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'bidders' && (
            <BiddersView 
              selectedBidderId={selectedBidderId} 
              onSelectBidder={setSelectedBidderId} 
              selectedTenderId={selectedTenderId}
            />
          )}

          {activeTab === 'upload' && (
            <UploadView />
          )}

          {activeTab === 'audit' && (
            <AuditView />
          )}
        </div>
      </main>
    </div>
      )}
    </>
  );
}
