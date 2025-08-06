import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useTheme } from '../context/ThemeContext'; // Theme context

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  return (
    <nav 
      className="navbar navbar-expand-lg sticky-top shadow-lg" 
      style={{ 
        background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="container-fluid px-4">

        <Link to="/" className="navbar-brand d-flex align-items-center gap-3">
          {/* Enhanced Logo */}
          <div className="position-relative">
            <svg
              width="42"
              height="42"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              className="logo-svg"
              style={{
                filter: 'drop-shadow(0 2px 8px rgba(241, 39, 17, 0.3))',
                transition: 'all 0.3s ease'
              }}
            >
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8e44ad" />
                  <stop offset="50%" stopColor="#3498db" />
                  <stop offset="100%" stopColor="#92FE9D" />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f12711" />
                  <stop offset="100%" stopColor="#f5af19" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="50" cy="50" r="45" fill="url(#grad1)" filter="url(#glow)" />
              <path
                d="M50 20 L65 45 L35 45 Z"
                fill="url(#grad2)"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
              />
              <circle cx="50" cy="65" r="6" fill="rgba(255,255,255,0.9)" />
            </svg>
          </div>

          <div className="brand-text">
            <span
              className="fw-bold"
              style={{
                fontSize: '1.8rem',
                background: 'linear-gradient(135deg, #f12711, #f5af19)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #8e44ad, #3498db)';
                e.target.style.WebkitBackgroundClip = 'text';
                e.target.style.WebkitTextFillColor = 'transparent';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
                e.target.style.WebkitBackgroundClip = 'text';
                e.target.style.WebkitTextFillColor = 'transparent';
              }}
            >
              Randoman
            </span>
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'rgba(255,255,255,0.6)',
              fontWeight: '500',
              marginTop: '-2px'
            }}>
              Code • Collaborate • Create
            </div>
          </div>
        </Link>

        {/* Enhanced Mobile Toggle */}
        <button
          className="navbar-toggler position-relative"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '8px 12px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(142, 68, 173, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(142, 68, 173, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <i className="bi bi-list text-white fs-5"></i>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-1 align-items-center">
            {user ? (
              <>
                {isAdmin ? (
                  <>
                    <li className="nav-item">
                      <Link 
                        className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                        to="/admindashboard"
                        style={{
                          background: 'rgba(17, 153, 142, 0.1)',
                          color: '#38ef7d',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(56, 239, 125, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(241, 39, 17, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(17, 153, 142, 0.1)';
                          e.target.style.color = '#38ef7d';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <i className="bi bi-person-workspace"></i> 
                        <span className="d-none d-lg-inline">Profile</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                        to="/postproblem"
                        style={{
                          background: 'rgba(17, 153, 142, 0.1)',
                          color: '#38ef7d',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(56, 239, 125, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(241, 39, 17, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(17, 153, 142, 0.1)';
                          e.target.style.color = '#38ef7d';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <i className="bi bi-pencil-square"></i> 
                        <span className="d-none d-lg-inline">Post Problem</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                        to="/test"
                        style={{
                          background: 'rgba(17, 153, 142, 0.1)',
                          color: '#38ef7d',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(56, 239, 125, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(241, 39, 17, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(17, 153, 142, 0.1)';
                          e.target.style.color = '#38ef7d';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <i className="bi bi-beaker"></i> 
                        <span className="d-none d-lg-inline">Set_TC</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                        to="/adminproblems"
                        style={{
                          background: 'rgba(17, 153, 142, 0.1)',
                          color: '#38ef7d',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(56, 239, 125, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(241, 39, 17, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(17, 153, 142, 0.1)';
                          e.target.style.color = '#38ef7d';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <i className="bi bi-list-task"></i> 
                        <span className="d-none d-lg-inline">View Problems</span>
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link
                        className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                        to="/dashboard"
                        style={{
                          background: 'rgba(17, 153, 142, 0.1)',
                          color: '#38ef7d',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(56, 239, 125, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(241, 39, 17, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(17, 153, 142, 0.1)';
                          e.target.style.color = '#38ef7d';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <i className="bi bi-person-workspace"></i> 
                        <span className="d-none d-lg-inline">Profile</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                        to="/problems"
                        style={{
                          background: 'rgba(17, 153, 142, 0.1)',
                          color: '#38ef7d',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(56, 239, 125, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(241, 39, 17, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(17, 153, 142, 0.1)';
                          e.target.style.color = '#38ef7d';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <i className="bi bi-journal-check"></i> 
                        <span className="d-none d-lg-inline">Problems</span>
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                        to="/contexts"
                        style={{
                          background: 'rgba(17, 153, 142, 0.1)',
                          color: '#38ef7d',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(56, 239, 125, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(241, 39, 17, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(17, 153, 142, 0.1)';
                          e.target.style.color = '#38ef7d';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <i className="bi bi-collection"></i> 
                        <span className="d-none d-lg-inline">Contexts</span>
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        className="nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                        to="/sub"
                        style={{
                          background: 'rgba(17, 153, 142, 0.1)',
                          color: '#38ef7d',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(56, 239, 125, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(241, 39, 17, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(17, 153, 142, 0.1)';
                          e.target.style.color = '#38ef7d';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <i className="bi bi-upload"></i> 
                        <span className="d-none d-lg-inline">Submissions</span>
                      </Link>
                    </li>
                  </>
                )}

                {/* User Info Badge */}
                <li className="nav-item d-none d-lg-block">
                  <div 
                    className="px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                    style={{
                      background: 'rgba(52, 152, 219, 0.1)',
                      border: '1px solid rgba(52, 152, 219, 0.3)',
                      color: '#3498db',
                      fontSize: '0.9rem'
                    }}
                  >
                    <i className="bi bi-person-circle"></i>
                    <span>{user?.firstname }</span>
                    {isAdmin && (
                      <span 
                        className="badge rounded-pill ms-1"
                        style={{
                          background: 'linear-gradient(135deg, #f12711, #f5af19)',
                          fontSize: '0.7rem'
                        }}
                      >
                        Admin
                      </span>
                    )}
                  </div>
                </li>

                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn px-4 py-2 rounded-3 d-flex align-items-center gap-2"
                    style={{
                      background: 'rgba(220, 53, 69, 0.1)',
                      color: '#dc3545',
                      border: '1px solid rgba(220, 53, 69, 0.3)',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(220, 53, 69, 0.1)';
                      e.target.style.color = '#dc3545';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <i className="bi bi-box-arrow-right"></i> 
                    <span className="d-none d-lg-inline">Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link 
                  className="nav-link px-4 py-2 rounded-3 d-flex align-items-center gap-2"
                  to="/login"
                  style={{
                    background: 'linear-gradient(135deg, #f12711, #f5af19)',
                    color: 'white',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #8e44ad, #3498db)';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(142, 68, 173, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #f12711, #f5af19)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <i className="bi bi-box-arrow-in-right"></i> 
                  <span>Login</span>
                </Link>
              </li>
            )}

            {/* Enhanced Theme Toggle */}
          { user && <li className="nav-item ms-2">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="btn px-3 py-2 rounded-3 d-flex align-items-center justify-content-center"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#f8f9fa',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  width: '45px',
                  height: '45px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ffc107, #ff8f00)';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = '#f8f9fa';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {theme === 'dark' ? (
                  <i className="bi bi-sun-fill fs-5"></i>
                ) : (
                  <i className="bi bi-moon-stars-fill fs-5"></i>
                )}
              </button>
            </li>}
          </ul>
        </div>
      </div>

      {/* Add custom styles for logo animation */}
      <style jsx>{`
        .logo-svg:hover {
          transform: rotate(5deg) scale(1.05);
          filter: drop-shadow(0 4px 12px rgba(142, 68, 173, 0.4));
        }
        
        .navbar-brand:hover .brand-text {
          transform: translateY(-1px);
        }
        
        @media (max-width: 991px) {
          .nav-link span {
            display: inline !important;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;