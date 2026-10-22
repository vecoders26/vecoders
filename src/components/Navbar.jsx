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
