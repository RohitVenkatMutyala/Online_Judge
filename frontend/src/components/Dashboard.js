import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './sketchy.css';
import Dnav from './dnav';
import { Tooltip } from 'bootstrap';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) setProfileImage(storedImage);

    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new Tooltip(el));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem("profileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user || user.role === 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">You are not logged in.</div>
      </div>
    );
  }

  return (
    <>
      <Dnav />
      <div className="container-fluid px-4 py-5" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div
              className="dashboard-container shadow-lg rounded-4 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <div className="row g-0 h-100">
                {/* Profile Section - Left Side */}
                <div className="col-12 col-lg-4">
                  <div 
                    className="profile-section h-100 d-flex flex-column align-items-center justify-content-center p-5"
                    style={{
                      background: 'linear-gradient(145deg, #2c3e50, #34495e)',
                      color: 'white'
                    }}
                  >
                    <label htmlFor="profileUpload" className="profile-upload-label mb-4">
                      <div
                        className="profile-image-container rounded-circle shadow-lg overflow-hidden position-relative"
                        style={{ width: "200px", height: "200px", cursor: "pointer" }}
                      >
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                            <i className="bi bi-person-circle text-secondary" style={{ fontSize: "5rem" }}></i>
                          </div>
                        )}
                        <div className="profile-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                          <i className="bi bi-camera-fill" style={{ fontSize: "1.5rem", opacity: 0 }}></i>
                        </div>
                      </div>
                    </label>
                    
                    <input
                      type="file"
                      id="profileUpload"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                    
                    <div className="text-center">
                      <h2 className="mb-2 fw-bold">{user.firstname} {user.lastname}</h2>
                      <p className="mb-3 text-light opacity-75" style={{ fontSize: "1.1rem" }}>{user.email}</p>
                      
                      <div
                        className="user-badge d-inline-flex align-items-center px-4 py-2 rounded-pill"
                        style={{
                          background: 'linear-gradient(45deg, #11998e, #38ef7d)',
                          boxShadow: '0 4px 15px rgba(17, 153, 142, 0.3)'
                        }}
                      >
                        <i className="bi bi-person-check-fill me-2"></i>
                        <span className="fw-semibold">Verified User</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Section - Right Side */}
                <div className="col-12 col-lg-8">
                  <div className="navigation-section h-100 d-flex flex-column justify-content-center p-5">
                    <div className="text-center mb-5">
                      <h1 className="display-4 fw-bold text-dark mb-3">Welcome to Dashboard</h1>
                      <p className="lead text-muted">Choose your learning path and start your coding journey</p>
                    </div>

                    <div className="navigation-grid">
                      <div className="nav-card mb-4" onClick={() => navigate("/problems")}>
                        <div className="nav-card-inner d-flex align-items-center p-4 rounded-3 shadow-sm h-100">
                          <div className="nav-icon me-4">
                            <i className="bi bi-puzzle-fill"></i>
                          </div>
                          <div className="nav-content flex-grow-1">
                            <h4 className="mb-2 fw-bold">Solve Problems</h4>
                            <p className="mb-0 text-muted">Practice coding with our curated problem sets</p>
                          </div>
                          <div className="nav-arrow">
                            <i className="bi bi-arrow-right-circle-fill"></i>
                          </div>
                        </div>
                      </div>

                      <div className="nav-card mb-4" onClick={() => navigate("/sub")}>
                        <div className="nav-card-inner d-flex align-items-center p-4 rounded-3 shadow-sm h-100">
                          <div className="nav-icon me-4">
                            <i className="bi bi-check2-square"></i>
                          </div>
                          <div className="nav-content flex-grow-1">
                            <h4 className="mb-2 fw-bold">Submissions</h4>
                            <p className="mb-0 text-muted">Review your previous solutions and progress</p>
                          </div>
                          <div className="nav-arrow">
                            <i className="bi bi-arrow-right-circle-fill"></i>
                          </div>
                        </div>
                      </div>

                      <div className="nav-card mb-4" onClick={() => navigate("/funda")}>
                        <div className="nav-card-inner d-flex align-items-center p-4 rounded-3 shadow-sm h-100">
                          <div className="nav-icon me-4">
                            <i className="bi bi-book-half"></i>
                          </div>
                          <div className="nav-content flex-grow-1">
                            <h4 className="mb-2 fw-bold">Fundamentals</h4>
                            <p className="mb-0 text-muted">Master the core concepts and principles</p>
                          </div>
                          <div className="nav-arrow">
                            <i className="bi bi-arrow-right-circle-fill"></i>
                          </div>
                        </div>
                      </div>

                      <div className="nav-card" onClick={() => navigate("/contexts")}>
                        <div className="nav-card-inner d-flex align-items-center p-4 rounded-3 shadow-sm h-100">
                          <div className="nav-icon me-4">
                            <i className="bi bi-collection-fill"></i>
                          </div>
                          <div className="nav-content flex-grow-1">
                            <h4 className="mb-2 fw-bold">Contexts</h4>
                            <p className="mb-0 text-muted">Explore real-world examples and use cases</p>
                          </div>
                          <div className="nav-arrow">
                            <i className="bi bi-arrow-right-circle-fill"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          min-height: 600px;
        }

        .profile-upload-label:hover .profile-overlay {
          background: rgba(0,0,0,0.5);
        }

        .profile-upload-label:hover .profile-overlay i {
          opacity: 1 !important;
          color: white;
        }

        .profile-overlay {
          transition: all 0.3s ease;
          border-radius: 50%;
        }

        .nav-card {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-card:hover {
          transform: translateY(-2px);
        }

        .nav-card-inner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transition: all 0.3s ease;
          border: none;
          min-height: 100px;
        }

        .nav-card:hover .nav-card-inner {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          box-shadow: 0 8px 25px rgba(118, 75, 162, 0.3) !important;
        }

        .nav-icon {
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .nav-arrow {
          font-size: 1.5rem;
          opacity: 0.7;
          transition: all 0.3s ease;
        }

        .nav-card:hover .nav-arrow {
          opacity: 1;
          transform: translateX(5px);
        }

        .user-badge {
          font-size: 1rem;
        }

        @media (max-width: 991.98px) {
          .profile-section {
            min-height: 400px;
          }
          
          .profile-image-container {
            width: 150px !important;
            height: 150px !important;
          }
          
          .nav-card-inner {
            min-height: 80px;
          }
          
          .nav-icon {
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
          }
        }

        @media (max-width: 576px) {
          .profile-image-container {
            width: 120px !important;
            height: 120px !important;
          }
          
          .navigation-section h1 {
            font-size: 2rem !important;
          }
        }
      `}</style>
    </>
  );
}

export default Dashboard;