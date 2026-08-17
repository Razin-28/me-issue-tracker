import React from 'react';
import './LandingPage.css';

export default function LandingPage({ onGoToLogin }) {
  return (
    <div className="embed-landing-container">
      {/* Poster Rekaan */}
      <img 
        src="/Homepage.png" 
        alt="Proton ME Issue Tracking System" 
        className="poster-image" 
      />

      {/* Butang Lutsinar bertindih di atas butang LOGIN poster */}
      <button 
        className="invisible-login-btn" 
        onClick={onGoToLogin}
        title="Klik untuk Log Masuk"
      >
        LOGIN
      </button>
    </div>
  );
}