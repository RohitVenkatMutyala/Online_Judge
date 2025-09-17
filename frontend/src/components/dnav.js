import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Dnav() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  const navLinkStyle = {
    background: 'linear-gradient(135deg, #11998e, #38ef7d)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '600',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    padding: '8px 16px',
    borderRadius: '8px',
    position: 'relative',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const handleNavLinkHover = (e, isEnter) => {
    if (isEnter) {
      e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
      e.target.style.WebkitBackgroundClip = 'text';
      e.target.style.WebkitTextFillColor = 'transparent';
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 12px rgba(241, 39, 17, 0.3)';
    } else {
      e.target.style.background = 'linear-gradient(135deg, #11998e, #38ef7d)';
      e.target.style.WebkitBackgroundClip = 'text';
      e.target.style.WebkitTextFillColor = 'transparent';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
    }
  };

  return (
    <>
      {/* Enhanced Navigation Bar */}
      <nav className="navbar navbar-expand-lg sticky-top shadow-lg"
           style={{
             background: 'linear-gradient(135deg, #1a1d23 0%, #20232a 50%, #2c3e50 100%)',
             backdropFilter: 'blur(10px)',
             borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
           }}>
        <div className="container-fluid px-4">

          {/* === MODIFIED LOGO SECTION START === */}
          <Link to="/dashboard" className="navbar-brand d-flex align-items-center gap-3 py-2">
            <div className="position-relative">
              <svg
                width="45"
                height="45"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  filter: 'drop-shadow(0 6px 12px rgba(0, 201, 255, 0.4)) drop-shadow(0 0 20px rgba(146, 254, 157, 0.3))',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(20deg) scale(1.15)';
                  e.currentTarget.style.filter = 'drop-shadow(0 8px 16px rgba(241, 39, 17, 0.5)) drop-shadow(0 0 30px rgba(245, 175, 25, 0.4))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                  e.currentTarget.style.filter = 'drop-shadow(0 6px 12px rgba(0, 201, 255, 0.4)) drop-shadow(0 0 20px rgba(146, 254, 157, 0.3))';
                }}
              >
                <defs>
                  <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00C9FF" />
                    <stop offset="35%" stopColor="#92FE9D" />
                    <stop offset="70%" stopColor="#38ef7d" />
                    <stop offset="100%" stopColor="#11998e" />
                  </linearGradient>
                  <linearGradient id="logoGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f12711" />
                    <stop offset="50%" stopColor="#f5af19" />
                    <stop offset="100%" stopColor="#ff6b6b" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="50" cy="50" r="40" fill="url(#logoGrad1)" opacity="0.95" filter="url(#glow)"/>
                {/* This is the new inner circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  fill="none"
                  stroke="url(#logoGrad2)"
                  strokeWidth="5"
                  filter="url(#glow)"
                />
              </svg>

              {/* Animated Ring Effect */}
              <div
                style={{
                  position: 'absolute',
                  top: '-5px',
                  left: '-5px',
                  width: '55px',
                  height: '55px',
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(45deg, #f12711, #f5af19, #11998e, #38ef7d)',
                  backgroundClip: 'padding-box',
                  opacity: '0',
                  transition: 'all 0.4s ease'
                }}
                className="logo-ring"
              ></div>
            </div>

            <span
              className="fw-bold"
              style={{
                background: 'linear-gradient(135deg, #f12711 0%, #f5af19 30%, #ff6b6b 70%, #ee5a52 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '2rem',
                fontWeight: '800',
                letterSpacing: '-0.8px',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                textShadow: '0 4px 8px rgba(241, 39, 17, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 30%, #00C9FF 70%, #92FE9D 100%)';
                e.target.style.WebkitBackgroundClip = 'text';
                e.target.style.WebkitTextFillColor = 'transparent';
                e.target.style.transform = 'scale(1.08)';
                e.target.style.textShadow = '0 6px 12px rgba(17, 153, 142, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #f12711 0%, #f5af19 30%, #ff6b6b 70%, #ee5a52 100%)';
                e.target.style.WebkitBackgroundClip = 'text';
                e.target.style.WebkitTextFillColor = 'transparent';
                e.target.style.transform = 'scale(1)';
                e.target.style.textShadow = '0 4px 8px rgba(241, 39, 17, 0.3)';
              }}
            >
              Randoman
            </span>
          </Link>
          {/* === MODIFIED LOGO SECTION END === */}

          {/* Enhanced Mobile Toggle */}
          <button
            className="navbar-toggler border-0 p-2"
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'linear-gradient(135deg, #f12711, #f5af19)',
              borderRadius: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 4px 15px rgba(241, 39, 17, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <i className={`bi ${isCollapsed ? 'bi-list' : 'bi-x'} text-white fs-4`}></i>
          </button>

          {/* Enhanced Navigation Menu */}
          <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-1 align-items-lg-center">
              {user ? (
                <>

                  {/* Enhanced Action Buttons */}
                  <li className="nav-item ms-lg-3">
                    <div className="d-flex gap-2 align-items-center">

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="btn rounded-3 px-4 py-2"
                        style={{
                          border: 'none',
                          color: 'white',
                          fontWeight: '600',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 8px rgba(238, 90, 82, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg,  #f12711, #f5af19)';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(241, 39, 17, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(238, 90, 82, 0.3)';
                        }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </div>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link
                    className="btn rounded-pill px-4 py-2"
                    to="/login"
                    style={{
                      background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                      border: 'none',
                      color: 'white',
                      fontWeight: '600',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #11998e, #38ef7d)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <i className="bi bi-person-fill me-2"></i>
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* CSS for additional logo effects */}
      <style>{`
        .navbar-brand:hover .logo-ring {
          opacity: 1 !important;
          animation: rotate 2s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default Dnav;