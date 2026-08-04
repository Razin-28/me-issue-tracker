import React from 'react';
import './LandingPage.css';

export default function LandingPage({ onGoToLogin }) {
  return (
    <div className="landing-container">
      {/* Bahagian Kiri (Warna Biru / Header Text) */}
      <div className="landing-left">
        <div className="logo-section">
          {/* Logo Proton / Syarikat */}
          <div className="brand-logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">PROTON</span>
          </div>
        </div>

        <div className="hero-content">
          <h3 className="sub-heading">MANUFACTURING ENGINEERING DEPARTMENT</h3>
          <h1 className="main-heading">ISSUE TRACKING SYSTEM</h1>

          <div className="action-section">
            <button className="login-btn" onClick={onGoToLogin}>
              <span className="arrow-circle">➔</span>
              <span className="btn-text">LOGIN</span>
            </button>
          </div>
        </div>

        <div className="landing-footer">
          Developed by Razin ME
        </div>
      </div>

      {/* Bahagian Kanan (Gambar Kilang / Plant Background) */}
      <div className="landing-right">
        <div className="overlay-graphic"></div>
      </div>
    </div>
  );
}