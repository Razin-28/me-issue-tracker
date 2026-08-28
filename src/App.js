import React, { useEffect, useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import CreateIssue from './components/CreateIssue';
import IssueList from './components/IssueList';
import TagMapUpdates from './components/TagMap';
import DashboardAnalytics from './components/DashboardAnalytics';

export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Helper untuk membaca tab semasa daripada URL Hash
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#/', '');
    const validTabs = ['home', 'create', 'list', 'analytics', 'tagmap'];
    return validTabs.includes(hash) ? hash : (hash === '' ? 'landing' : 'home');
  };

  const [activeTab, setActiveTab] = useState('home');

  // 1. Dengar perubahan Back / Forward daripada Browser & Gesture Telefon
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace('#/', '');
      
      // Jika tekan back semasa di Dashboard (home), bawa terus ke Homepage / Login (Logout)
      if (!currentHash || currentHash === '') {
        handleLogout();
      } else {
        const validTabs = ['home', 'create', 'list', 'analytics', 'tagmap'];
        if (validTabs.includes(currentHash)) {
          setActiveTab(currentHash);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [session]);

  // 2. Fungsi berpusat untuk buka mana-mana tab
  const navigateTo = (tabName) => {
    window.location.hash = `#/${tabName}`;
    setActiveTab(tabName);
  };

  // 3. Fungsi berpusat untuk butang Back manual
  const handleBackNavigation = () => {
    if (activeTab === 'home') {
      handleLogout();
    } else {
      navigateTo('home');
    }
  };

  useEffect(() => {
    // Semak sesi log masuk awal dari Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        window.location.hash = '#/home';
        setActiveTab('home');
      }
    });

    // Dengar perubahan status auth (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        setShowAuthModal(false);
        window.location.hash = '#/home';
        setActiveTab('home');
      } else {
        setUserProfile(null);
        window.location.hash = '';
      }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = '';
    setActiveTab('home');
    setShowAuthModal(false);
  };

  const handleIssueCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    navigateTo('list');
  };

  // 1. JIKA BELUM LOGIN
  if (!session) {
    if (showAuthModal) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9', padding: '20px' }}>
          <button
            onClick={() => setShowAuthModal(false)}
            style={{
              padding: '8px 16px',
              borderRadius: '5px',
              border: '1px solid #0d3b66',
              background: '#fff',
              color: '#0d3b66',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}
          >
            ⬅️ Back to Homepage
          </button>
          <Auth onLoginSuccess={() => setShowAuthModal(false)} />
        </div>
      );
    }
    return <LandingPage onGoToLogin={() => setShowAuthModal(true)} />;
  }

  // 2. JIKA SUDAH LOGIN
  const displayName = 
    userProfile?.full_name || 
    session.user?.user_metadata?.full_name || 
    session.user?.user_metadata?.name || 
    'USER';

  const staffIdDisplay = 
    userProfile?.staff_id || 
    session.user?.user_metadata?.staff_id || 
    'STAFF';

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <div className="top-nav">
        <button className="exit-btn" onClick={handleLogout}>
          <span style={{ fontSize: '20px' }}>🚪</span> Exit
        </button>
        {activeTab !== 'home' && (
          <button 
            className="back-btn"
            onClick={handleBackNavigation}
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

          {/* 4 Menu Cards */}
          <div className="menu-card card-list" onClick={() => navigateTo('list')}>
            <div className="card-overlay">
              <h3>List of Issues</h3>
            </div>
          </div>

          <div className="menu-card card-create" onClick={() => navigateTo('create')}>
            <div className="card-overlay">
              <h3>Add New Issue</h3>
            </div>
          </div>

          <div className="menu-card card-dashboard" onClick={() => navigateTo('analytics')}>
            <div className="card-overlay">
              <h3>Dashboard Analytics</h3>
            </div>
          </div>

          <div className="menu-card card-escalate" onClick={() => navigateTo('tagmap')}>
            <div className="card-overlay">
              <h3>TagMap Updates</h3>
            </div>
          </div>
        </div>
      )}

      {/* View: Create Issue Form */}
      {activeTab === 'create' && (
        <div>
          <CreateIssue 
            userProfile={{ id: session.user.id, department: userProfile?.department || 'ME', staff_id: staffIdDisplay }} 
            onBackToDashboard={handleBackNavigation}
            onIssueCreated={handleIssueCreated} 
          />
        </div>
      )}

      {/* View: Issue List Table */}
      {activeTab === 'list' && (
        <div>
          <IssueList 
            onBackToDashboard={handleBackNavigation}
            userProfile={{ id: session.user.id }} 
            refreshTrigger={refreshTrigger} 
          />
        </div>
      )}

      {/* View: Dashboard Analytics */}
      {activeTab === 'analytics' && (
        <div>
          <DashboardAnalytics onBack={handleBackNavigation} />
        </div>
      )}

      {/* View: TagMap Updates Table */}
      {activeTab === 'tagmap' && (
        <div>
          <TagMapUpdates onBack={handleBackNavigation} />
        </div>
      )}

      {/* Footer */}
      <div className="footer">
        <span>©</span> Developed by Razin ME
      </div>
    </div>
  );
}