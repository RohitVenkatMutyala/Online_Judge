import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
    const { user } = useAuth();
  const navigate = useNavigate();

  const handleAdmin = () => {
    navigate('/adminlogin');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <>
 <Navbar />
 <div className="container-fluid bg-dark text-light py-5 min-vh-100 d-flex align-items-center">
  <div className="container">
    <div className="row justify-content-center">
      <div
        className="col-md-10 p-5 rounded-4 shadow-lg"
        style={{
          backgroundColor: '#1c1c1e',
          boxShadow: '0 0 25px rgba(0,0,0,0.5)',
        }}
      >
        <div className="row align-items-center">
          {/* Left Side - Welcome Text in Card */}
          <div className="col-md-6 mb-4 mb-md-0">
            <h1
              className="fw-bold display-4"
              style={{
                background: 'linear-gradient(to right, #8e44ad, #3498db)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome to Randoman
            </h1>
            <p className="fs-5 mt-3 text-light">
              Randoman is your go-to platform for collaborative code editing, live previewing,
              and seamless developer interaction. Whether you're a beginner or a pro, our sleek
              interface helps bring ideas to life.
            </p>
          </div>

          {/* Right Side - Login Buttons */}
            if (!${user} || ${user.role} === 'admin') {
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center mt-4 mt-md-0">
           
            <div className="d-grid gap-3 w-100 px-4">
              <button
                onClick={handleLogin}
                className="btn btn-lg fw-semibold text-dark"
                style={{
                  background: 'linear-gradient(to right, #f12711, #f5af19)',
                  border: 'none',
                  transition: 'transform 0.3s ease',
                }}
                onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <i className="bi bi-person-fill me-2"></i> User Login
              </button>
              <button
                onClick={handleAdmin}
                className="btn btn-lg fw-semibold text-white"
                style={{
                  background: 'linear-gradient(to right, #11998e, #38ef7d)',
                  border: 'none',
                  transition: 'transform 0.3s ease',
                }}
                onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <i className="bi bi-wrench-adjustable-circle me-2"></i> Admin Login
              </button>
            </div>
          </div>
}
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Why Choose Our Platform */}
      {/* Unique Value Section */}
<div className="container-fluid py-5 bg-dark text-light border-top border-secondary">
  <div className="container">
    <h2 className="text-center fw-bold mb-4" style={{ fontSize: '2rem' }}>
      <span
        style={{
          background: 'linear-gradient(to right, #8e44ad, #3498db)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Why Randoman?
      </span>
    </h2>
    <p className="text-center text-muted mb-5">
      Not just another coding platform — we’re building the future of collaborative development.
    </p>

    <div className="row text-center mb-5">
      <div className="col-md-4 mb-4">
        <div className="p-4 rounded shadow-sm bg-secondary bg-opacity-10 h-100">
          <h5 className="fw-bold text-info mb-2">🤝 Live Doubt Sharing (upcomming)</h5>
          <p className="small text-light">
           A real-time doubt-sharing Via Chat in the platform among users that helps them upskill in the areas they are trying to learn. 
          </p>
        </div>
      </div>

      <div className="col-md-4 mb-4">
        <div className="p-4 rounded shadow-sm bg-secondary bg-opacity-10 h-100">
          <h5 className="fw-bold text-warning mb-2">🧠 Take Help </h5>
          <p className="small text-light">
          Take help from someone who learned from us and with us
          </p>
        </div>
      </div>

      <div className="col-md-4 mb-4">
        <div className="p-4 rounded shadow-sm bg-secondary bg-opacity-10 h-100">
          <h5 className="fw-bold text-success mb-2">📊 Auto Save</h5>
          <p className="small text-light">
           I believe that every change must be clearly noted to enhance user experience
          </p>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="row text-center mt-4">
      <div className="col-md-3">
        <h4 className="fw-bold text-primary">100%</h4>
        <p className="text-muted">Learning</p>
      </div>
      <div className="col-md-3">
        <h4 className="fw-bold text-success">100%</h4>
        <p className="text-muted">Real-time Sync</p>
      </div>
      <div className="col-md-3">
        <h4 className="fw-bold text-info">99+</h4>
        <p className="text-muted">Active Users</p>
      </div>
      <div className="col-md-3">
        <h4 className="fw-bold text-warning">∞</h4>
        <p className="text-muted">Growth Potential</p>
      </div>
    </div>
  </div>
</div>


      {/* Supported Languages Section */}
      <div className="container-fluid py-5 bg-dark text-light border-top border-secondary">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">
            <span
              style={{
                background: 'linear-gradient(to right, #8e44ad, #3498db)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Supported Languages
            </span>
          </h2>
         

          <div className="d-flex flex-wrap justify-content-center gap-4">
            <div className="px-4 py-2 rounded-3 bg-secondary bg-opacity-10 border border-secondary">
              <span role="img" aria-label="C++">💻</span> C++ (GCC)
            </div>
            <div className="px-4 py-2 rounded-3 bg-secondary bg-opacity-10 border border-secondary">
              <span role="img" aria-label="Java">☕</span> Java (OpenJDK)
            </div>
            <div className="px-4 py-2 rounded-3 bg-secondary bg-opacity-10 border border-secondary">
              <span role="img" aria-label="Python">🐍</span> Python 3
            </div>
           
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
