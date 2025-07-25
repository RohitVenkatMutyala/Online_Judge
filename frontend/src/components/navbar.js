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
    <nav className="navbar navbar-expand-lg sticky-top" style={{ backgroundColor: '#20232a' }}>
      <div className="container-fluid px-4">

        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00C9FF" />
                <stop offset="100%" stopColor="#92FE9D" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f12711" />
                <stop offset="100%" stopColor="#f5af19" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="40" fill="url(#grad1)" />
            <path
              d="M50 20 L60 45 L40 45 Z"
              fill="url(#grad2)"
              stroke="#222"
              strokeWidth="2"
            />
            <circle cx="50" cy="65" r="5" fill="#222" />
          </svg>
        <span
  className="fw-bold fs-4"
  style={{
    background: 'linear-gradient(to right, #f12711, #f5af19',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '600',
    transition: 'all 20s ease',
    cursor: 'pointer',
  }}
  onMouseEnter={(e) => {
    e.target.style.background = 'linear-gradient(to right, #11998e, #38ef7d)';
    e.target.style.WebkitBackgroundClip = 'text';
    e.target.style.WebkitTextFillColor = 'transparent';
  }}
  onMouseLeave={(e) => {
    e.target.style.background = 'linear-gradient(to right, #f12711, #f5af19';
    e.target.style.WebkitBackgroundClip = 'text';
    e.target.style.WebkitTextFillColor = 'transparent';
  }}
>
  Randoman
</span>

        </Link>




        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list text-dark fs-4"></i>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-2">
            {user ? (
              <>
                {isAdmin ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/admindashboard"
                        style={{
                          background: 'linear-gradient(to right, #11998e, #38ef7d)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #f12711, #f5af19)';
                          e.target.style.WebkitBackgroundClip = 'text';
                          e.target.style.WebkitTextFillColor = 'transparent';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #11998e, #38ef7d)';
                          e.target.style.WebkitBackgroundClip = 'text';
                          e.target.style.WebkitTextFillColor = 'transparent';
                        }}>
                        <i className="bi bi-person-workspace me-1"></i> Profile
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/postproblem"
                        style={{
                          background: 'linear-gradient(to right, #11998e, #38ef7d)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #f12711, #f5af19)';
                          e.target.style.WebkitBackgroundClip = 'text';
                          e.target.style.WebkitTextFillColor = 'transparent';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #11998e, #38ef7d)';
                          e.target.style.WebkitBackgroundClip = 'text';
                          e.target.style.WebkitTextFillColor = 'transparent';
                        }}>
                        <i className="bi bi-pencil-square me-1"></i> Post Problem
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/test"
                        style={{
                          background: 'linear-gradient(to right, #11998e, #38ef7d)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #f12711, #f5af19)';
                          e.target.style.WebkitBackgroundClip = 'text';
                          e.target.style.WebkitTextFillColor = 'transparent';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #11998e, #38ef7d)';
                          e.target.style.WebkitBackgroundClip = 'text';
                          e.target.style.WebkitTextFillColor = 'transparent';
                        }}>
                        <i className="bi bi-beaker"></i> Set_TC
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/adminproblems"
                        style={{
                          background: 'linear-gradient(to right, #11998e, #38ef7d)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #f12711, #f5af19)';
                          e.target.style.WebkitBackgroundClip = 'text';
                          e.target.style.WebkitTextFillColor = 'transparent';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #11998e, #38ef7d)';
                          e.target.style.WebkitBackgroundClip = 'text';
                          e.target.style.WebkitTextFillColor = 'transparent';
                        }}>
                        <i className="bi bi-list-task me-1"></i> View Problems
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/dashboard"
                        style={{
                          background: 'linear-gradient(to right, #11998e, #38ef7d)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #f12711, #f5af19)';
                          e.target.style.WebkitBackgroundClip = 'text';
                          e.target.style.WebkitTextFillColor = 'transparent';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #11998e, #38ef7d)';
                          e.target.style.WebkitBackgroundClip = 'text';
                          e.target.style.WebkitTextFillColor = 'transparent';
                        }}
                      >
                        <i className="bi bi-person-workspace me-1"></i> Profile
                      </Link>
                    </li>
                    <Link
                      className="nav-link text-white d-flex align-items-center gap-2"
                      to="/problems"
                      style={{
                        background: 'linear-gradient(to right, #11998e, #38ef7d)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(to right, #f12711, #f5af19)';
                        e.target.style.WebkitBackgroundClip = 'text';
                        e.target.style.WebkitTextFillColor = 'transparent';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(to right, #11998e, #38ef7d)';
                        e.target.style.WebkitBackgroundClip = 'text';
                        e.target.style.WebkitTextFillColor = 'transparent';
                      }}
                    >
                      <i className="bi bi-journal-check me-1"></i> Problems
                    </Link>

                    <Link
                      className="nav-link text-white d-flex align-items-center gap-2"
                      to="/contexts"
                      style={{
                        background: 'linear-gradient(to right, #11998e, #38ef7d)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(to right, #f12711, #f5af19)';
                        e.target.style.WebkitBackgroundClip = 'text';
                        e.target.style.WebkitTextFillColor = 'transparent';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(to right, #11998e, #38ef7d)';
                        e.target.style.WebkitBackgroundClip = 'text';
                        e.target.style.WebkitTextFillColor = 'transparent';
                      }}
                    >
                      <i className="bi bi-journal-check me-1"></i> Contexts
                    </Link>

                    <li className="nav-item">
                      <Link
                        className="nav-link text-white d-flex align-items-center gap-2"
                        to="/sub"
                        style={{
                          background: 'linear-gradient(to right, #11998e, #38ef7d)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #f12711, #f5af19)';
                          e.target.style.WebkitBackgroundClip = 'text';
                          e.target.style.WebkitTextFillColor = 'transparent';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #11998e, #38ef7d)';
                          e.target.style.WebkitBackgroundClip = 'text';
                          e.target.style.WebkitTextFillColor = 'transparent';
                        }}
                      >
                        <i className="bi bi-journal-check me-1"></i> Submissions
                      </Link>
                    </li>


                  </>
                )}
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(to right, #f12711, #f5af19)';
                      e.target.style.color = 'white';
                      e.target.style.border = 'none';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#ffc107';
                      e.target.style.border = '1px solid #ffc107';
                    }}
                    style={{
                      background: 'transparent',
                      color: '#ffc107',
                      border: '1px solid #ffc107',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </li>

              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link text-white" to="/login">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Link>
              </li>
            )}
            {/* Theme Toggle */}
            <li className="nav-item d-flex align-items-center ms-2">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(to right, #f12711, #f5af19)';
                  e.target.style.color = 'white';
                  e.target.style.border = 'none';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#f8f9fa'; // Bootstrap light
                  e.target.style.border = '1px solid #f8f9fa';
                }}
                title="Toggle theme"
                style={{
                  background: 'transparent',
                  color: '#f8f9fa',
                  border: '1px solid #f8f9fa',
                  padding: '6px 12px',
                  borderRadius: '5px',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                }}
              >
                {theme === 'dark' ? (
                  <i className="bi bi-sun-fill"></i>
                ) : (
                  <i className="bi bi-moon-stars-fill"></i>
                )}
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
