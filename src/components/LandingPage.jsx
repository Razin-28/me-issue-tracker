import React from 'react';
import './LandingPage.css';

export default function LandingPage({ onGoToLogin }) {
  return (
    <div className="embed-landing-container">
      {/* Butang Lutsinar bertindih di atas butang LOGIN poster */}
      <button 
        className="invisible-login-btn" 
        onClick={onGoToLogin}
        title="Click to Log In"
        aria-label="Log In"
      >
        LOGIN
      </button>
    </div>
  );
}