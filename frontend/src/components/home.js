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

      {/* Hero Section */}
      <div className="container-fluid py-5" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12">
              <div
                className="hero-container rounded-4 shadow-lg p-5"
                style={{
                  background: 'rgba(26, 26, 26, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* Hero Header */}
                <div className="text-center mb-5">
                  <h1
                    className="fw-bold display-2 mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #f12711, #f5af19)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Discover Randoman
                  </h1>
                  
                  <div className="mb-4">
                    <p 
                      className="display-6 fw-bold mb-3"
                      style={{
                        background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontStyle: 'italic'
                      }}
                    >
                      "Where Time Matters"
                    </p>
                    <p className="lead text-light opacity-75 mx-auto" style={{ maxWidth: '700px' }}>
                      Don't waste hours on uncertainty — <strong>Randoman</strong> empowers you
                      to act with <em>clarity, speed, and precision</em>.
                    </p>
                  </div>

                  {/* CTA Buttons */}
                  <div className="d-flex flex-column flex-md-row gap-3 justify-content-center align-items-center mb-5">
                    {!user || user.role === 'admin' ? (
                      <button
                        onClick={handleLogin}
                        className="btn btn-lg fw-semibold text-white px-5 py-3"
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
                    ) : null}

                    <button
                      onClick={handleWatchDemo}
                      className="btn btn-lg fw-semibold text-white px-5 py-3"
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
                      <i className="bi bi-play-circle-fill me-2"></i>
                      Watch Demo Tour
                    </button>
                  </div>
                </div>

                {/* Feature Cards Grid */}
                <div className="row g-4 justify-content-center">
                  <div className="col-lg-3 col-md-6">
                    <div className="feature-card h-100 p-4 rounded-4 text-center">
                      <div className="feature-icon mb-3 mx-auto">
                        <i className="bi bi-lightning-fill"></i>
                      </div>
                      <h5 className="fw-bold text-white mb-3">Real-time</h5>
                      <span className="badge feature-badge mb-3">Instant</span>
                      <p className="text-light opacity-75">
                        Experience <strong>instant collaboration</strong> with live updates that sync across all devices in milliseconds.
                      </p>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="feature-card h-100 p-4 rounded-4 text-center">
                      <div className="feature-icon mb-3 mx-auto">
                        <i className="bi bi-gear-fill"></i>
                      </div>
                      <h5 className="fw-bold text-white mb-3">Rapid Prototyping</h5>
                      <span className="badge feature-badge mb-3">Powered</span>
                      <p className="text-light opacity-75">
                        Transform software development — cut <strong>8–10 hours</strong> of work into <strong>just 5 seconds</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="feature-card h-100 p-4 rounded-4 text-center">
                      <div className="feature-icon mb-3 mx-auto">
                        <i className="bi bi-people-fill"></i>
                      </div>
                      <h5 className="fw-bold text-white mb-3">Community</h5>
                      <span className="badge feature-badge mb-3">Collaborative</span>
                      <p className="text-light opacity-75">
                        Connect with a <strong>vibrant community</strong> of developers and grow together.
                      </p>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="feature-card h-100 p-4 rounded-4 text-center">
                      <div className="feature-icon mb-3 mx-auto">
                        <i className="bi bi-rocket-takeoff-fill"></i>
                      </div>
                      <h5 className="fw-bold text-white mb-3">Fast</h5>
                      <span className="badge feature-badge mb-3">Lightning</span>
                      <p className="text-light opacity-75">
                        Build and deploy at <strong>lightning speed</strong>, optimized for performance and efficiency.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="container-fluid py-5" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-4 mb-3">
              <span
                style={{
                  background: 'linear-gradient(135deg, #f12711, #f5af19)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Why Choose Randoman?
              </span>
            </h2>
          </div>

          <div className="row g-4 justify-content-center">
            <div className="col-lg-4 col-md-6">
              <div className="why-choose-card h-100 p-4 rounded-4">
                <div className="text-center mb-4">
                  <div className="why-icon mb-3 mx-auto">
                    <i className="bi bi-envelope-fill"></i>
                  </div>
                  <h5 className="fw-bold text-white mb-3">On-Demand Custom Prep</h5>
                  <span className="badge why-badge mb-3">Exclusive</span>
                </div>
                <p className="text-light opacity-75 text-center mb-4">
                  Have a specific goal in mind? Just tell us, and we'll curate <strong>personalized resources</strong> —
                  whether it's for <em>company prep, semester exams, competitive tests</em>, or learning new tech.
                </p>
                <div className="text-center">
                  <a
                    href="mailto:heisenberg@randoman.online"
                    className="btn btn-sm fw-semibold px-4 py-2 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  >
                    Request Prep
                  </a>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="why-choose-card h-100 p-4 rounded-4">
                <div className="text-center mb-4">
                  <div className="why-icon mb-3 mx-auto">
                    <i className="bi bi-brain"></i>
                  </div>
                  <h5 className="fw-bold text-white mb-3">Expert AI Mentorship</h5>
                  <span className="badge why-badge mb-3">Premium</span>
                </div>
                <p className="text-light opacity-75 text-center mb-4">
                  Learn from an <strong>AI that evolves with your journey</strong> —
                  adapting to your pace, understanding your goals, and pushing your
                  coding skills to the next level.
                </p>
                <p className="text-center">
                  <small className="fw-bold text-light">The true essence of peer-to-AI learning.</small>
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mx-auto">
              <div className="why-choose-card h-100 p-4 rounded-4">
                <div className="text-center mb-4">
                  <div className="why-icon mb-3 mx-auto">
                    <i className="bi bi-bar-chart-fill"></i>
                  </div>
                  <h5 className="fw-bold text-white mb-3">Auto Save Technology</h5>
                  <span className="badge why-badge mb-3">New</span>
                </div>
                <p className="text-light opacity-75 text-center">
                  Never lose your progress.
                  Every change is applied in <strong>milliseconds</strong>,
                  automatically saved, and instantly replicated across any browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container-fluid py-5" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-4 mb-3">
              <span
                style={{
                  background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Our Products
              </span>
            </h2>
            <p className="lead text-light opacity-75 mx-auto" style={{ maxWidth: '700px' }}>
              Discover the cutting-edge tools built for passionate developers who dare to dream bigger
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="product-card p-5 rounded-4">
                {/* Product Badge */}
                <div className="text-center mb-4">
                  <span className="badge product-badge px-4 py-2 fw-semibold">
                    <i className="bi bi-rocket-fill me-2"></i>
                    NEW PRODUCT LAUNCHING
                  </span>
                </div>

                {/* Product Header */}
                <div className="text-center mb-4">
                  <div className="product-icon mb-3 mx-auto">
                    <i className="bi bi-tools"></i>
                    <div className="product-sparkle">
                      <i className="bi bi-star-fill"></i>
                    </div>
                  </div>
                  <h4 className="fw-bold text-white mb-2">Software Collaborative Tool</h4>
                  <p className="text-light opacity-75">For Passionate Developers</p>
                </div>

                {/* Features Grid */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="feature-item p-3 rounded-3">
                      <div className="d-flex align-items-center">
                        <div className="feature-item-icon me-3">
                          <i className="bi bi-robot"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold text-white mb-1">AI-Powered Engine</h6>
                          <small className="text-light opacity-75">UML-to-code & code-to-UML generation</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="feature-item p-3 rounded-3">
                      <div className="d-flex align-items-center">
                        <div className="feature-item-icon me-3">
                          <i className="bi bi-lightning-fill"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold text-white mb-1">80% Faster Workflow</h6>
                          <small className="text-light opacity-75">Minutes instead of hours setup</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="feature-item p-3 rounded-3">
                      <div className="d-flex align-items-center">
                        <div className="feature-item-icon me-3">
                          <i className="bi bi-people-fill"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold text-white mb-1">Team Collaboration</h6>
                          <small className="text-light opacity-75">Real-time editing & live UML preview</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="feature-item p-3 rounded-3">
                      <div className="d-flex align-items-center">
                        <div className="feature-item-icon me-3">
                          <i className="bi bi-bug-fill"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold text-white mb-1">Debug & Export</h6>
                          <small className="text-light opacity-75">Inline debugging & seamless sharing</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                  <p className="mb-3 fw-semibold text-white">
                    Ready to revolutionize your development workflow?
                  </p>
                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center">
                    <a
                      href="https://uml.randoman.online"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-lg fw-semibold text-white px-5 py-3 text-decoration-none"
                      style={{
                        background: 'linear-gradient(135deg, #f12711, #f5af19)',
                        border: 'none',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(241, 39, 17, 0.4)'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(241, 39, 17, 0.5)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(241, 39, 17, 0.4)';
                      }}
                    >
                      <i className="bi bi-rocket-takeoff me-2"></i>
                      Launch Tool
                    </a>
                    <small className="text-light opacity-75">
                      <i className="bi bi-clock me-1"></i>
                      Stay tuned for more amazing products!
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Languages */}
      <div className="container-fluid py-5" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-4 mb-3">
              <span
                style={{
                  background: 'linear-gradient(135deg, #f12711, #f5af19)',
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
                <div className="language-card px-4 py-3 rounded-3 d-flex align-items-center">
                  <i className="bi bi-code-slash me-3 fs-4"></i>
                  <span className="fw-semibold text-white">C++ (GCC)</span>
                </div>
                <div className="language-card px-4 py-3 rounded-3 d-flex align-items-center">
                  <i className="bi bi-cup-hot-fill me-3 fs-4"></i>
                  <span className="fw-semibold text-white">Java (OpenJDK)</span>
                </div>
                <div className="language-card px-4 py-3 rounded-3 d-flex align-items-center">
                  <i className="bi bi-file-earmark-code me-3 fs-4"></i>
                  <span className="fw-semibold text-white">Python 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="container-fluid py-5" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="container text-center">
          <h3 className="fw-bold text-white mb-4">Ready to Transform Your Coding Experience?</h3>
          {!user || user.role === 'admin' ? (
            <button
              onClick={handleLogin}
              className="btn btn-lg fw-semibold text-white px-5 py-3"
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
              Get Started Today <i className="bi bi-arrow-right ms-2"></i>
            </button>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-5" style={{ backgroundColor: '#111' }}>
        <div className="container">
          <div className="text-center">
            <div className="d-flex align-items-center justify-content-center mb-4">
              <span className="fs-3 me-2">⚫</span>
              <span className="ms-1 fs-5 fw-semibold text-white">Randoman</span>
            </div>
            <p className="text-secondary mb-2">© 2025 Randoman. All rights reserved.</p>
            <p className="text-secondary mb-3">Version 4.0.1 | Build 20250606</p>
            <p className="text-secondary mb-0">
              <i className="bi bi-envelope-fill me-2"></i>
              <a
                href="mailto:heisenberg@randoman.online"
                className="text-decoration-none fw-semibold"
                style={{ color: '#11998e' }}
              >
                Contact Us
              </a>
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        .hero-container {
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .feature-card {
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1));
          border: 1px solid rgba(17, 153, 142, 0.3);
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(17, 153, 142, 0.2);
        }

        .feature-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #11998e, #38ef7d);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: white;
        }

        .feature-badge {
          background: linear-gradient(135deg, #f12711, #f5af19) !important;
          color: white !important;
          border: none;
          font-size: 0.8rem;
          padding: 0.3rem 1rem;
        }

        .why-choose-card {
          background: linear-gradient(135deg, rgba(241, 39, 17, 0.1), rgba(245, 175, 25, 0.1));
          border: 1px solid rgba(241, 39, 17, 0.3);
          transition: all 0.3s ease;
        }

        .why-choose-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(241, 39, 17, 0.2);
        }

        .why-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #f12711, #f5af19);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: white;
        }

        .why-badge {
          background: linear-gradient(135deg, #11998e, #38ef7d) !important;
          color: white !important;
          border: none;
          font-size: 0.8rem;
          padding: 0.3rem 1rem;
        }

        .product-card {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(40, 40, 40, 0.9));
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        .product-badge {
          background: linear-gradient(135deg, #f12711, #f5af19) !important;
          color: white !important;
          border: none;
          font-size: 0.9rem;
        }

        .product-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #11998e, #38ef7d);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: white;
          position: relative;
        }

        .product-sparkle {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #f12711, #f5af19);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
        }

        .feature-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .feature-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .feature-item-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f12711, #f5af19);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          color: white;
        }

        .language-card {
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1));
          border: 1px solid rgba(17, 153, 142, 0.3);
          transition: all 0.3s ease;
        }

        .language-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(17, 153, 142, 0.2);
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.2), rgba(56, 239, 125, 0.2));
        }

        .language-card i {
          color: #11998e;
        }

        @media (max-width: 768px) {
          .hero-container {
            min-height: auto;
            padding: 3rem 1rem;
          }
          
          .display-2 {
            font-size: 2.5rem;
          }
          
          .display-4 {
            font-size: 2rem;
          }
          
          .display-6 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}

export default Home;