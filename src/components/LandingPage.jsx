import React from 'react';
import './LandingPage.css';

export default function LandingPage({ onGoToLogin }) {
  return (
    <div className="embed-landing-container">
      {/* Poster Rekaan */}
      <img 
        src="/Homepage.png" 
        alt="Proton ME Data Tracking System" 
        className="poster-image" 
      />

      {/* Butang Lutsinar bertindih di atas butang LOGIN poster */}
      <button 
        className="invisible-login-btn" 
        onClick={onGoToLogin}
        title="Click to Log In"
      >
        LOGIN
      </button>
    </div>
  );
}