import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from './navbar';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Tview = () => {
  const API_URL = process.env.REACT_APP_SERVER_API;
  const { QID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- State for the new AI Explanation Feature ---
  const [aiButton, setAiButton] = useState({ show: false, x: 0, y: 0, text: '' });
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [originalSelection, setOriginalSelection] = useState('');

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/problem/${QID}`);
        setProblem(res.data.problem);
        setError('');
      } catch (err) {
        setError('Failed to load tutorial. Please try again.');
        console.error('Error loading problem');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [QID, API_URL]);

  // --- Event listener to show/hide the AI button on text selection ---
  useEffect(() => {
    const handleMouseUp = () => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setAiButton({
                show: true,
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY - 40, // Position above the selection
                text: selectedText
            });
        } else {
            setAiButton({ show: false, x: 0, y: 0, text: '' });
        }
    };
    
    // We only add the listener when the main content has loaded
    if (problem) {
        document.addEventListener('mouseup', handleMouseUp);
    }

    // Cleanup function to remove the listener
    return () => {
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [problem]); // Re-run this effect when the problem data is loaded

  // --- Function to call the AI for an explanation ---
  const handleExplainTheory = async (selectedText) => {
    setOriginalSelection(selectedText);
    setShowExplainModal(true);
    setIsExplaining(true);
    setExplanation('Getting a detailed explanation from the AI...');

    // Manipulate the prompt to ask for a theory explanation
    const prompt = `Explain the following concept in simple terms with clear examples. Do not provide code unless it is essential for the explanation: "${selectedText}"`;

    try {
        // Using the same '/help' endpoint, but with the new theory-focused prompt
        const response = await axios.post(`${API_URL}/help`, { code: prompt, QID: 'theory-explanation' });
        setExplanation(response.data.result || "Could not get an explanation for this topic.");
    } catch (err) {
        console.error("AI Explanation error:", err);
        setExplanation("Sorry, an error occurred while getting the explanation.");
    } finally {
        setIsExplaining(false);
        // Hide the floating button after it's clicked
        setAiButton({ show: false, x: 0, y: 0, text: '' });
    }
  };


  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'badge bg-success-subtle border border-success text-success px-4 py-2 rounded-pill fw-semibold fs-6';
      case 'medium':
        return 'badge bg-warning-subtle border border-warning text-warning px-4 py-2 rounded-pill fw-semibold fs-6';
      case 'hard':
        return 'badge bg-danger-subtle border border-danger text-danger px-4 py-2 rounded-pill fw-semibold fs-6';
      case 'basic':
        return 'badge bg-secondary-subtle border border-secondary text-secondary px-4 py-2 rounded-pill fw-semibold fs-6';
      default:
        return 'badge bg-light px-4 py-2 rounded-pill fw-semibold fs-6';
    }
  };

  const getTagBadge = (tag) => 'badge text-light px-3 py-2 rounded-pill fw-medium me-2 mb-2';

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  if (!user) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="alert alert-danger shadow-lg border-0 rounded-4 px-4 py-3">
          <h5 className="mb-0">⚠️ Unauthorized Access</h5>
        </div>
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center shadow-lg border-0 rounded-4">
          <h5 className="mb-0">🔒 You are not logged in.</h5>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      {/* Floating "Ask AI" button that appears on text selection */}
      {aiButton.show && (
          <button
              className="btn btn-dark btn-sm shadow"
              style={{
                  position: 'fixed',
                  top: `${aiButton.y}px`,
                  left: `${aiButton.x}px`,
                  zIndex: 1050,
                  transition: 'opacity 0.2s ease-in-out',
              }}
              onClick={() => handleExplainTheory(aiButton.text)}
          >
              <i className="bi bi-robot me-2"></i> Ask Randoman AI
          </button>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          position: relative;
          overflow: hidden;
        }
        
        .hero-gradient::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.05);
        }
        
        .tutorial-card {
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }
        
        .tutorial-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: linear-gradient(to right, #11998e, #38ef7d);
        }
        
        .gradient-text-primary {
          background: linear-gradient(to right, #ff416c, #ff4b2b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .gradient-text-secondary {
          background: linear-gradient(to right, #11998e, #38ef7d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .tag-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          transition: transform 0.2s ease;
        }
        
        .tag-badge:hover {
          transform: scale(1.05);
        }
        
        .btn-gradient-primary {
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          border: none;
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 65, 108, 0.3);
        }
        
        .btn-gradient-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 65, 108, 0.4);
          color: white;
        }
        
        .btn-gradient-secondary {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          border: none;
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);
        }
        
        .btn-gradient-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(17, 153, 142, 0.4);
          color: white;
        }
        
        .btn-outline-gradient {
          background: transparent;
          border: 2px solid transparent;
          background-image: linear-gradient(white, white), linear-gradient(135deg, #11998e, #38ef7d);
          background-origin: border-box;
          background-clip: content-box, border-box;
          color: #11998e;
          transition: all 0.3s ease;
        }
        
        .btn-outline-gradient:hover {
          background-image: linear-gradient(135deg, #11998e, #38ef7d), linear-gradient(135deg, #11998e, #38ef7d);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(17, 153, 142, 0.3);
        }
        
        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border: 0.3em solid rgba(17, 153, 142, 0.2);
          border-top: 0.3em solid #11998e;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .tutorial-content {
          line-height: 1.8;
        }
        
        .tutorial-content h1,
        .tutorial-content h2,
        .tutorial-content h3,
        .tutorial-content h4,
        .tutorial-content h5,
        .tutorial-content h6 {
          font-weight: 600;
          margin-top: 2.5rem;
          margin-bottom: 1.5rem;
          position: relative;
        }
        
        .tutorial-content h1::after,
        .tutorial-content h2::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(to right, #11998e, #38ef7d);
          border-radius: 2px;
        }
        
        .tutorial-content p {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }
        
        .tutorial-content code {
          padding: 0.4rem 0.6rem;
          border-radius: 8px;
          font-size: 0.9em;
          font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
        }
        
        .tutorial-content pre {
          padding: 2rem;
          border-radius: 16px;
          overflow-x: auto;
          margin: 2rem 0;
          border-left: 5px solid #11998e;
          position: relative;
        }
        
        .tutorial-content pre::before {
          content: '💻 Code';
          position: absolute;
          top: 0.5rem;
          right: 1rem;
          background: rgba(17, 153, 142, 0.2);
          color: #38ef7d;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .tutorial-content pre code {
          background: transparent !important;
          border: none !important;
          padding: 0;
        }
        
        .tutorial-content ul,
        .tutorial-content ol {
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }
        
        .tutorial-content li {
          margin-bottom: 0.8rem;
          font-size: 1.05rem;
        }
        
        .tutorial-content blockquote {
          border-left: 5px solid #11998e;
          padding: 1.5rem 2rem;
          margin: 2rem 0;
          border-radius: 12px;
          position: relative;
          font-style: italic;
        }
        
        .tutorial-content blockquote::before {
          content: '💡';
          position: absolute;
          top: 1rem;
          left: -2px;
          font-size: 1.5rem;
          background: #11998e;
          color: white;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-style: normal;
        }
        
        .tutorial-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .tutorial-content th,
        .tutorial-content td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .tutorial-content th {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          color: white;
          font-weight: 600;
        }
        
        /* Light theme styles */
        [data-bs-theme="light"] .tutorial-content h1,
        [data-bs-theme="light"] .tutorial-content h2,
        [data-bs-theme="light"] .tutorial-content h3,
        [data-bs-theme="light"] .tutorial-content h4,
        [data-bs-theme="light"] .tutorial-content h5,
        [data-bs-theme="light"] .tutorial-content h6 {
          color: #2d3748;
        }
        
        [data-bs-theme="light"] .tutorial-content p,
        [data-bs-theme="light"] .tutorial-content li {
          color: #4a5568;
        }
        
        [data-bs-theme="light"] .tutorial-content code {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          color: #e53e3e;
        }
        
        [data-bs-theme="light"] .tutorial-content pre {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
        }
        
        [data-bs-theme="light"] .tutorial-content pre code {
          color: #2d3748 !important;
        }
        
        [data-bs-theme="light"] .tutorial-content pre::before {
          background: rgba(17, 153, 142, 0.1);
          color: #11998e;
        }
        
        [data-bs-theme="light"] .tutorial-content blockquote {
          background: linear-gradient(135deg, #f0fff4, #e6fffa);
          color: #2d3748;
        }
        
        [data-bs-theme="light"] .tutorial-card {
          background: #fff;
        }
        
        [data-bs-theme="light"] .tutorial-content td {
          border-bottom-color: rgba(0, 0, 0, 0.1);
        }
        
        /* Dark theme styles */
        [data-bs-theme="dark"] .tutorial-content h1,
        [data-bs-theme="dark"] .tutorial-content h2,
        [data-bs-theme="dark"] .tutorial-content h3,
        [data-bs-theme="dark"] .tutorial-content h4,
        [data-bs-theme="dark"] .tutorial-content h5,
        [data-bs-theme="dark"] .tutorial-content h6 {
          color: #e2e8f0;
        }
        
        [data-bs-theme="dark"] .tutorial-content p,
        [data-bs-theme="dark"] .tutorial-content li {
          color: #a0aec0;
        }
        
        [data-bs-theme="dark"] .tutorial-content code {
          background: #2d3748;
          border: 1px solid #4a5568;
          color: #fbb6ce;
        }
        
        [data-bs-theme="dark"] .tutorial-content pre {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          color: #e2e8f0;
        }
        
        [data-bs-theme="dark"] .tutorial-content pre code {
          color: #e2e8f0 !important;
        }
        
        [data-bs-theme="dark"] .tutorial-content pre::before {
          background: rgba(17, 153, 142, 0.2);
          color: #38ef7d;
        }
        
        [data-bs-theme="dark"] .tutorial-content blockquote {
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1));
          color: #e2e8f0;
        }
        
        [data-bs-theme="dark"] .tutorial-card {
          background: #1a202c;
        }
        
        [data-bs-theme="dark"] .tutorial-content td {
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }
        
        [data-bs-theme="dark"] .btn-outline-gradient {
          background-image: linear-gradient(#1a202c, #1a202c), linear-gradient(135deg, #11998e, #38ef7d);
        }
        
        .reading-progress {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(17, 153, 142, 0.2);
          z-index: 9999;
        }
        
        .reading-progress-bar {
          height: 100%;
          background: linear-gradient(to right, #11998e, #38ef7d);
          width: 0%;
          transition: width 0.1s ease;
        }
          
      .bg-gradient-custom {
        background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
      }

      /* Gradient text (already in your project, but here for clarity) */
      .gradient-text-secondary {
        background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      `}</style>

      {/* Reading Progress Bar */}
      <div className="reading-progress">
        <div className="reading-progress-bar" id="progressBar"></div>
      </div>

      <div className="container py-5">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="loading-spinner rounded-circle mx-auto mb-3"></div>
            <p className="text-muted fs-5">Loading tutorial content...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-danger border-0 rounded-4 shadow-sm mb-4">
            <div className="d-flex align-items-center">
              <span className="me-3 fs-4">⚠️</span>
              <div>
                <h6 className="mb-1">Error Loading Tutorial</h6>
                <small>{error}</small>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Content */}
        {!loading && !error && problem && (
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="tutorial-card">
                {/* Tutorial Header */}
                <div className="card-header border-0 p-5 pb-0 bg-gradient-custom text-white rounded-top-4">
                  <div className="text-center mb-4">
                    <h1 className="fw-bold mb-3 display-5 text-dark">
                      {problem.name}
                    </h1>
                    <p className="lead text-light opacity-75">
                          
                    </p>
                  </div>
                </div>

                {/* Tutorial Body */}
                <div className="card-body p-5">
                  <div className="tutorial-content">
                    <ReactMarkdown>
                      {problem.description}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Explanation Modal */}
      {showExplainModal && (
          <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}>
              <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                  <div className="modal-content bg-dark text-light">
                      <div className="modal-header border-0">
                          <h5 className="modal-title fw-bold">
                              <i className="bi bi-robot me-2 text-info"></i> AI Explanation
                          </h5>
                          <button type="button" className="btn-close btn-close-white" onClick={() => setShowExplainModal(false)}></button>
                      </div>
                      <div className="modal-body">
                          {isExplaining ? (
                              <div className="text-center py-5">
                                  <div className="spinner-border text-info" role="status"></div>
                                  <p className="mt-3 fw-semibold">{explanation}</p>
                              </div>
                          ) : (
                              <>
                                  <div className="mb-4">
                                      <p className="text-muted mb-1">EXPLAINING THE CONCEPT:</p>
                                      <h4 className="fw-bold">"{originalSelection}"</h4>
                                  </div>
                                  <hr/>
                                  <div className="markdown-content mt-4" style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                                      <ReactMarkdown
                                          children={explanation}
                                          components={{
                                              code({ node, inline, className, children, ...props }) {
                                                  const match = /language-(\w+)/.exec(className || "");
                                                  return !inline && match ? (
                                                      <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                                                          {String(children).replace(/\n$/, "")}
                                                      </SyntaxHighlighter>
                                                  ) : (<code className={`${className} bg-secondary-subtle p-1 rounded text-dark`} {...props}>{children}</code>);
                                              },
                                          }}
                                      />
                                  </div>
                              </>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Scroll Progress Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.addEventListener('scroll', function() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
              progressBar.style.width = scrolled + '%';
            }
          });
        `
      }} />
    </>
  );
};

export default Tview;
