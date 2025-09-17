import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './sketchy.css'; // assuming it styles the book effect
import Navbar from './navbar';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);

  const [profileImage, setProfileImage] = useState(null);

  // ✅ Load stored image when component mounts
  useEffect(() => {
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) {
      setProfileImage(storedImage);
    }
  }, []);

  // ✅ Handle new image upload
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

  const buttonStyle = {
    border: 'none',
    color: 'white',
    padding: '10px',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'all 0.3s ease-in-out',
    width: '100%',
  };

  // ✅ Page with profile image upload + user info
  const pages = [
    <div key="user" className="book-page text-center">
      {/* Profile Image Upload */}
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

      {/* User Info */}

      <h4>{user.firstname} {user.lastname}</h4>
      <p>{user.email}</p>

      {/* Badge */}
      <div className="mt-3">
        <span
          className="badge rounded-pill d-flex align-items-center justify-content-center shadow-sm position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f12711, #f5af19)',
            color: '#fff',
            fontWeight: 500,
            fontSize: '0.9rem',
            padding: '0.5rem 2rem', // shorter height, wider breadth
            minWidth: '150px',       // ensures the badge is broader
            textAlign: 'center'
          }}
        >
          <i className="bi bi-person-fill me-2"></i>
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
      <Navbar />
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
          <div className="book-controls mt-4 d-flex justify-content-between align-items-center">
        
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
