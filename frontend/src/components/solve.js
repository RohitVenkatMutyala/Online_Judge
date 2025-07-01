import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import Navbar from './navbar';

const Solve = () => {
  const { QID } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [input, setInput] = useState('');
  const [code, setCode] = useState(`#include <iostream>

int main() {
  std::cout << "Hello, World!" << std::endl;
  return 0;
}`);
  const [language, setLanguage] = useState('cpp');
  const [output, setOutput] = useState('');
  
  const [activeTab, setActiveTab] = useState('input');

  // Load code, language, input from localStorage
  useEffect(() => {
    if (user && QID) {
      const savedCode = localStorage.getItem(`code-${QID}`);
      const savedLang = localStorage.getItem(`lang-${QID}`);
      const savedInput = localStorage.getItem(`input-${QID}`);
      if (savedCode) setCode(savedCode);
      if (savedLang) setLanguage(savedLang);
      if (savedInput) setInput(savedInput);
    }
  }, [QID, user]);

  // Fetch problem
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/problem/${QID}`);
        setProblem(res.data.problem);
      } catch (err) {
        console.error('Error loading problem:', err);
      }
    };
    fetchProblem();
  }, [QID]);

  const handleCodeChange = (newValue) => {
    setCode(newValue);
    if (user) {
      localStorage.setItem(`code-${QID}`, newValue);
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (user) {
      localStorage.setItem(`lang-${QID}`, newLang);
    }
  };

  const handleinput = (e) => {
    setInput(e.target.value);
    if (user) {
      localStorage.setItem(`input-${QID}`, e.target.value);
    }
  };

  const handleRun = async () => {
    try {
      const res = await axios.post('http://localhost:9000/run', {
        language,
        code,
        input,
      });
      setOutput(res.data.output || res.data.error || 'No output');
      setActiveTab('output');
    } catch (error) {
      console.error("Compilation/Execution error:", error);
      if (error.response && error.response.data) {
        setOutput(error.response.data.error);
      } else {
        setOutput('Something went wrong!');
      }
      setActiveTab('output');
    }
  };

  if (!problem) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">Loading...</div>
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
      <div className="container-fluid px-4 mt-4">
        <div className="row g-3">
          {/* Problem Section */}
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="mb-3">{problem.name}</h4>
                <p><strong>Tag:</strong> {problem.tag}</p>
                <p><strong>Difficulty:</strong> {problem.difficulty}</p>
                <hr />
                <div style={{ whiteSpace: 'pre-wrap', color: 'black' }}>
                  {problem.description}
                </div>
              </div>
            </div>
          </div>

          {/* Editor and Tab Section */}
          <div className="col-lg-6">
            {/* Language Select */}
            <div className="mb-3">
              <label htmlFor="languageSelect" className="form-label"><strong>Select Language:</strong></label>
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
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-dark text-white py-2">Code Editor</div>
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
            <ul className="nav nav-tabs">
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
            <div className="tab-content border border-top-0 p-3" style={{ minHeight: '150px' }}>
              {activeTab === 'input' && (
                <div className="tab-pane fade show active">
                  <label htmlFor="inputArea" className="form-label"><strong>Custom Input:</strong></label>
                  <textarea
                    id="inputArea"
                    className="form-control"
                    rows="4"
                    placeholder="Enter custom input (if required)..."
                    value={input || ''}
                    onChange={handleinput}
                  />
                
                  <button className="btn btn-primary mt-3  me-5"    onClick={handleRun}>
                    Run Code
                  </button>
                                <button className="btn btn-primary mt-3 " >
                    Submit Code
                  </button>
                
                </div>
              )}

              {activeTab === 'output' && (
                <div className="tab-pane fade show active">
                  {output ? (
                    <div className="card shadow-sm">
                      <div className="card-header bg-success text-white py-2">Output</div>
                      <div className="card-body">
                        <pre style={{ margin: 0 }}>{output}</pre>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted">Run code to see output.</p>
                  )}
                </div>
              )}

              {activeTab === 'verdict' && (
                <div className="tab-pane fade show active">
                  <div className="card shadow-sm">
                    <div className="card-header bg-info text-white py-2">Verdict</div>
                    <div className="card-body">
                      <pre style={{ margin: 0 }}>Verdict will appear here (e.g., Accepted, Wrong Answer, TLE).</pre>
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
