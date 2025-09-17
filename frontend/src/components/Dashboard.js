import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './sketchy.css'; // assuming it styles the book effect
import Navbar from './navbar';
import Dnav from './dnav';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) {
      setProfileImage(storedImage);
    }
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

  const pages = [
    <div key="user" className="book-page text-center">
      <div className="d-flex justify-content-center mb-3">
        <label htmlFor="profileUpload" style={{ cursor: "pointer" }}>
          <div
            className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm overflow-hidden"
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
      </div>

      <h4>{user.firstname} {user.lastname}</h4>
      <p>{user.email}</p>

      <div className="mt-3">
        <span
          className="badge rounded-pill d-flex align-items-center justify-content-center shadow-sm position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f12711, #f5af19)',
            color: '#fff',
            fontWeight: 500,
            fontSize: '0.9rem',
            padding: '0.5rem 2rem',
            minWidth: '150px',
            textAlign: 'center'
          }}
        >
          <span style={{ fontSize: "1rem", marginRight: "0.5rem" }}>⚫</span>
          User
          <span
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              background: 'rgba(255,255,255,0.1)',
              transform: 'rotate(-45deg)',
              pointerEvents: 'none'
            }}
          ></span>
        </span>
      </div>
    </div>
  ];

  return (
    <>
      <Dnav />
      <div className="container my-5 d-flex justify-content-center align-items-center">
        <div
          className="book shadow-lg p-4 rounded-4"
          style={{
            background: 'rgba(28,28,30,0.85)',
            backdropFilter: 'blur(10px)',
            maxWidth: '600px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="book-inner animate-page">
            {pages[pageIndex]}
          </div>

          <div className="book-controls mt-4 d-flex flex-wrap justify-content-center gap-3">
            <button
              onClick={() => navigate("/problems")}
              className="btn btn-gradient"
            >
              Solve Problems
            </button>
            <button
              onClick={() => navigate("/sub")}
              className="btn btn-gradient"
            >
              Submissions
            </button>
            <button
              onClick={() => navigate("/funda")}
              className="btn btn-gradient"
            >
              Fundamentals
            </button>
            <button
              onClick={() => navigate("/contexts")}
              className="btn btn-gradient"
            >
              Contexts
            </button>
            {/* Add more buttons here if needed */}
          </div>
        </div>
      </div>

      <style>{`
        .btn-gradient {
          background: linear-gradient(135deg, #f12711, #f5af19);
          color: #fff;
          font-weight: 500;
          border: none;
          padding: 0.6rem 1.5rem;
          border-radius: 50px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(245, 175, 25, 0.4);
        }
        .btn-gradient:active {
          transform: translateY(1px);
          box-shadow: none;
        }
      `}</style>
    </>
  );
}

export default Dashboard;
