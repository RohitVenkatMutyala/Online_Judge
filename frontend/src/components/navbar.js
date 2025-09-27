import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { db } from '../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    // If there's no user, do nothing
    if (!user || !user._id) return;

    // Listen for real-time updates to the user's profile
    const userDocRef = doc(db, 'users', user._id);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().profileImageURL) {
        // Set the profile image if the URL exists
        setProfileImage(docSnap.data().profileImageURL);
      } else {
        // Use a default or clear the image if no URL is found
        setProfileImage(null);
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [user]); // Rerun when the user object changes

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  const navLinkStyle = {
    background: ' linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444)',
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
      e.target.style.background = ' linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444)';
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
                        <Link className="nav-link" to="/new-chat" style={navLinkStyle}
                          onMouseEnter={(e) => handleNavLinkHover(e, true)}
                          onMouseLeave={(e) => handleNavLinkHover(e, false)}>
                          <i className="bi bi-broadcast-pin"></i>
                          <span>Sessions</span>
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
                        <Link className="nav-link" to="/new-chat" style={navLinkStyle}
                          onMouseEnter={(e) => handleNavLinkHover(e, true)}
                          onMouseLeave={(e) => handleNavLinkHover(e, false)}>
                          <i className="bi bi-broadcast-pin"></i>
                          <span>Sessions</span>
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
                  {/* Enhanced Action Buttons */}
                  <li className="nav-item ms-lg-3">
                    <div className="d-flex gap-2 align-items-center">

                      {/* === NEW PROFILE DROPDOWN START === */}
                      <div className="dropdown">
                        <a
                          href="#"
                          className="d-block link-light text-decoration-none dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt="User"
                              width="38"
                              height="38"
                              className="rounded-circle"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <i className="bi bi-person-circle text-white fs-3"></i>
                          )}
                        </a>
                        <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end mt-2">
                          <li>
                            <div className="dropdown-item-text text-white">
                              <strong>{user.firstname} {user.lastname}</strong>
                              <div className="small opacity-75">{user.email}</div>
                            </div>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center gap-2"
                              onClick={handleLogout}
                            >
                              <i className="bi bi-box-arrow-right"></i>
                              Logout
                            </button>
                          </li>
                        </ul>
                      </div>
                      {/* === NEW PROFILE DROPDOWN END === */}

                      {/* Theme Toggle (Unchanged, but now next to the dropdown) */}
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="btn btn-outline-light rounded-3"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          width: '45px',
                          height: '45px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'} fs-5`}></i>
                      </button>
                    </div>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link
                    className="btn rounded-3 px-4 py-2"
                    to="/login"
                    style={{
                      background: ' linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444)',
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
                      e.target.style.background = ' linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444)';
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

export default Navbar;