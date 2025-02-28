import React, { useState, useEffect } from 'react';
import './MenuBar.css';

function MenuBar({ onFileUploadClick, onNewPatternClick, isDarkMode, onToggleDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when screen size becomes larger than mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = (callback) => {
    callback();
    setIsMenuOpen(false);
  };

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <button 
        className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <div className="burger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Overlay for mobile menu */}
      <div 
        className={`menu-overlay ${isMenuOpen ? 'show' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div className={`side-menu ${isDarkMode ? 'dark' : ''} ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-logo">
          <i className="fas fa-shield-alt"></i>
          <span>MINI - DLP</span>
        </div>
        
        <div className="menu-buttons">
          <button className="menu-button" onClick={() => handleMenuClick(onFileUploadClick)}>
            <i className="fas fa-file-upload"></i>
            <span>File Upload</span>
          </button>
          <button className="menu-button" onClick={() => handleMenuClick(onNewPatternClick)}>
            <i className="fas fa-plus"></i>
            <span>New Pattern</span>
          </button>
        </div>

        <div className="menu-footer">
          <button className="theme-toggle" onClick={onToggleDarkMode}>
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default MenuBar; 