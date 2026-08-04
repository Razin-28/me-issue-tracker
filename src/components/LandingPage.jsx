import React from 'react';
import './LandingPage.css';

export default function LandingPage({ onGoToLogin }) {
  return (
    <div className="embed-landing-container">
      {/* Poster Rekaan Anda */}
      <img 
        src="/Homepage.jpg" 
        alt="Proton ME Issue Tracking System" 
        className="poster-image" 
      />

      {/* Butang Lutsinar (Invisible Button) bertindih di atas butang LOGIN poster */}
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