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
 
 {/* Hero Section */}
 <div className="container-fluid bg-dark text-light py-5 min-vh-100 d-flex align-items-center">
  <div className="container">
    <div className="row justify-content-center">
      <div
        className="col-md-12 p-5 rounded-4 shadow-lg"
        style={{
          backgroundColor: '#1c1c1e',
          boxShadow: '0 0 25px rgba(0,0,0,0.5)',
        }}
      >
        {/* Main Hero Content */}
        <div className="text-center mb-5">
          <h1
            className="fw-bold display-3 mb-4"
            style={{
              background: 'linear-gradient(to right, #8e44ad, #3498db)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome to Randoman
          </h1>
          <p className="fs-4 mb-4 text-light opacity-75 mx-auto" style={{ maxWidth: '800px' }}>
            Master collaborative coding with our cutting-edge platform designed for developers who dream big
          </p>
          <p className="fs-5 mb-5 text-muted mx-auto" style={{ maxWidth: '900px' }}>
            Your go-to platform for collaborative code editing, live previewing, and seamless developer interaction. 
            Whether you're a beginner or a pro, our sleek interface helps bring ideas to life.
          </p>
        </div>

        {/* Stats Section - Inspired by AlgoUniversity */}
        <div className="row text-center mb-5 py-4">
          <div className="col-md-3 col-6 mb-4">
            <div className="p-3 rounded-3 bg-secondary bg-opacity-10">
              <div className="fs-1 mb-2">💻</div>
              <h3 className="fw-bold text-primary mb-1">100+</h3>
              <p className="text-muted small mb-0">Active Developers</p>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-4">
            <div className="p-3 rounded-3 bg-secondary bg-opacity-10">
              <div className="fs-1 mb-2">⚡</div>
              <h3 className="fw-bold text-success mb-1">99.9%</h3>
              <p className="text-muted small mb-0">Uptime</p>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-4">
            <div className="p-3 rounded-3 bg-secondary bg-opacity-10">
              <div className="fs-1 mb-2">🔄</div>
              <h3 className="fw-bold text-info mb-1">Real-time</h3>
              <p className="text-muted small mb-0">Collaboration</p>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-4">
            <div className="p-3 rounded-3 bg-secondary bg-opacity-10">
              <div className="fs-1 mb-2">🚀</div>
              <h3 className="fw-bold text-warning mb-1">∞</h3>
              <p className="text-muted small mb-0">Possibilities</p>
            </div>
          </div>
        </div>

        {/* Login Buttons Section */}
        {!user || user.role === 'admin' ? (
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="d-grid gap-3">
              <button
                onClick={handleLogin}
                className="btn btn-lg fw-semibold text-dark py-3"
                style={{
                  background: 'linear-gradient(135deg, #f12711, #f5af19)',
                  border: 'none',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(241, 39, 17, 0.3)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(241, 39, 17, 0.4)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(241, 39, 17, 0.3)';
                }}
              >
                <i className="bi bi-person-fill me-2"></i> 
                Start Coding Now
              </button>
              <button
                onClick={handleAdmin}
                className="btn btn-lg fw-semibold text-white py-3"
                style={{
                  background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                  border: 'none',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(17, 153, 142, 0.3)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(17, 153, 142, 0.4)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(17, 153, 142, 0.3)';
                }}
              >
                <i className="bi bi-wrench-adjustable-circle me-2"></i> 
                Admin Portal
              </button>
            </div>
          </div>
        </div>
        ) : null}
      </div>
    </div>
  </div>
</div>

{/* Why Choose Our Platform - Enhanced Design */}
<div className="container-fluid py-5 bg-dark text-light" style={{ backgroundColor: '#0d1117 !important' }}>
  <div className="container">
    <div className="text-center mb-5">
      <h2 className="fw-bold display-5 mb-3">
        <span
          style={{
            background: 'linear-gradient(135deg, #8e44ad, #3498db, #e74c3c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Why Choose Randoman?
        </span>
      </h2>
      <p className="fs-5 text-muted mb-0 mx-auto" style={{ maxWidth: '600px' }}>
        Not just another coding platform — we're building the future of collaborative development
      </p>
    </div>

    <div className="row g-4 mb-5">
      <div className="col-lg-4 col-md-6">
        <div 
          className="p-4 rounded-4 h-100 border position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.1), rgba(52, 152, 219, 0.1))',
            borderColor: 'rgba(142, 68, 173, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(142, 68, 173, 0.2)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="text-center mb-3">
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #8e44ad, #3498db)',
                fontSize: '2rem'
              }}
            >
              🤝
            </div>
            <h5 className="fw-bold text-light mb-3">Live Doubt Sharing</h5>
            <span className="badge bg-info px-3 py-1 mb-3 rounded-pill">Coming Soon</span>
          </div>
          <p className="text-light opacity-75 text-center">
            Real-time doubt-sharing via chat among users, helping you upskill in areas you're learning. 
            Connect, learn, and grow together.
          </p>
        </div>
      </div>

      <div className="col-lg-4 col-md-6">
        <div 
          className="p-4 rounded-4 h-100 border position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 87, 34, 0.1))',
            borderColor: 'rgba(255, 193, 7, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 193, 7, 0.2)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="text-center mb-3">
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #ffc107, #ff5722)',
                fontSize: '2rem'
              }}
            >
              🧠
            </div>
            <h5 className="fw-bold text-light mb-3">Expert Mentorship</h5>
          </div>
          <p className="text-light opacity-75 text-center">
            Get guidance from experienced developers who learned and grew with our platform. 
            Peer-to-peer learning at its finest.
          </p>
        </div>
      </div>

      <div className="col-lg-4 col-md-6 mx-auto">
        <div 
          className="p-4 rounded-4 h-100 border position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(23, 162, 184, 0.1))',
            borderColor: 'rgba(40, 167, 69, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(40, 167, 69, 0.2)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="text-center mb-3">
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #28a745, #17a2b8)',
                fontSize: '2rem'
              }}
            >
              📊
            </div>
            <h5 className="fw-bold text-light mb-3">Auto Save Technology</h5>
          </div>
          <p className="text-light opacity-75 text-center">
            Never lose your progress. Every change is automatically saved and tracked 
            to enhance your development experience.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Supported Languages Section - Enhanced */}
