import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Dnav from './dnav';
import 'bootstrap/dist/css/bootstrap.min.css';
import collaborationImage from '../assets/collaboration.png';
import resumeImage from '../assets/resume-analyzer.png';
import performanceImage from '../assets/performance.png';
import trackingImage from '../assets/tracking.png';
import sharingImage from '../assets/sharing.png';
import mentorImage from '../assets/mentor.png';
import workspaceImage from '../assets/workspace.png';
import problemsImage from '../assets/problems.png';
import calendarImage from '../assets/calendar.png';
function Home() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleWatchDemo = () => {
    window.open('https://drive.google.com/file/d/1erYInNK5HJpp7k4vX7VTQPeqH-djlgld/view', '_blank');
  };
 const coreFeatures = [
    {
      icon: "bi-people-fill",
      title: "Live Collaboration ",
      description: "Code together in real time and clarify doubts through live voice conversations — no need for Zoom or Discord. Share your session, collaborate seamlessly, and solve problems together. Perfect for mock interviews, pair programming, and study sessions.",
      imageUrl: collaborationImage // Replace with your image
    },
    {
      icon: "bi-robot",
      title: "AI Resume Analyzer & Optimizer",
      description: "Transform your resume with AI-powered analysis, ATS compatibility scoring, and smart improvement suggestions. Get real-time feedback , auto save of most recent versions, and export a professional LaTeX resume that beats applicant tracking systems.",
      imageUrl: resumeImage // Replace with your image
    },
    {
      icon: "bi-lightning-charge-fill",
      title: "Blazing-Fast Performance",
      description: "Experience sub-100ms code compilation and execution. Our optimized infrastructure handles everything from simple algorithms to complex programs without lag, keeping you in your coding flow.",
      imageUrl: performanceImage // Replace with your image
    },
    {
      icon: "bi-graph-up-arrow",
      title: "Smart Progress Tracking",
      description: "Visualize your coding journey with interactive heatmaps, detailed submission statistics, and topic-wise analytics. Track streaks, achievements, and improvement patterns that keep you motivated.",
      imageUrl: trackingImage // Replace with your image
    },
    {
      icon: "bi-share-fill",
      title: "Live Public Profile Sharing",
      description: "Share your CodeHub profile with a live link that updates in real-time. Showcase solved problems , and achievements to recruiters instantly—no manual updates needed, your progress syncs automatically.",
      imageUrl: sharingImage // Replace with your image
    }
  ];

  // --- Data for "Why Choose Us" Features ---
  const whyChooseUsFeatures = [
    {
      icon: "bi-cpu-fill",
      title: "24/7 AI Coding Mentor",
      description: "Never get stuck again. Our adaptive AI provides contextual hints, debugging assistance, and step-by-step explanations tailored to your skill level. Learn faster with a mentor that's always available—no waiting, no judgment.",
      imageUrl: mentorImage // Replace with your image
    },
    {
      icon: "bi-cloud-fill",
      title: "Real-Time Cloud Workspace",
      description: "Access your codes and saved files from anywhere with secure cloud storage that syncs instantly. Create shared folders with granular permission controls for team projects. Owner-controlled sharing means your files stay protected while enabling seamless collaboration.",
      imageUrl: workspaceImage // Replace with your image
    },
    {
      icon: "bi-calendar-check-fill",
      title: "Interview-Ready Problem Sets",
      description: "Practice with problems curated from actual FAANG and top company interviews. Expert-selected challenges match real-world patterns with detailed editorials, multiple solution approaches, and company-specific tags to target your dream job.",
      imageUrl: problemsImage // Replace with your image
    },
    {
      icon: "bi-trophy-fill",
      title: "Auto-Synced Contest Calendar",
      description: "Stay competition-ready with CodeForces contests automatically added to your Google Calendar. Get pre-event notifications, track upcoming competitions, and never miss an opportunity to test your skills against the global community.",
      imageUrl: calendarImage // Replace with your image
    }
  ];

  if (user) {
    navigate("/dashboard");
    return null; // Return null to prevent rendering anything while redirecting
  }

  return (
    <>
      <Dnav />
      <div className={`home-page theme-${theme}`}>
        {/* Hero Section */}
        <section className="hero-section text-center">
          <div className="container">
            <h1 className="display-3 fw-bold mb-4 gradient-text">
              Enter the Arena of Code
            </h1>
            <p className="lead subtitle mx-auto mb-5">
              A next-generation platform designed for speed, collaboration, and excellence. Sharpen your skills, compete with peers, and land your dream job.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <button onClick={handleLogin} className="btn btn-lg btn-gradient-primary fw-semibold px-5 py-3">
                <i className="bi bi-code-slash me-2"></i>
                Start Solving
              </button>
              <button onClick={handleWatchDemo} className="btn btn-lg btn-secondary-custom fw-semibold px-5 py-3">
                <i className="bi bi-play-circle-fill me-2"></i>
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
         <section className="container py-5">
          <div className="text-center mb-5">
              <h2 className="display-5 fw-bold gradient-text">Core Features</h2>
              <p className="lead subtitle mx-auto">
                Discover the tools that make our platform next-generation.
              </p>
          </div>
          <div className="feature-tree">
            {coreFeatures.map((feature, index) => (
              <div key={index} className="feature-row">
                {/* Feature Card Content */}
                <div className="feature-content-card">
                  <i className={`${feature.icon} card-icon`}></i>
                  <h5 className="fw-bold mb-2">{feature.title}</h5>
                  <p className="mb-0 opacity-75">{feature.description}</p>
                </div>
                {/* Feature Image */}
                <div className="feature-image-container">
                  <img src={feature.imageUrl} alt={`${feature.title} illustration`} className="img-fluid" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================== */}
        {/* UPDATED: Why Choose Us Section */}
        {/* ====================================================== */}
        <section className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold gradient-text">Why CodeHub?</h2>
            <p className="lead subtitle mx-auto">
              Features that set us apart from LeetCode, HackerRank, and the competition.
            </p>
          </div>
          {/* We reuse the SAME .feature-tree class here */}
          <div className="feature-tree">
            {whyChooseUsFeatures.map((feature, index) => (
               <div key={index} className="feature-row">
                {/* Feature Card Content */}
                <div className="feature-content-card">
                  <i className={`${feature.icon} card-icon`}></i>
                  <h5 className="fw-bold mb-2">{feature.title}</h5>
                  <p className="mb-0 opacity-75">{feature.description}</p>
                </div>
                {/* Feature Image */}
                <div className="feature-image-container">
                  <img src={feature.imageUrl} alt={`${feature.title} illustration`} className="img-fluid" />
                </div>
              </div>
            ))}
          </div>
        </section>






        {/* Products Section */}
        <section className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold gradient-text">Our Products</h2>
            <p className="lead subtitle mx-auto">Discover the cutting-edge tools built for passionate developers.</p>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-7">
              <div className="product-card p-4 p-md-5">
                <div className="text-center mb-4">
                  <span className="product-badge px-3 py-2 fw-semibold">
                    <i className="bi bi-stars me-2"></i>
                    FEATURED TOOL
                  </span>
                </div>
                <div className="text-center mb-4">
                  <div className="product-icon mx-auto">
                    <i className="bi bi-tools"></i>
                  </div>
                  <h4 className="fw-bold mt-3 mb-1">Software Collaborative Tool</h4>
                  <p className="opacity-75">AI-Powered UML & Code Generation</p>
                </div>
                <div className="row g-3 mb-4">
                  <ProductFeature icon="bi-robot" title="AI-Powered Engine" description="UML-to-code & code-to-UML" />
                  <ProductFeature icon="bi-lightning-fill" title="80% Faster Workflow" description="Minutes instead of hours" />
                  <ProductFeature icon="bi-people-fill" title="Team Collaboration" description="Real-time editing & live preview" />
                  <ProductFeature icon="bi-bug-fill" title="Debug & Export" description="Inline debugging & seamless sharing" />
                </div>
                <div className="text-center">
                  <a href="https://uml.randoman.online" target="_blank" rel="noopener noreferrer" className="btn btn-lg btn-gradient-primary fw-semibold px-5 py-3 text-decoration-none">
                    <i className="bi bi-rocket-takeoff me-2"></i>
                    Launch Tool
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold gradient-text">All-in-One Platform</h2>
            <p className="lead subtitle mx-auto">
              Everything you need to master coding and land your dream job—no switching between tools.
            </p>
          </div>

          <div className="row g-4">

            <div className="col-lg-3 col-md-6">
              <div className="text-center p-4">
                <i className="bi bi-code-slash" style={{ fontSize: '3rem', color: '#8b5cf6' }}></i>
                <h4 className="mt-3">Practice</h4>
                <p className="text-muted"> curated problems</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="text-center p-4">
                <i className="bi bi-people-fill" style={{ fontSize: '3rem', color: '#8b5cf6' }}></i>
                <h4 className="mt-3">Collaborate</h4>
                <p className="text-muted">Voice Enabled coding sessions</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="text-center p-4">
                <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem', color: '#8b5cf6' }}></i>
                <h4 className="mt-3">Optimize Resume</h4>
                <p className="text-muted">AI-powered ATS scoring</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="text-center p-4">
                <i className="bi bi-briefcase-fill" style={{ fontSize: '3rem', color: '#8b5cf6' }}></i>
                <h4 className="mt-3">Get Hired</h4>
                <p className="text-muted">Shareable profile for recruiters</p>
              </div>
            </div>

          </div>
        </section>

        {/* Languages Section 
        <section className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold gradient-text">Wide Language Support</h2>
          </div>
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4">
            <LanguageChip icon="bi-code" name="C++ (GCC)" />
            <LanguageChip icon="bi-filetype-java" name="Java (OpenJDK)" />
            <LanguageChip icon="bi-filetype-py" name="Python 3" />
          </div>
        </section>*/}

        {/* Final CTA */}
        <section className="container text-center py-5">
          <h2 className="fw-bold mb-4">Ready to Transform Your Coding Experience?</h2>
          <button onClick={handleLogin} className="btn btn-lg btn-gradient-primary fw-semibold px-5 py-3">
            Get Started for Free <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </section>

        {/* Footer */}
        <footer className="footer mt-auto py-4">
          <div className="container text-center">
            <p className="mb-1">&copy; 2025 CodeHub. All rights reserved.</p>
            <a href="mailto:heisenberg@randoman.online" className="footer-link">
              <i className="bi bi-envelope-fill me-2"></i>Contact Us
            </a>
          </div>
        </footer>
      </div>
<style>{`
  /* ======================================= */
  /* Global & Component Styles             */
  /* ======================================= */

  .home-page {
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  .gradient-text {
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .subtitle {
    max-width: 700px;
  }
  
  /* --- Theme Colors --- */
  .theme-dark {
    background-color: #12121c;
    color: #fff;
  }
  .theme-light {
    background-color: #f8f9fa;
    color: #212529;
  }
  .theme-dark .subtitle { color: rgba(255, 255, 255, 0.7); }
  .theme-light .subtitle { color: #6c757d; }

  /* --- Hero Section --- */
  .hero-section {
    padding: 8rem 0;
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* --- Buttons --- */
  .btn-gradient-primary {
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
    border: none;
    color: white;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  .btn-gradient-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    color: white;
  }
  .btn-secondary-custom {
    border: 1px solid;
    transition: all 0.3s ease;
  }
  .theme-dark .btn-secondary-custom {
    background-color: transparent;
    border-color: #3a3a5a;
    color: #fff;
  }
  .theme-light .btn-secondary-custom {
    background-color: #e9ecef;
    border-color: #dee2e6;
    color: #212529;
  }
  .theme-dark .btn-secondary-custom:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: #8b5cf6;
  }
  .theme-light .btn-secondary-custom:hover {
    background-color: #dee2e6;
    border-color: #3b82f6;
  }

  /* --- Generic & Product Card Styles --- */
  .card-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    display: inline-block;
    color: #8b5cf6;
  }
  .product-card {
    border-radius: 1rem;
    border: 1px solid;
    position: relative;
    overflow: hidden;
  }
  .theme-dark .product-card {
    background-color: #1e1e2f;
    border-color: #3a3a5a;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  }
  .theme-light .product-card {
    background-color: #ffffff;
    border-color: #dee2e6;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  }

  /* --- Footer --- */
  .footer {
    border-top: 1px solid;
  }
  .theme-dark .footer {
    background-color: #1e1e2f;
    border-color: #3a3a5a;
  }
  .theme-light .footer {
    background-color: #e9ecef;
    border-color: #dee2e6;
  }
  .footer-link {
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
  }
  .theme-dark .footer-link { color: #8b5cf6; }
  .theme-light .footer-link { color: #3b82f6; }
  .footer-link:hover { color: #ef4444; }


  /* ====================================================== */
  /* CORRECTED: Feature Tree with Alternating Image Layout  */
  /* ====================================================== */
  .feature-tree {
    display: flex;
    flex-direction: column;
    gap: 5rem; /* Spacing between rows */
    position: relative;
    margin: 4rem 0;
  }

  /* The vertical timeline bar */
  .feature-tree::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 3px;
    background-image: linear-gradient(to bottom, #3b82f6, #8b5cf6, #ef4444);
    opacity: 0.2;
    transform: translateX(-50%);
    z-index: 0;
  }

  .feature-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  /* This is the key to alternating sides */
  .feature-row:nth-child(even) {
    direction: rtl; /* Reverses the order of grid columns */
  }
  .feature-row:nth-child(even) > * {
    direction: ltr; /* Resets text direction for the content inside */
  }

  .feature-content-card {
    padding: 2rem;
    border-radius: 1rem;
    border: 1px solid transparent;
    transition: all 0.3s ease;
    text-align: left;
  }

  /* ✅ FIX: Theme-aware backgrounds for cards */
  .theme-dark .feature-content-card {
    background-color: #1e1e2f;
    border-color: #3a3a5a;
  }
  .theme-light .feature-content-card {
    background-color: #ffffff; /* Correct background for light mode */
    border-color: #dee2e6;
    box-shadow: 0 5px 20px rgba(0,0,0,0.07);
  }

  /* --- Hover Effects --- */
  .theme-dark .feature-content-card:hover {
    transform: translateY(-5px);
    border-color: #8b5cf6;
  }
  .theme-light .feature-content-card:hover {
    transform: translateY(-5px);
    border-color: #3b82f6;
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }

.feature-image-container img {
  /* ✅ Change width from 100% to a smaller value */
  width: 80%; 
  height: auto;
  object-fit: cover;
  border-radius: 1rem;
  transition: transform 0.3s ease;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
  .feature-image-container img:hover {
    transform: scale(1.03);
  }

  /* --- Responsive Adjustments --- */
  @media (max-width: 992px) {
    .feature-tree::before {
      left: 1.5rem; 
    }
    .feature-row, .feature-row:nth-child(even) {
      grid-template-columns: 1fr; /* Stack columns vertically */
      direction: ltr; /* Reset direction */
      gap: 2rem;
      padding-left: 3rem; 
    }
    .feature-image-container {
      grid-row: 1; /* Image appears first */
        display: flex;
  justify-content: center;
  align-items: center;
    }
    .feature-content-card {
      grid-row: 2; /* Card appears second */
    }
  }

`}</style>
    </>
  );
}

// Reusable components for cards and chips
const FeatureCard = ({ icon, title, description }) => (
  <div className="col-lg-3 col-md-6">
    <div className="card-custom text-center">
      <i className={`${icon} card-icon`}></i>
      <h5 className="fw-bold mb-2">{title}</h5>
      <p className="mb-0 opacity-75">{description}</p>
    </div>
  </div>
);

const InfoCard = ({ icon, title, description }) => (
  <div className="card-custom text-center">
    <i className={`${icon} card-icon`}></i>
    <h5 className="fw-bold mb-2">{title}</h5>
    <p className="mb-0 opacity-75">{description}</p>
  </div>
);

const LanguageChip = ({ icon, name }) => (
  <div className="language-chip d-flex align-items-center gap-3">
    <i className={icon}></i>
    <span>{name}</span>
  </div>
);

const ProductFeature = ({ icon, title, description }) => (
  <div className="col-md-6">
    <div className="feature-item">
      <div className="d-flex align-items-center">
        <div className="feature-item-icon me-3">
          <i className={icon}></i>
        </div>
        <div>
          <h6 className="fw-bold mb-0">{title}</h6>
          <small className="opacity-75">{description}</small>
        </div>
      </div>
    </div>
  </div>
);


export default Home;

