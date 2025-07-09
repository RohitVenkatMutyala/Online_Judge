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
  const [Solved,setSolved] = useState('');
  const [input, setInput] = useState('');
  const [code, setCode] = useState(`#include <iostream>

int main() {
  std::cout << "Hello, World!" << std::endl;
  return 0;
}`);
  const [language, setLanguage] = useState('cpp');
  const [output, setOutput] = useState('');
const [verdicts, setVerdicts] = useState([]);

  const[inputtest,setInputTest] =useState('');
  const[outputtest,setOutputTest]=useState('');
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
const handlesubmit = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/test/${QID}`);
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

      const compilerresponse = await axios.post('http://localhost:9000/submit', {
        language,
        code,
        input: val,
        expectedOutput: outval
      });

      const data = compilerresponse.data;
      console.log("Passed:", data.passed, "Total:", data.total);
     
      console.log(Solved);
      setVerdicts(data.verdicts);
      if(data.success){
      setActiveTab('verdict');
      }
      else{
        setActiveTab('output');
      }
   if (data.passed === data.total) {
  const solvedStatus = "Solved";

  // Update local React state (optional, for UI)
  setSolved(solvedStatus);

  // Use local value in API call
  await axios.post("http://localhost:5000/rd", {
    status: solvedStatus, // ✅ use correct key name too
    QID,
  });
}

    } else {
      setOutput("Test case data missing.");
      setActiveTab('output');
    }
  } catch (error) {
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
    <div className="row g-4">
      {/* Problem Section */}
      <div className="col-lg-6">
        <div className="card shadow border-0 rounded-3">
          <div className="card-body">
             <large className="text-muted">{`QID${problem.QID}`}</large>
            <h4 className="mb-3 fw-semibold text-primary">{problem.name}</h4>
            <p>
              <span className="badge bg-secondary me-2">Tag: {problem.tag}</span>
              <span className="badge bg-warning text-dark me-2">Difficulty: {problem.difficulty}</span>
              <span className={`badge ${problem.status === "Solved" ? "bg-success" : "bg-info"}`}>
                {problem.status || "Not Attempted"}
              </span>
            </p>
            <hr />
            <div style={{ whiteSpace: 'pre-wrap', color: '#212529' }} className="fs-6">
              {problem.description}
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
        <div className="tab-content border border-top-0 p-3 bg-light rounded-bottom" style={{ minHeight: '180px' }}>
          {activeTab === 'input' && (
            <div className="tab-pane fade show active">
              <label htmlFor="inputArea" className="form-label fw-semibold">Custom Input:</label>
              <textarea
                id="inputArea"
                className="form-control mb-3"
                rows="4"
                placeholder="Enter custom input (if required)..."
                value={input || ''}
                onChange={handleinput}
              />

              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary w-50" onClick={handleRun}>
                  ▶️ Run Code
                </button>
                <button className="btn btn-success w-50" onClick={handlesubmit}>
                  🚀 Submit Code
                </button>
              </div>
            </div>
          )}

          {activeTab === 'output' && (
            <div className="tab-pane fade show active">
              {output ? (
                <div className="card bg-white shadow-sm border-0">
                  <div className="card-header bg-success text-white">Output</div>
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
                <div className="card-header bg-info text-white">Verdict</div>
                <div className="card-body">
                  {verdicts.length === 0 ? (
                    <p className="text-muted">Verdict will appear here.</p>
                  ) : (
                    <div className="d-flex flex-wrap gap-3">
                      {verdicts.map((v, idx) => (
                        <div key={idx} className="border rounded p-2 bg-light text-center" style={{ minWidth: '130px' }}>
                          <strong>Test Case {v.testCase}</strong>
                          <div className={v.verdict.includes("Passed") ? "text-success" : "text-danger fw-bold"}>
                            {v.verdict}
                          </div>

                          {!v.verdict.includes("Passed") && (
                            <div className="mt-2 text-start small">
                              <div><strong>Expected:</strong> <pre>{v.expected}</pre></div>
                              <div><strong>Actual:</strong> <pre>{v.actual}</pre></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