<div className="container-fluid py-5 bg-dark text-light border-top border-secondary">
  <div className="container">
    <div className="text-center mb-5">
      <h2 className="fw-bold display-5 mb-3">
        <span
          style={{
            background: 'linear-gradient(135deg, #8e44ad, #3498db)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Supported Languages
        </span>
      </h2>
      <p className="fs-5 text-muted mb-4">
        Code in your favorite languages with full compiler support
      </p>
    </div>

    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="d-flex flex-wrap justify-content-center gap-4">
          <div 
            className="px-5 py-3 rounded-3 border position-relative"
            style={{
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              borderColor: 'rgba(52, 152, 219, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(52, 152, 219, 0.2)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span className="fs-4 me-2">💻</span> 
            <span className="fw-semibold">C++ (GCC)</span>
          </div>
          
          <div 
            className="px-5 py-3 rounded-3 border position-relative"
            style={{
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              borderColor: 'rgba(255, 193, 7, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 193, 7, 0.2)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span className="fs-4 me-2">☕</span> 
            <span className="fw-semibold">Java (OpenJDK)</span>
          </div>
          
          <div 
            className="px-5 py-3 rounded-3 border position-relative"
            style={{
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              borderColor: 'rgba(40, 167, 69, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(40, 167, 69, 0.2)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span className="fs-4 me-2">🐍</span> 
            <span className="fw-semibold">Python 3</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Call to Action Section */}
<div className="container-fluid py-5 text-light" style={{ background: 'linear-gradient(135deg, #1c1c1e, #2c2c2e)' }}>
  <div className="container text-center">
    <h3 className="fw-bold mb-3">Ready to Transform Your Coding Experience?</h3>
    <p className="fs-5 text-muted mb-4">
      Join thousands of developers who are already building amazing projects with Randoman
    </p>
    {!user || user.role === 'admin' ? (
    <button
      onClick={handleLogin}
      className="btn btn-lg fw-semibold text-dark px-5 py-3"
      style={{
        background: 'linear-gradient(135deg, #f12711, #f5af19)',
        border: 'none',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(241, 39, 17, 0.3)'
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(241, 39, 17, 0.4)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(241, 39, 17, 0.3)';
      }}
    >
      Get Started Today <i className="bi bi-arrow-right ms-2"></i>
    </button>
    ) : null}
  </div>
</div>

</>
  );
}

export default Home;