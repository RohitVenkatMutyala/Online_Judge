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
      <div className="container-fluid px-4 mt-4">
        <div className="row g-4">
          {/* Problem Section */}
          <div className="col-lg-6">
            <div className="card shadow border-0 rounded-3">
              <div className="card-body">
                <h4 className="text-muted">{`QID ('_') ${problem.QID}`}</h4>
                <h4 className="mb-3 fw-semibold text-primary">{problem.name}</h4>
                <p>
                  <span className="badge text-white me-2" style={{ backgroundColor: '#a259ff' }}>
                    {problem.tag}
                  </span>

                  <span className="badge text-dark me-2" style={{ backgroundColor: '#ffb000' }}>
                    {problem.difficulty}
                  </span>


                </p>
                <hr />
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
                      className="btn btn-success w-50 d-flex align-items-center justify-content-center gap-1"
                      onClick={handlesubmit}
                      style={{
                        background: 'linear-gradient(to right, #f12711, #f5af19)',

                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner-border spinner-border-sm text-light" role="status"></div>
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
