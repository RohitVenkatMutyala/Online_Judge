import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Navbar() {
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
          
          {/* Enhanced Brand Logo */}
          <Link to="/dashboard" className="navbar-brand d-flex align-items-center gap-3 py-2">
            <div className="position-relative">
              <svg
                width="40"
                height="40"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0, 201, 255, 0.3))',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'rotate(15deg) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'rotate(0deg) scale(1)';
                }}
              >
                <defs>
                  <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00C9FF" />
                    <stop offset="50%" stopColor="#92FE9D" />
                    <stop offset="100%" stopColor="#38ef7d" />
                  </linearGradient>
                  <linearGradient id="logoGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f12711" />
                    <stop offset="100%" stopColor="#f5af19" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="40" fill="url(#logoGrad1)" opacity="0.9"/>
                <path
                  d="M50 20 L65 45 L35 45 Z"
                  fill="url(#logoGrad2)"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <circle cx="50" cy="65" r="6" fill="#fff" opacity="0.9"/>
              </svg>
            </div>
            
            <span
              className="fw-bold"
              style={{
                background: 'linear-gradient(135deg, #f12711, #f5af19, #ff6b6b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.8rem',
                fontWeight: '700',
                letterSpacing: '-0.5px',
                transition: 'all 0.4s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #11998e, #38ef7d, #00C9FF)';
                e.target.style.WebkitBackgroundClip = 'text';
                e.target.style.WebkitTextFillColor = 'transparent';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19, #ff6b6b)';
                e.target.style.WebkitBackgroundClip = 'text';
                e.target.style.WebkitTextFillColor = 'transparent';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Randoman
            </span>
          </Link>

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
                  {isAdmin ? (
                    <>
                      <li className="nav-item">
                        <Link className="nav-link" to="/admindashboard" style={navLinkStyle}
                              onMouseEnter={(e) => handleNavLinkHover(e, true)}
                              onMouseLeave={(e) => handleNavLinkHover(e, false)}>
                          <i className="bi bi-speedometer2"></i>
                          <span>Admin Dashboard</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/postproblem" style={navLinkStyle}
                              onMouseEnter={(e) => handleNavLinkHover(e, true)}
                              onMouseLeave={(e) => handleNavLinkHover(e, false)}>
                          <i className="bi bi-plus-circle-fill"></i>
                          <span>Create Problem</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/test" style={navLinkStyle}
                              onMouseEnter={(e) => handleNavLinkHover(e, true)}
                              onMouseLeave={(e) => handleNavLinkHover(e, false)}>
                          <i className="bi bi-gear-fill"></i>
                          <span>Test Cases</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/adminproblems" style={navLinkStyle}
                              onMouseEnter={(e) => handleNavLinkHover(e, true)}
                              onMouseLeave={(e) => handleNavLinkHover(e, false)}>
                          <i className="bi bi-collection-fill"></i>
                          <span>Manage Problems</span>
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="nav-item">
                        <Link className="nav-link" to="/dashboard" style={navLinkStyle}
                              onMouseEnter={(e) => handleNavLinkHover(e, true)}
                              onMouseLeave={(e) => handleNavLinkHover(e, false)}>
                          <i className="bi bi-house-fill"></i>
                          <span>Dashboard</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/problems" style={navLinkStyle}
                              onMouseEnter={(e) => handleNavLinkHover(e, true)}
                              onMouseLeave={(e) => handleNavLinkHover(e, false)}>
                          <i className="bi bi-code-slash"></i>
                          <span>Problems</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/funda" style={navLinkStyle}
                              onMouseEnter={(e) => handleNavLinkHover(e, true)}
                              onMouseLeave={(e) => handleNavLinkHover(e, false)}>
                          <i className="bi bi-book-fill"></i>
                          <span>Fundamentals</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/contexts" style={navLinkStyle}
                              onMouseEnter={(e) => handleNavLinkHover(e, true)}
                              onMouseLeave={(e) => handleNavLinkHover(e, false)}>
                          <i className="bi bi-trophy-fill"></i>
                          <span>Contests</span>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/sub" style={navLinkStyle}
                              onMouseEnter={(e) => handleNavLinkHover(e, true)}
                              onMouseLeave={(e) => handleNavLinkHover(e, false)}>
                          <i className="bi bi-file-earmark-check-fill"></i>
                          <span>Submissions</span>
                        </Link>
                      </li>
                    </>
                  )}

                  {/* Enhanced Action Buttons */}
                  <li className="nav-item ms-lg-3">
                    <div className="d-flex gap-2 align-items-center">
                      {/* Theme Toggle */}
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="btn btn-outline-light rounded-pill"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          width: '45px',
                          height: '45px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #11998e, #38ef7d)';
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.boxShadow = '0 4px 15px rgba(17, 153, 142, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'} fs-5`}></i>
                      </button>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="btn rounded-pill px-4 py-2"
                        style={{
                          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                          border: 'none',
                          color: 'white',
                          fontWeight: '600',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 8px rgba(238, 90, 82, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(241, 39, 17, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
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
    </>
  );
}

export default Navbar;