import React, { useState, useEffect } from 'react';
import './LandingPage.css';

export default function LandingPage({ onGoToLogin }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bgImage = isMobile
    ? `${process.env.PUBLIC_URL}/HomepageMobile.png`
    : `${process.env.PUBLIC_URL}/Homepage.png`;

  return (
    <div 
      className="embed-landing-container"
      style={{
        backgroundImage: `url(${bgImage})`
      }}
    >
      {/* Butang Lutsinar Mengikut Saiz Poster */}
      <button 
        className="invisible-login-btn" 
        onClick={onGoToLogin}
        title="Click to Log In"
        aria-label="Log In"
      />
    </div>
  );
}