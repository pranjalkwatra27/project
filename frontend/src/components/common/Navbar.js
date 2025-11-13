import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      showNotification('Logged out successfully', 'success');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Error logging out', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<strong>${message}</strong>`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 80);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  return (
    <header>
      <Link to="/" className="logo-container">
        <span className="logo-text">Talent</span>
        <img
          src="/assets/logo.png"
          alt="TalentConnect Logo"
        />
        <span className="logo-text">Connect</span>
      </Link>

      <button 
        className={`menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{ display: 'none' }}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={mobileMenuOpen ? 'active' : ''}>
        <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
        <Link to="/browse-events" className={isActive('/browse-events') ? 'active' : ''}>Browse Events</Link>
        <Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
        <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>
        <Link to="/host-event" className={isActive('/host-event') ? 'active' : ''}>Host Event</Link>
      </nav>

      <div className="auth">
        {!currentUser ? (
          <>
            <button className="login" onClick={() => navigate('/login')}>Login</button>
            <button className="signup" onClick={() => navigate('/login')}>Sign Up</button>
          </>
        ) : (
          <div 
            className="user-welcome" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <i className="fas fa-user-circle"></i>
            <span>{userData?.name || 'Welcome'}</span>
            <i className="fas fa-chevron-down" style={{ fontSize: '12px' }}></i>

            <div 
              className={`user-dropdown ${dropdownOpen ? 'active' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="user-dropdown-header">
                <h4>{userData?.name || 'User Name'}</h4>
                <p>{userData?.email || currentUser.email}</p>
              </div>
              <div className="user-dropdown-menu">
                <Link to="/profile" className="user-dropdown-item">
                  <i className="fas fa-user"></i>
                  <span>My Profile</span>
                </Link>
                <Link to="/my-bookings" className="user-dropdown-item">
                  <i className="fas fa-ticket-alt"></i>
                  <span>My Bookings</span>
                </Link>
                <div className="user-dropdown-divider"></div>
                <div className="user-dropdown-item danger" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
