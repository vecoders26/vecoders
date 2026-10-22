import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ========== NAVBAR ========== */}
      <nav className="navbar" id="navbar">
        <Link to="/" className="navbar__brand" onClick={closeMobileMenu}>
          <img src="/logo.png" alt="VECODERS Logo" className="navbar__logo" onError={(e) => { e.target.style.display = 'none'; }} />
          <span className="navbar__name">VECODERS</span>
        </Link>

        {/* Centre nav pill */}
        <div className="navbar__center">
          <ul className="navbar__links" id="navLinks">
            <li>
              <NavLink 
                to="/about" 
                style={({ isActive }) => isActive ? { color: 'var(--orange)' } : undefined}
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/events" 
                style={({ isActive }) => isActive ? { color: 'var(--orange)' } : undefined}
              >
                Events
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/blog" 
                style={({ isActive }) => isActive ? { color: 'var(--orange)' } : undefined}
              >
                Blog
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/timeline" 
                style={({ isActive }) => isActive ? { color: 'var(--orange)' } : undefined}
              >
                Timeline
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/achievements" 
                style={({ isActive }) => isActive ? { color: 'var(--orange)' } : undefined}
              >
                Achievements
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Right buttons */}
        <div className="navbar__right">
          <button className="btn-glass" aria-label="Utilities">
            <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
              <path d="M432 320h-32a16 16 0 0 0-16 16v112H64V128h144a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16H48A48 48 0 0 0 0 112v352a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48V336a16 16 0 0 0-16-16zM488 0H360c-21.37 0-32 25.91-17 41l35.73 35.73L135 320.37a24 24 0 0 0 0 34L157.67 377a24 24 0 0 0 34 0l243.61-243.68L471 169c15 15 41 4.5 41-17V24a24 24 0 0 0-24-24z" />
            </svg>
          </button>
          <Link to="/register">
            <button className="btn-glass" id="btnRegister">Register</button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div 
          className={`navbar__hamburger ${mobileMenuOpen ? 'active' : ''}`} 
          id="hamburger" 
          aria-label="Menu"
          onClick={toggleMobileMenu}
        >
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className={`navbar__mobile ${mobileMenuOpen ? 'active' : ''}`} id="mobileNav">
        <Link to="/about" onClick={closeMobileMenu}>About</Link>
        <Link to="/events" onClick={closeMobileMenu}>Events</Link>
        <Link to="/blog" onClick={closeMobileMenu}>Blog</Link>
        <Link to="/timeline" onClick={closeMobileMenu}>Timeline</Link>
        <Link to="/achievements" onClick={closeMobileMenu}>Achievements</Link>
        <Link to="/register" className="btn-primary" style={{ marginTop: '12px', justifyContent: 'center' }} onClick={closeMobileMenu}>
          Register for Events
        </Link>
      </div>
    </>
  );
}
