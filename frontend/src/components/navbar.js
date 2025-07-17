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
        <Link className="navbar-brand d-flex align-items-center text-white fw-bold" to="/">
          <i className="bi bi-lightbulb-fill text-warning me-2"></i> AlgoArena
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
                      <Link className="nav-link text-white" to="/admindashboard">
                        <i className="bi bi-person-workspace me-1"></i> Profile
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/postproblem">
                        <i className="bi bi-pencil-square me-1"></i> Post Problem
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/test">
                        <i className="bi bi-beaker"></i> U_TC
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/adminproblems">
                        <i className="bi bi-list-task me-1"></i> View Problems
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/dashboard">
                        <i className="bi bi-person-circle me-1"></i> Profile
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/problems">
                        <i className="bi bi-list-task me-1"></i> Problems
                      </Link>
                    </li>
                  </>
                )}
                <li className="nav-item">
                  <button className="btn btn-outline-warning ms-lg-3" onClick={handleLogout}>
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
                className="btn btn-outline-light btn-sm"
                title="Toggle theme"
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
