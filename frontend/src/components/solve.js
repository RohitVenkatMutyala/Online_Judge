import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import Navbar from './navbar';
import { useTheme } from '../context/ThemeContext';
import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
const Solve = () => {
  const API_URL = process.env.REACT_APP_SERVER_API;
  const API_COM = process.env.REACT_APP_COMPILER_API;
  console.log(API_COM);
  const { QID } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [Solved, setSolved] = useState('');
  const [input, setInput] = useState('');
  const { theme } = useTheme();


  const [code, setCode] = useState(`#include <iostream>

int main() {
  std::cout << "Hello, World!" << std::endl;
  return 0;
}`);
  const [language, setLanguage] = useState('cpp');
  const [output, setOutput] = useState('');
  const [verdicts, setVerdicts] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputtest, setInputTest] = useState('');
  const [outputtest, setOutputTest] = useState('');
  const [activeTab, setActiveTab] = useState('input');
  const [TotalTime, setTime] = useState();


  // Load code, language, input from localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && QID) {
        try {
          const docRef = doc(db, "codeSubmissions", `${user.email}-${QID}`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.code) setCode(data.code);
            if (data.language) setLanguage(data.language);
            if (data.input) setInput(data.input);
          }
        } catch (err) {
          console.error("Error fetching data from Firestore:", err);
        }
      }
    };
    fetchUserData();
  }, [QID, user]);


  // console.log(user._id);
  // Fetch problem
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`${API_URL}/problem/${QID}`);
        setProblem(res.data.problem);
      } catch (err) {
        console.error('Error loading problem:', err);
      }
    };
    fetchProblem();
  }, [QID]);
  const saveToFirebase = async (newData) => {
    if (user && QID) {
      try {
        await setDoc(doc(db, "codeSubmissions", `${user.email}-${QID}`), {
          email: user.email,
          QID,
          code,
          language,
          input,
          ...newData,
        });
      } catch (err) {
        console.error("Error saving to Firestore:", err);
      }
    }
  };

  const handleCodeChange = (newValue) => {
    setCode(newValue);
    saveToFirebase({ code: newValue });
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);


    saveToFirebase({ language: newLang });

  };

  const handleinput = (e) => {
    const val = e.target.value;
    setInput(val);
    saveToFirebase({ input: val });
  };


  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await axios.post(`${API_COM}/run`, {
        language,
        code,
        input,
      });
      setOutput(res.data.output || res.data.error || 'No output');
      setActiveTab('output');
      setIsRunning(false);
    } catch (error) {
      console.error("Compilation/Execution error:", error);
      setIsRunning(false);
      if (error.response && error.response.data) {
        setOutput(error.response.data.error);
      } else {
        setOutput('Something went wrong!');
      }
      setActiveTab('output');
    }
  };
  const handlesubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await axios.get(`${API_URL}/test/${QID}`);
      if (
        res.data.success &&
        res.data.test &&
        res.data.test.inputTestCase &&
        res.data.test.outputTestCase
      ) {
        const response = res.data.test.inputTestCase.data;
        const outresponse = res.data.test.outputTestCase.data;

        const uint8 = new Uint8Array(response.data);
        const val = new TextDecoder('utf-8').decode(uint8);

        const ouint8 = new Uint8Array(outresponse.data);
        const outval = new TextDecoder('utf-8').decode(ouint8);
        const id = user._id;
        const compilerresponse = await axios.post(`${API_COM}/submit`, {
          language,
          code,
          input: val,
          expectedOutput: outval,
          id,
          QID,

        });

        const data = compilerresponse.data;
        console.log(data);
        console.log("Passed:", data.passed, "Total:", data.total);
        console.log("TotalTime:", data.totalTimeMs);  // ✅ Matches backend key

        setTime(data.totalTimeMs);
        console.log(Solved);
        setVerdicts(data.verdicts);
        if (data.success) {
          setActiveTab('verdict');
        }
        else {
          setActiveTab('output');
        }
        if (data.passed === data.total) {
          const solvedStatus = "Solved";

          // Update local React state (optional, for UI)
          setSolved(solvedStatus);

          // Use local value in API call

          await axios.post(`${API_URL}/rd`, {
            status: solvedStatus, // ✅ use correct key name too
            QID,
            id,
          });
        }

      } else {
        setOutput("Test case data missing.");
        setActiveTab('output');
      }
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Submit error:", error);
      if (error.response?.data?.error) {
        setOutput(error.response.data.error);
      } else {
        setOutput("Something went wrong!");
      }
      setActiveTab('output');
    }
  };


  if (!problem) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center d-flex align-items-center justify-content-center gap-2">
          <div className="spinner-border text-warning" role="status" style={{ width: "1.5rem", height: "1.5rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>Loading...</span>
        </div>

      </div>
    );
  }

  if (!user || user.role === 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          {user ? 'Admins cannot solve problems.' : 'Unauthorized'}
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
       {/* Custom Styles */}
      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          background: rgba(0, 0, 0, 0.1);
        }
        
        .problem-card {
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }
        
        .problem-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: linear-gradient(to right, #ff416c, #ff4b2b);
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
          background-image: linear-gradient(white, white), linear-gradient(135deg, #667eea, #764ba2);
          background-origin: border-box;
          background-clip: content-box, border-box;
          color: #667eea;
          transition: all 0.3s ease;
        }
        
        .btn-outline-gradient:hover {
          background-image: linear-gradient(135deg, #667eea, #764ba2), linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }
        
        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border: 0.3em solid rgba(255, 65, 108, 0.2);
          border-top: 0.3em solid #ff416c;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .markdown-content {
          line-height: 1.8;
        }
        
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .markdown-content p {
          margin-bottom: 1.5rem;
        }
        
        .markdown-content code {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.9em;
          color: #e53e3e;
        }
        
        .markdown-content pre {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 12px;
          overflow-x: auto;
          margin: 1.5rem 0;
          border-left: 4px solid #ff416c;
        }
        
        .markdown-content pre code {
          background: transparent;
          color: inherit;
          border: none;
          padding: 0;
        }
        
        .markdown-content ul,
        .markdown-content ol {
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }
        
        .markdown-content li {
          margin-bottom: 0.5rem;
        }
        
        .markdown-content blockquote {
          border-left: 4px solid #11998e;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          border-radius: 8px;
        }
        
        /* Light theme styles */
        [data-bs-theme="light"] .markdown-content h1,
        [data-bs-theme="light"] .markdown-content h2,
        [data-bs-theme="light"] .markdown-content h3,
        [data-bs-theme="light"] .markdown-content h4,
        [data-bs-theme="light"] .markdown-content h5,
        [data-bs-theme="light"] .markdown-content h6 {
          color: #2d3748;
        }
        
        [data-bs-theme="light"] .markdown-content p,
        [data-bs-theme="light"] .markdown-content li {
          color: #4a5568;
        }
        
        [data-bs-theme="light"] .markdown-content code {
          background: linear-gradient(135deg, #f7fafc, #edf2f7);
          border: 1px solid #e2e8f0;
        }
        
        [data-bs-theme="light"] .markdown-content blockquote {
          background: linear-gradient(135deg, #f0fff4, #e6fffa);
          color: #2d3748;
        }
        
        [data-bs-theme="light"] .info-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        /* Dark theme styles */
        [data-bs-theme="dark"] .markdown-content h1,
        [data-bs-theme="dark"] .markdown-content h2,
        [data-bs-theme="dark"] .markdown-content h3,
        [data-bs-theme="dark"] .markdown-content h4,
        [data-bs-theme="dark"] .markdown-content h5,
        [data-bs-theme="dark"] .markdown-content h6 {
          color: #e2e8f0;
        }
        
        [data-bs-theme="dark"] .markdown-content p,
        [data-bs-theme="dark"] .markdown-content li {
          color: #a0aec0;
        }
        
        [data-bs-theme="dark"] .markdown-content code {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          border: 1px solid #4a5568;
          color: #fbb6ce;
        }
        
        [data-bs-theme="dark"] .markdown-content blockquote {
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1));
          color: #e2e8f0;
        }
        
        [data-bs-theme="dark"] .info-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          border: 1px solid rgba(102, 126, 234, 0.2);
        }
        
        [data-bs-theme="dark"] .problem-card {
          background: #1a202c;
        }
        
        [data-bs-theme="dark"] .card-header,
        [data-bs-theme="dark"] .card-footer {
          background: #1a202c !important;
        }
        
        .info-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
      `}</style>
      <div className="container-fluid px-4 mt-4">
        <div className="row g-4">
          {/* Problem Section */}
          <div className="col-lg-6">
            <div className="card shadow border-0 rounded-3">
              <div className="card-body">
                   {/* Problem Content */}
                     {!loading && !error && problem && (
                       <div className="row justify-content-center">
                         <div className="col-lg-10 col-xl-8">
                           <div className="problem-card">
                             {/* Problem Header */}
                             <div className="card-header bg-white border-0 p-4 pb-0">
                               <div className="row align-items-start">
                                 <div className="col-12">
                                   <h1 className="gradient-text-secondary fw-bold mb-4 display-6">
                                     {problem.name}
                                   </h1>
                                   
                                   {/* Problem Meta Info */}
                                   <div className="info-section rounded-3 p-4 mb-4">
                                     <div className="row align-items-center">
                                       <div className="col-md-6 mb-3 mb-md-0">
                                         <div className="d-flex align-items-center">
                                           <span className="text-muted fw-medium me-3">Difficulty:</span>
                                           <span className={getDifficultyBadge(problem.difficulty)}>
                                             {problem.difficulty?.toUpperCase() || 'UNKNOWN'}
                                           </span>
                                         </div>
                                       </div>
                                       <div className="col-md-6">
                                         {problem.tag && (
                                           <div className="d-flex align-items-center flex-wrap">
                                             <span className="text-muted fw-medium me-3">Tags:</span>
                                             <div className="d-flex flex-wrap">
                                               {problem.tag.split(',').map((tag, idx) => (
                                                 <span key={idx} className={`${getTagBadge(tag.trim())} tag-badge`}>
                                                   #{tag.trim()}
                                                 </span>
                                               ))}
                                             </div>
                                           </div>
                                         )}
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>
             
                             {/* Problem Description */}
                             <div className="card-body p-4">
                               <div className="mb-4">
                                 <h4 className="gradient-text-primary fw-bold mb-3">
                                   📝 Problem Description
                                 </h4>
                               </div>
                               
                               <div className="markdown-content">
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
            </div>
          </div>

          {/* Editor and Tab Section */}
          <div className="col-lg-6">
            {/* Language Select */}
            <div className="mb-3">
              <label htmlFor="languageSelect" className="form-label fw-bold">Select Language:</label>
              <select
                id="languageSelect"
                className="form-select"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="cpp">C++</option>
                <option value="py">Python</option>
                <option value="java">Java</option>
              </select>
            </div>

            {/* Editor */}
            <div className="card shadow border-0 mb-3">
              <div className="card-header bg-dark text-white fw-semibold rounded-top">Code Editor</div>
              <div className="card-body p-0">
                <Editor
                  height="460px"
                  language={
                    language === 'cpp' ? 'cpp' :
                      language === 'py' ? 'python' :
                        language === 'java' ? 'java' : 'cpp'
                  }
                  value={code}
                  theme="vs-dark"
                  onChange={handleCodeChange}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    tabSize: 2,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs rounded-top">
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'input' ? 'active' : ''}`} onClick={() => setActiveTab('input')}>
                  Input
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'output' ? 'active' : ''}`} onClick={() => setActiveTab('output')}>
                  Output
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'verdict' ? 'active' : ''}`} onClick={() => setActiveTab('verdict')}>
                  Verdict
                </button>
              </li>
            </ul>

            {/* Tab Contents */}
            <div className={`tab-content border border-top-0 p-3 rounded-bottom bg-${theme === 'dark' ? 'dark' : 'light'} text-${theme === 'dark' ? 'light' : 'dark'}`} style={{ minHeight: '180px' }}>

              {activeTab === 'input' && (


                <div className="tab-pane fade show active">
                  <label
                    htmlFor="inputArea"
                    className="form-label fw-semibold"
                    style={{
                      background: 'linear-gradient(to right, #f12711, #f5af19)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Custom Input:
                  </label>

                  <textarea
                    id="inputArea"
                    className="form-control mb-3 text-body bg-body border border-secondary"
                    style={{ resize: 'vertical', minHeight: '120px' }}
                    rows="4"
                    placeholder="Enter custom input (if required)..."
                    value={input || ''}
                    onChange={handleinput}
                  />

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary w-50 d-flex align-items-center justify-content-center gap-1"
                      onClick={handleRun}
                      disabled={isRunning}
                    >
                      {isRunning ? (
                        <>
                          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                          Running...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-play-fill"></i> Run Code
                        </>
                      )}
                    </button>

                    <button
                      className="btn btn-outline-success w-50 d-flex align-items-center justify-content-center gap-1"
                      onClick={handlesubmit}

                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                          Submitting...
                        </>
                      ) : (

                        <>
                          <i className="bi bi-rocket-takeoff-fill"></i> Submit Code
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

              {activeTab === 'output' && (
                <div className="tab-pane fade show active">
                  {output ? (
                    <div className={`card shadow-sm border-0 bg-${theme === 'dark' ? 'dark' : 'white'} text-${theme === 'dark' ? 'light' : 'dark'}`}>

                      <div
                        className="card-header text-center fw-bold"
                        style={{
                          background: 'linear-gradient(to right, #f12711, #f5af19)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: '1.25rem'
                        }}
                      >
                        Output
                      </div>


                      <div className="card-body">
                        <pre className="mb-0">{output}</pre>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted">Run code to see output.</p>
                  )}
                </div>
              )}

              {activeTab === 'verdict' && (
                <div className="tab-pane fade show active">
                  <div className="card shadow-sm border-0">
                    <div
                      className="card-header text-center fw-bold"
                      style={{
                        background: 'linear-gradient(to right, #f12711, #f5af19)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '1.25rem'
                      }}
                    >
                      Verdict
                    </div>

                    <div className="card-body">
                      {verdicts.length === 0 ? (
                        <p className="text-muted">Verdict will appear here.</p>
                      ) : (
                        <>
                          {/* Total Time Display */}
                          {/* Time & Quote Section */}

                          <div className="mb-3">
                            <div className="alert alert-secondary d-inline-block fw-semibold">
                              ⏱️ Total Time Taken:{" "}
                              <span className="badge bg-dark">
                                {typeof TotalTime === "number"
                                  ? `${TotalTime}ms`
                                  : "N/A"}
                              </span>
                            </div>


                            <div className="mt-2 fw-medium text-warning">
                              {(() => {
                                if (typeof TotalTime !== "number") return "⏰ Looks like something went wrong.";
                                if (TotalTime <= 1000 && Solved === "Solved") return "🧠 Beats 100% of submissions. Genius alert!";
                                if (TotalTime <= 2000 && Solved === "Solved") return "🚀 Solid run! You've outperformed most developers.";
                                if (TotalTime <= 4000 && Solved === "Solved") return "🛠️ Good job! There's still room for optimization.";

                              })()}
                            </div>
                          </div>


                          {/* Verdict List */}
                          <div className="d-flex flex-wrap gap-3">
                            {verdicts.map((v, idx) => (
                              <div
                                key={idx}
                                className="border rounded p-2 bg-light text-center"
                                style={{ minWidth: '130px' }}
                              >
                                <strong style={{ color: 'yellowgreen' }}>Test Case {v.testCase}</strong>
                                <div
                                  className={
                                    v.verdict.includes("Passed")
                                      ? "text-success"
                                      : "text-danger fw-bold"
                                  }
                                >
                                  {v.verdict}
                                </div>

                                {!v.verdict.includes("Passed") && (
                                  <div className="mt-2 text-start small">
                                    <div>
                                      <strong style={{ color: 'black' }}>Expected:</strong> <pre style={{ color: 'black' }}>{v.expected}</pre>
                                    </div>
                                    <div>
                                      <strong style={{ color: 'black' }}>Actual:</strong> <pre style={{ color: 'black' }}>{v.actual}</pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>

  );
};

export default Solve;
