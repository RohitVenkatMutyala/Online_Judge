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
        console.log("TotalTime:", data.totalTimeMs);

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
          setSolved(solvedStatus);
          await axios.post(`${API_URL}/rd`, {
            status: solvedStatus,
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
      <>
        <Navbar />
        <div className="container mt-5">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading problem...</p>
          </div>
        </div>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 300px;
          }
          
          .loading-spinner {
            width: 3rem;
            height: 3rem;
            border: 0.3rem solid rgba(17, 153, 142, 0.2);
            border-top: 0.3rem solid #11998e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .loading-text {
            color: #11998e;
            font-weight: 600;
            font-size: 1.1rem;
          }
        `}</style>
      </>
    );
  }

  if (!user || user.role === 'admin') {
    return (
      <>
        <Navbar />
        <div className="container mt-5">
          <div className="alert alert-danger text-center shadow-sm border-0 rounded-4">
            {user ? 'Admins cannot solve problems.' : 'Unauthorized'}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Enhanced Styles */}
      <style jsx>{`
        .solve-container {
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.02), rgba(56, 239, 125, 0.02));
          min-height: calc(100vh - 80px);
        }
        
        .problem-card {
          border: none;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
          backdrop-filter: blur(10px);
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
          background: linear-gradient(90deg, #11998e, #38ef7d);
        }
        
        .qid-text {
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
        
        .problem-title {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
        
        .problem-badge {
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .tag-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }
        
        .difficulty-badge {
          background: linear-gradient(135deg, #ff9500, #ffb400);
          color: white;
        }
        
        .editor-container {
          border: none;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .language-select {
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1));
          border: 2px solid transparent;
          background-image: linear-gradient(white, white), linear-gradient(135deg, #11998e, #38ef7d);
          background-origin: border-box;
          background-clip: content-box, border-box;
          border-radius: 12px;
          padding: 0.75rem;
          font-weight: 600;
          color: #11998e;
        }
        
        .language-select:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(17, 153, 142, 0.2);
        }
        
        .editor-header {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          color: white;
          padding: 1rem;
          font-weight: 600;
          border-radius: 20px 20px 0 0;
        }
        
        .custom-tabs {
          border: none;
          background: transparent;
          border-radius: 16px 16px 0 0;
          overflow: hidden;
        }
        
        .custom-tab {
          background: rgba(17, 153, 142, 0.1);
          border: none;
          color: #11998e;
          padding: 1rem 1.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
          border-radius: 16px 16px 0 0;
          margin-right: 2px;
        }
        
        .custom-tab.active {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
        }
        
        .custom-tab:hover {
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.2), rgba(56, 239, 125, 0.2));
        }
        
        .tab-content-container {
          border-radius: 0 16px 16px 16px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border: 2px solid rgba(17, 153, 142, 0.1);
          min-height: 200px;
        }
        
        .input-label {
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 1rem;
        }
        
        .custom-textarea {
          border: 2px solid rgba(17, 153, 142, 0.2);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.3s ease;
          resize: vertical;
          min-height: 120px;
        }
        
        .custom-textarea:focus {
          outline: none;
          border-color: #11998e;
          box-shadow: 0 0 0 4px rgba(17, 153, 142, 0.1);
        }
        
        .btn-run {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          border: none;
          color: white;
          padding: 0.8rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);
        }
        
        .btn-run:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(17, 153, 142, 0.4);
          color: white;
        }
        
        .btn-run:disabled {
          opacity: 0.7;
          transform: none;
        }
        
        .btn-submit {
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          border: none;
          color: white;
          padding: 0.8rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(255, 65, 108, 0.3);
        }
        
        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 65, 108, 0.4);
          color: white;
        }
        
        .btn-submit:disabled {
          opacity: 0.7;
          transform: none;
        }
        
        .output-card {
          border: none;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .output-header {
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          padding: 1rem;
          font-weight: 700;
          text-align: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .verdict-card {
          border: none;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .verdict-header {
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          padding: 1rem;
          font-weight: 700;
          text-align: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .time-badge {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-weight: 600;
          display: inline-block;
        }
        
        .performance-quote {
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1));
          border-left: 4px solid #ffc107;
          padding: 1rem;
          border-radius: 12px;
          color: #f57c00;
          font-weight: 600;
          font-style: italic;
        }
        
        .test-case-card {
          border: 2px solid rgba(17, 153, 142, 0.2);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.3s ease;
          min-width: 140px;
        }
        
        .test-case-card.passed {
          border-color: #38a169;
          background: rgba(56, 161, 105, 0.1);
        }
        
        .test-case-card.failed {
          border-color: #e53e3e;
          background: rgba(229, 62, 62, 0.1);
        }
        
        .test-case-title {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
        
        /* Dark theme styles */
        [data-bs-theme="dark"] .problem-card {
          background: linear-gradient(145deg, rgba(26, 32, 44, 0.95), rgba(45, 55, 72, 0.9));
        }
        
        [data-bs-theme="dark"] .tab-content-container {
          background: #1a202c;
          color: #e2e8f0;
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        [data-bs-theme="dark"] .custom-textarea {
          background: #2d3748;
          color: #e2e8f0;
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        [data-bs-theme="dark"] .output-card,
        [data-bs-theme="dark"] .verdict-card {
          background: #1a202c;
          color: #e2e8f0;
        }
      `}</style>
      
      <div className="solve-container">
        <div className="container-fluid px-4 py-4">
          <div className="row g-4">
            {/* Problem Section */}
            <div className="col-lg-6">
              <div className="problem-card">
                <div className="card-body p-4">
                  <div className="qid-text mb-2">{`QID ('_') ${problem.QID}`}</div>
                  <h2 className="problem-title mb-3">{problem.name}</h2>
                  
                  <div className="mb-4">
                    <span className="problem-badge tag-badge me-2">
                      {problem.tag}
                    </span>
                    <span className="problem-badge difficulty-badge">
                      {problem.difficulty}
                    </span>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <div className="fs-6 text-body" style={{ whiteSpace: 'pre-wrap' }}>
                    <ReactMarkdown>
                      {problem.description}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor and Tab Section */}
            <div className="col-lg-6">
              {/* Language Select */}
              <div className="mb-3">
                <label htmlFor="languageSelect" className="form-label fw-bold mb-2">Select Language:</label>
                <select
                  id="languageSelect"
                  className="form-select language-select"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value="cpp">C++</option>
                  <option value="py">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>

              {/* Editor */}
              <div className="editor-container mb-3">
                <div className="editor-header">
                  💻 Code Editor
                </div>
                <div className="p-0">
                  <Editor
                    height="460px"
                    language={
                      language === 'cpp' ? 'cpp' :
                      language === 'py' ? 'python' :
                      language === 'java' ? 'java' : 'cpp'
                    }
                    value={code}
                    theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                    onChange={handleCodeChange}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      tabSize: 2,
                      automaticLayout: true,
                      fontFamily: 'Fira Code, Monaco, Consolas, monospace',
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </div>

              {/* Custom Tabs */}
              <ul className="nav custom-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link custom-tab ${activeTab === 'input' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('input')}
                  >
                    📝 Input
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link custom-tab ${activeTab === 'output' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('output')}
                  >
                    📊 Output
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link custom-tab ${activeTab === 'verdict' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('verdict')}
                  >
                    🏆 Verdict
                  </button>
                </li>
              </ul>

              {/* Tab Contents */}
              <div className={`tab-content-container p-4`}>
                {activeTab === 'input' && (
                  <div className="tab-pane fade show active">
                    <label htmlFor="inputArea" className="form-label input-label mb-3">
                      Custom Input:
                    </label>

                    <textarea
                      id="inputArea"
                      className="form-control custom-textarea mb-4"
                      placeholder="Enter custom input (if required)..."
                      value={input || ''}
                      onChange={handleinput}
                    />

                    <div className="d-flex gap-3">
                      <button
                        className="btn-run flex-fill d-flex align-items-center justify-content-center gap-2"
                        onClick={handleRun}
                        disabled={isRunning}
                      >
                        {isRunning ? (
                          <>
                            <div className="spinner-border spinner-border-sm" role="status"></div>
                            Running...
                          </>
                        ) : (
                          <>
                            ▶️ Run Code
                          </>
                        )}
                      </button>

                      <button
                        className="btn-submit flex-fill d-flex align-items-center justify-content-center gap-2"
                        onClick={handlesubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="spinner-border spinner-border-sm" role="status"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            🚀 Submit Code
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'output' && (
                  <div className="tab-pane fade show active">
                    {output ? (
                      <div className="output-card">
                        <div className="output-header">
                          📊 Output
                        </div>
                        <div className="card-body">
                          <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{output}</pre>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>💻</div>
                        <p className="text-muted">Run code to see output here</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'verdict' && (
                  <div className="tab-pane fade show active">
                    <div className="verdict-card">
                      <div className="verdict-header">
                        🏆 Verdict
                      </div>

                      <div className="card-body">
                        {verdicts.length === 0 ? (
                          <div className="text-center py-5">
                            <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>⚖️</div>
                            <p className="text-muted">Submit code to see verdict here</p>
                          </div>
                        ) : (
                          <>
                            {/* Time & Performance */}
                            <div className="mb-4">
                              <div className="mb-3">
                                <span className="me-2">⏱️ Total Time:</span>
                                <span className="time-badge">
                                  {typeof TotalTime === "number" ? `${TotalTime}ms` : "N/A"}
                                </span>
                              </div>

                              <div className="performance-quote">
                                {(() => {
                                  if (typeof TotalTime !== "number") return "⏰ Looks like something went wrong.";
                                  if (TotalTime <= 1000 && Solved === "Solved") return "🧠 Beats 100% of submissions. Genius alert!";
                                  if (TotalTime <= 2000 && Solved === "Solved") return "🚀 Solid run! You've outperformed most developers.";
                                  if (TotalTime <= 4000 && Solved === "Solved") return "🛠️ Good job! There's still room for optimization.";
                                  return "Keep practicing to improve your performance!";
                                })()}
                              </div>
                            </div>

                            {/* Test Cases */}
                            <div className="d-flex flex-wrap gap-3">
                              {verdicts.map((v, idx) => (
                                <div
                                  key={idx}
                                  className={`test-case-card ${v.verdict.includes("Passed") ? 'passed' : 'failed'}`}
                                >
                                  <div className="test-case-title mb-2">Test Case {v.testCase}</div>
                                  <div className={v.verdict.includes("Passed") ? "text-success fw-bold" : "text-danger fw-bold"}>
                                    {v.verdict}
                                  </div>

                                  {!v.verdict.includes("Passed") && (
                                    <div className="mt-3 text-start small">
                                      <div className="mb-2">
                                        <strong>Expected:</strong>
                                        <pre className="mt-1 p-2 bg-light rounded">{v.expected}</pre>
                                      </div>
                                      <div>
                                        <strong>Actual:</strong>
                                        <pre className="mt-1 p-2 bg-light rounded">{v.actual}</pre>
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
      </div>
    </>
  );
};

export default Solve;