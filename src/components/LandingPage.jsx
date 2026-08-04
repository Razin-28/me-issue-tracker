import React from 'react';
import './LandingPage.css';

export default function LandingPage({ onGoToLogin }) {
  return (
    <div className="proton-landing">
      {/* Bahagian Kiri (Kawasan Biru) */}
      <div className="left-panel">
        {/* Header Logo */}
        <div className="logo-header">
          <img src="/proton-logo.png" alt="Proton Logo" className="proton-logo-img" />
          <span className="proton-text">PROTON</span>
        </div>

        {/* Kandungan Utama */}
        <div className="center-content">
          <h2 className="dept-title">MANUFACTURING ENGINEERING DEPARTMENT</h2>
          <h1 className="system-title">ISSUE TRACKING SYSTEM</h1>

          {/* Butang Login & Icon */}
          <div className="login-action-group">
            <button className="login-circle-icon" onClick={onGoToLogin}>
              ❯
            </button>
            <button className="login-btn-yellow" onClick={onGoToLogin}>
              LOGIN
            </button>
          </div>
        </div>

        {/* Footer Badge */}
        <div className="developer-badge">
          Developed by Razin ME
        </div>

        {/* Garisan Hiasan Kuning Bawah */}
        <div className="yellow-accent-lines"></div>
      </div>

      {/* Bahagian Kanan (Gambar Kilang & Corak Grafik) */}
      <div className="right-panel">
        <div className="plant-bg-image" style={{ backgroundImage: `url('/proton-plant.jpg')` }}></div>
        
        {/* Hiasan Chevrons / Anak Panah Kuning Kanan Bawah */}
        <div className="chevrons-container">
          <span>❯</span>
          <span>❯</span>
          <span>❯</span>
        </div>

        {/* Garisan Kuning Atas Kanan */}
        <div className="top-right-lines"></div>
      </div>
    </div>
  );
}