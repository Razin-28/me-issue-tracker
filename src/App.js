import React, { useEffect, useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import CreateIssue from './components/CreateIssue';
import IssueList from './components/IssueList';
import TagMapUpdates from './components/TagMap';
import DashboardAnalytics from './components/DashboardAnalytics'; // Import komponen Analytics

export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // 1. Semak sesi log masuk awal dari Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    // 2. Dengar perubahan status auth (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setUserProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (data) setUserProfile(data);
  };

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  const handleIssueCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('list');
  };

  if (!session) {
    return <Auth />;
  }

  // Dapatkan nama secara dinamik dari profile atau metadata pendaftaran
  const displayName = 
    userProfile?.full_name || 
    session.user?.user_metadata?.full_name || 
    session.user?.user_metadata?.name || 
    'USER';

  // Dapatkan Staff ID dari profile, metadata, atau emel
  const staffIdDisplay = 
    userProfile?.staff_id || 
    session.user?.user_metadata?.staff_id || 
    (session.user.email ? session.user.email.split('@')[0].toUpperCase() : 'N/A');

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <div className="top-nav">
        <button className="exit-btn" onClick={handleLogout}>
          <span style={{ fontSize: '20px' }}>🚪</span> Exit
        </button>
        {activeTab !== 'home' && (
          <button 
            onClick={() => setActiveTab('home')}
            style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #007bff', background: '#fff', color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ⬅️ Back to Dashboard
          </button>
        )}
      </div>

      {/* Main Content View */}
      {activeTab === 'home' && (
        <div className="dashboard-grid">
          {/* Main Left Hero Card */}
          <div className="hero-card">
            <div className="hero-title">
              <h1>Manufacturing Engineering</h1>
              <h2>DATA TRACKER</h2>
            </div>

            <div className="user-profile">
              <div className="avatar">👤</div>
              <div className="welcome-text">
                <div className="welcome-title">Welcome,</div>
                <div className="user-name">{displayName}</div>
                <div className="staff-id-text">({staffIdDisplay})</div>
              </div>
            </div>
          </div>

          {/* Menu Cards */}
          <div className="menu-card card-list" onClick={() => setActiveTab('list')}>
            <div className="card-overlay">
              <h3>List of Issues</h3>
            </div>
          </div>

          <div className="menu-card card-create" onClick={() => setActiveTab('create')}>
            <div className="card-overlay">
              <h3>Add New Issue</h3>
            </div>
          </div>

          {/* Navigasi terus ke Dashboard Analytics */}
          <div className="menu-card card-dashboard" onClick={() => setActiveTab('analytics')}>
            <div className="card-overlay">
              <h3>Dashboard Analytics</h3>
            </div>
          </div>

          {/* Navigasi terus ke TagMap Updates */}
          <div className="menu-card card-escalate" onClick={() => setActiveTab('tagmap')}>
            <div className="card-overlay">
              <h3>TagMap Updates</h3>
            </div>
          </div>
        </div>
      )}

      {/* View: Create Issue Form */}
      {activeTab === 'create' && (
        <div>
          <h2>Add New Issue</h2>
          <CreateIssue 
            userProfile={{ id: session.user.id, department: userProfile?.department || 'ME' }} 
            onIssueCreated={handleIssueCreated} 
          />
        </div>
      )}

      {/* View: Issue List Table */}
      {activeTab === 'list' && (
        <div>
          <IssueList 
            userProfile={{ id: session.user.id }} 
            refreshTrigger={refreshTrigger} 
          />
        </div>
      )}

      {/* View: Dashboard Analytics */}
      {activeTab === 'analytics' && (
        <div>
          <DashboardAnalytics />
        </div>
      )}

      {/* View: TagMap Updates Table */}
      {activeTab === 'tagmap' && (
        <div>
          <TagMapUpdates onBackToDashboard={() => setActiveTab('home')} />
        </div>
      )}

      {/* Footer */}
      <div className="footer">
        <span>©</span> Developed by Razin ME
      </div>
    </div>
  );
}