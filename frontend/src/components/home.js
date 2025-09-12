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

  const handleWatchDemo = () => {
    window.open('https://drive.google.com/file/d/1erYInNK5HJpp7k4vX7VTQPeqH-djlgld/view', '_blank');
  };

  if (user) {
    return (
      navigate("/dashboard")
    )
  }
  return (
    <>
      <Navbar />


      <div className="container-fluid bg-dark text-light py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div
              className="col-md-12 p-4 rounded-4 shadow-lg"
              style={{
                backgroundColor: '#1c1c1e',
                boxShadow: '0 0 25px rgba(0,0,0,0.5)',
              }}
            >

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
                <div
                  className="fw-bold display-5 mb-4"
                  style={{
                    background: 'linear-gradient(to right, #f12711, #f5af19)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  <p>"Where Time Matters"</p>
                  <p style={{ marginTop: '10px', fontSize: '20px', fontWeight: 'normal' }}>
                    Don't do things randomly when the Randoman is there to help you .
                  </p>
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

                      </div>
                    </div>
                  </div>
                ) : null}

                <br></br>

                {/* Demo Video Section */}
                <div className="mb-4">
                  <button
                    onClick={handleWatchDemo}
                    className="btn btn-lg fw-semibold text-dark py-3 px-4 me-3 mb-3"
                    style={{
                      background: 'linear-gradient(135deg, #e74c3c, #8e44ad)',
                      border: 'none',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.4)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.3)';
                    }}
                  >
                    <i className="bi bi-play-circle-fill me-2"></i>
                    Watch Demo Tour
                  </button>

                </div>

              </div>




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
                    📩
                  </div>
                  <h5 className="fw-bold text-light mb-3">On-Demand Custom Prep</h5>
                  <span className="badge bg-success px-3 py-1 mb-3 rounded-pill">Exclusive</span>
                </div>
                <p className="text-light opacity-75 text-center">
                  Have a specific goal in mind?
                  Just let us know your request and our team will curate
                  <strong> personalized resources </strong> exclusively for you.
                  <br /><br />
                  Whether it’s preparing for <em>any company, semester exam, or competitive exam</em> interviews,
                  or mastering a brand-new technology, we’ll gather materials from real-world
                  experiences and deliver exactly what you need.
                  <br /><br />
                  <span className="fw-bold">A feature no one else offers —
                    truly personalized learning for your journey.</span>
                </p>

                <div className="text-center mt-3">
                  <a
                    href="mailto:heisenberg@randoman.online"
                    className="btn btn-info px-4 py-2 fw-semibold rounded-pill shadow-sm"
                  >
                    Request Feature
                  </a>
                </div>


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
                  <h5 className="fw-bold text-light mb-3">Expert AI Mentorship</h5>
                </div>
                <p className="text-light opacity-75 text-center">
                  Learn from an <strong>AI that evolves with your journey</strong> —
                  adapting to your pace, understanding your goals, and pushing your
                  coding skills to the next level.
                  <br /><br />
                  <span className="fw-bold">The true essence of peer-to-AI learning.</span>
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
                  Never lose your progress.
                  Every change is applied in <strong>milliseconds</strong>,
                  automatically saved, and instantly replicated across any browser —
                  enhancing your development experience without interruptions.
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Products Section - New Addition */}
      <div className="container-fluid py-5 bg-dark text-light border-top border-secondary">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-5 mb-3">
              <span
                style={{
                  background: 'linear-gradient(135deg, #e74c3c, #f39c12, #9b59b6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Our Products
              </span>
            </h2>
            <p className="fs-5 text-muted mb-0 mx-auto" style={{ maxWidth: '700px' }}>
              Discover the cutting-edge tools built for passionate developers who dare to dream bigger
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div
                className="p-4 rounded-4 border position-relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(155, 89, 182, 0.2), rgba(243, 156, 18, 0.2))',
                  borderColor: 'rgba(231, 76, 60, 0.5)',
                  transition: 'all 0.4s ease',
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(28, 28, 30, 0.8)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(231, 76, 60, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(231, 76, 60, 0.6)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(231, 76, 60, 0.4)';
                }}
              >
                {/* Product Badge */}
                <div className="text-center mb-4">
                  <span
                    className="badge px-4 py-2 rounded-pill fw-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #e74c3c, #9b59b6)',
                      fontSize: '0.9rem',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    🚀 NEW PRODUCT LAUNCHING
                  </span>
                </div>

                {/* Product Icon & Title */}
                <div className="text-center mb-3">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 position-relative"
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #e74c3c, #9b59b6, #f39c12)',
                      fontSize: '2.5rem'
                    }}
                  >
                    🛠️
                    <div
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{
                        width: '20px',
                        height: '20px',
                        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px'
                      }}
                    >
                      ✨
                    </div>
                  </div>
                  <h4 className="fw-bold mb-2" style={{ color: '#ffffff' }}>Software Collaborative Tool</h4>
                  <p className="fst-italic" style={{ color: '#b0b0b0' }}>For Passionate Developers</p>
                </div>

                {/* Key Features Grid */}
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-2 rounded-3" style={{ backgroundColor: 'rgba(46, 204, 113, 0.15)', border: '1px solid rgba(46, 204, 113, 0.3)' }}>
                      <div className="me-2 fs-5">🤖</div>
                      <div>
                        <h6 className="fw-bold mb-1" style={{ color: '#ffffff', fontSize: '14px' }}>AI-Powered Engine</h6>
                        <small style={{ color: '#d0d0d0', fontSize: '12px' }}>UML-to-code & code-to-UML generation</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-2 rounded-3" style={{ backgroundColor: 'rgba(52, 152, 219, 0.15)', border: '1px solid rgba(52, 152, 219, 0.3)' }}>
                      <div className="me-2 fs-5">⚡</div>
                      <div>
                        <h6 className="fw-bold mb-1" style={{ color: '#ffffff', fontSize: '14px' }}>80% Faster Workflow</h6>
                        <small style={{ color: '#d0d0d0', fontSize: '12px' }}>Minutes instead of hours setup</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-2 rounded-3" style={{ backgroundColor: 'rgba(155, 89, 182, 0.15)', border: '1px solid rgba(155, 89, 182, 0.3)' }}>
                      <div className="me-2 fs-5">👥</div>
                      <div>
                        <h6 className="fw-bold mb-1" style={{ color: '#ffffff', fontSize: '14px' }}>Team Collaboration</h6>
                        <small style={{ color: '#d0d0d0', fontSize: '12px' }}>Real-time editing & live UML preview</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-2 rounded-3" style={{ backgroundColor: 'rgba(243, 156, 18, 0.15)', border: '1px solid rgba(243, 156, 18, 0.3)' }}>
                      <div className="me-2 fs-5">🔧</div>
                      <div>
                        <h6 className="fw-bold mb-1" style={{ color: '#ffffff', fontSize: '14px' }}>Debug & Export</h6>
                        <small style={{ color: '#d0d0d0', fontSize: '12px' }}>Inline debugging & seamless sharing</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="text-center">
                  <p className="mb-3 fw-semibold" style={{ color: '#ffffff', fontSize: '16px' }}>
                    🎯 Ready to revolutionize your development workflow?
                  </p>
                  <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center align-items-center">
                    <a
                      href="https://uml.randoman.online"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-lg fw-semibold text-dark px-4 py-2 text-decoration-none"
                      style={{
                        background: 'linear-gradient(135deg, #e74c3c, #9b59b6)',
                        border: 'none',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)',
                        fontSize: '16px'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.5)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.4)';
                      }}
                    >
                      <i className="bi bi-rocket-takeoff me-2"></i>
                      Launch Tool
                    </a>
                    <span style={{ color: '#b0b0b0' }}>
                      <small style={{ fontSize: '13px' }}>
                        <i className="bi bi-clock me-1"></i>
                        Stay tuned for more amazing products!
                      </small>
                    </span>
                  </div>
                </div>
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
      {/* Footer */}
      <footer className="bg-dark text-muted py-5" style={{ backgroundColor: '#111827' }}>
        <div className="container">
          <div className="text-center">
            <div className="d-flex align-items-center justify-content-center mb-4">
              <span className="fs-3 me-2">⚫</span>
              <span className="ms-1 fs-5 fw-semibold text-white">Randoman</span>
            </div>
            <p className="text-secondary mb-2">© 2025 Randoman. All rights reserved.</p>
            <p className="text-secondary mb-2">
              Version 4.0.1 | Build 20250606
            </p>

            {/* Contact Info */}
            <p className="text-secondary mb-0">
              <i className="bi bi-envelope-fill me-2"></i>
              <a
                href="mailto:heisenberg@randoman.online"
                className="text-decoration-none text-info fw-semibold"
              >
                Contact Us
              </a>
            </p>
          </div>
        </div>
      </footer>

    </>
  );
}

export default Home;