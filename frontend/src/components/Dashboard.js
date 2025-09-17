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
      <div className="container my-5">
        <div
          className="dashboard-card shadow-lg rounded-4 p-4 d-flex"
          style={{
            background: 'rgba(28,28,30,0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '900px',
            margin: '0 auto'
          }}
        >
          {/* Profile Section */}
          <div className="profile-section text-center me-4" style={{ minWidth: '180px' }}>
            <label htmlFor="profileUpload" style={{ cursor: "pointer" }}>
              <div
                className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm overflow-hidden mb-3"
                style={{ width: "120px", height: "120px" }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: "2rem" }}>👤</span>
                )}
              </div>
            </label>
            <input
              type="file"
              id="profileUpload"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <h5 className="text-white">{user.firstname} {user.lastname}</h5>
            <p className="text-muted">{user.email}</p>

            {/* User Badge */}
            <span
              className="badge d-flex align-items-center justify-content-center shadow-sm mt-2"
              style={{
                background: '#11998e', // updated badge color
                color: '#fff',
                fontWeight: 500,
                fontSize: '0.85rem',
                padding: '0.4rem 1.5rem',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: "1rem", marginRight: "0.5rem" }}>⚫</span>
              User
            </span>
          </div>

          {/* Buttons Section */}
          <div className="buttons-section d-flex flex-column flex-grow-1">
            <div className="d-flex flex-wrap gap-3 mb-3">
              <button
                onClick={() => navigate("/problems")}
                className="btn btn-gradient position-relative"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Solve coding problems to practice"
              >
                <i className="bi bi-question-circle me-2 fs-5"></i>
                Solve Problems
              </button>
              <button
                onClick={() => navigate("/sub")}
                className="btn btn-gradient position-relative"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Check your previous submissions"
              >
                <i className="bi bi-check-circle me-2 fs-5"></i>
                Submissions
              </button>
            </div>
            <div className="d-flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/funda")}
                className="btn btn-gradient position-relative"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Learn the fundamental concepts"
              >
                <i className="bi bi-book me-2 fs-5"></i>
                Fundamentals
              </button>
              <button
                onClick={() => navigate("/contexts")}
                className="btn btn-gradient position-relative"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Understand the contexts and examples"
              >
                <i className="bi bi-collection me-2 fs-5"></i>
                Contexts
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .btn-gradient {
          background: linear-gradient(135deg, #f12711, #f5af19);
          color: #fff;
          font-weight: 500;
          border: none;
          padding: 0.5rem 1.2rem;
          border-radius: 8px; /* reduced border-radius */
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }
        .btn-gradient:hover {
          background: linear-gradient(to right, #11998e, #38ef7d);
        }
        .btn-gradient i {
          pointer-events: none;
        }
      `}</style>
    </>
  );
}

export default Dashboard;
