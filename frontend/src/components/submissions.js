import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./navbar";
import axios from "axios";
import { Tooltip } from "bootstrap";

const getTodayDate = () => {
  const today = new Date();
  return today.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
};

const Submission = () => {
  const API_URL = process.env.REACT_APP_SERVER_API;
  const { user } = useAuth();
  const { theme } = useTheme(); // Get the current theme
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("All");
  const [expandedCode, setExpandedCode] = useState(null);
  const [expandedHelp, setExpandedHelp] = useState(null);
  const [helpResponses, setHelpResponses] = useState({});
  const [loadingHelp, setLoadingHelp] = useState({});
  const [helpCount, setHelpCount] = useState(0);

  const today = getTodayDate();

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new Tooltip(el));
  }, [submissions]); // Re-initialize when submissions change

  useEffect(() => {
    const fetchHelpCount = async () => {
      if (!user?._id) return;
      const helpDocRef = doc(db, "helpCounts", `${user._id}_${today}`);
      try {
        const docSnap = await getDoc(helpDocRef);
        if (docSnap.exists()) {
          setHelpCount(docSnap.data().count || 0);
        } else {
          await setDoc(helpDocRef, { userId: user._id, date: today, count: 0 });
          setHelpCount(0);
        }
      } catch (err) {
        console.error("Error fetching help count:", err);
      }
    };
    fetchHelpCount();
  }, [user, today]);

  const updateHelpCount = async () => {
    if (!user?._id) return;
    const helpDocRef = doc(db, "helpCounts", `${user._id}_${today}`);
    try {
      const newCount = helpCount + 1;
      await updateDoc(helpDocRef, { count: newCount });
      setHelpCount(newCount);
    } catch (err) {
      console.error("Error updating help count:", err);
    }
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?._id) return;
      try {
        const q = query(collection(db, "submissions"), where("id", "==", user._id));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
        setSubmissions(data);

        const helps = {};
        for (const submission of data) {
          const helpId = `${user._id}_${submission.docId}`;
          const helpDoc = await getDoc(doc(db, "helpResponses", helpId));
          if (helpDoc.exists()) {
            helps[submission.docId] = helpDoc.data().response;
          }
        }
        setHelpResponses(helps);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };
    fetchSubmissions();
  }, [user]);

  const handleHelpRequest = async (submission) => {
    if (helpCount >= 20) {
      alert("❌ Daily help limit of 20 reached!");
      return;
    }

    setLoadingHelp(prev => ({ ...prev, [submission.docId]: true }));
    try {
      const helpId = `${user._id}_${submission.docId}`;
      const helpDocRef = doc(collection(db, "helpResponses"), helpId);
      const response = await axios.post(`${API_URL}/help`, { code: submission.code, QID: submission.QID });
      const result = response.data.result || "No suggestion returned.";

      await setDoc(helpDocRef, {
        userId: user._id,
        submissionId: submission.docId,
        response: result,
        timestamp: new Date().toISOString()
      });

      setHelpResponses(prev => ({ ...prev, [submission.docId]: result }));
      setExpandedHelp(submission.docId);
      await updateHelpCount();
    } catch (err) {
      console.error("❌ Help error:", err);
      setHelpResponses(prev => ({ ...prev, [submission.docId]: "⚠️ Error retrieving help from AI or Firestore." }));
      setExpandedHelp(submission.docId);
    } finally {
      setLoadingHelp(prev => ({ ...prev, [submission.docId]: false }));
    }
  };

  const getVerdictBadge = (verdict) => {
    const badgeClass = verdict === "Passed"
      ? `bg-success-subtle text-success-emphasis`
      : verdict === "Failed"
        ? `bg-danger-subtle text-danger-emphasis`
        : `bg-secondary-subtle text-secondary-emphasis`;
    return <span className={`badge rounded-pill ${badgeClass}`}>{verdict}</span>;
  };

  const filtered = filter === "All"
    ? submissions
    : submissions.filter(sub => sub.verdict === filter);

  const verdicts = Array.from(new Set(submissions.map(sub => sub.verdict)));

  return (
    <>
      <Navbar />
      <style>
        {`
                .theme-dark .dashboard-page { background-color: #12121c; color: #fff; }
                .theme-light .dashboard-page { background-color: #f8f9fa; color: #212529; }
                
                .theme-dark .main-container { background-color: #1e1e2f; border: 1px solid #3a3a5a; }
                .theme-light .main-container { background-color: #ffffff; border: 1px solid #dee2e6; }
                
                .theme-dark .form-select { background-color: #2c3340; color: #fff; border-color: #3a3a5a; }
                .theme-light .form-select { background-color: #fff; color: #212529; border-color: #dee2e6; }
                
                .theme-dark .submission-card { background-color: #2c3340; border-color: #3a3a5a; }
                .theme-light .submission-card { background-color: #fff; border-color: #dee2e6; }

                .theme-dark .submission-card-header { background-color: rgba(255,255,255,0.05); }
                .theme-light .submission-card-header { background-color: #f8f9fa; }
                
                .theme-dark .help-card { background-color: #1e1e2f; }
                .theme-light .help-card { background-color: #f8f9fa; }

                .gradient-text {
                    background: linear-gradient(135deg, #f12711 0%, #f5af19 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                `}
      </style>

      <div className={`dashboard-page min-vh-100 py-5 theme-${theme}`}>
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-9">
              <div className="main-container rounded-4 p-4 p-md-5 shadow-lg">
                {/* Header Section */}
                <div className="text-center mb-5">
                  <h1 className="fw-bold gradient-text">Submissions</h1>
                  <p className="text-muted fs-5 mb-0">
                    Welcome back, <span className="fw-semibold">{user?.firstname} {user?.lastname}</span>
                  </p>
                </div>

                {/* Stats & Filter Row */}
                <div className="row g-3 align-items-end mb-4">
                  <div className="col-md-6">
                    <label htmlFor="filter" className="form-label fw-semibold"><i className="bi bi-funnel me-2"></i>Filter by Status:</label>
                    <select id="filter" className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                      <option value="All">All Submissions ({submissions.length})</option>
                      {verdicts.map((v, idx) => (
                        <option key={idx} value={v}>{v} ({submissions.filter(sub => sub.verdict === v).length})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <div className="d-inline-flex align-items-center gap-2 p-2 rounded-3" style={{ border: '1px solid var(--bs-border-color)' }}>
                      <i className="bi bi-stars me-2"></i>
                      <span className="fw-semibold">AI Help Used Today: <strong>{helpCount}/20</strong></span>
                    </div>
                  </div>
                </div>

                {/* Submissions List */}
                {filtered.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                    <h5 className="mb-1">No submissions found</h5>
                    <p className="text-muted">Try adjusting your filter or submit some code first!</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {filtered.map((submission) => (
                      <div key={submission.docId} className="submission-card card shadow-sm">
                        <div className="submission-card-header card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
                          <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill">QID: {submission.QID}</span>
                            <span className="badge bg-info-subtle text-info-emphasis rounded-pill">{submission.language}</span>
                            {getVerdictBadge(submission.verdict)}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <small className="text-muted"><i className="bi bi-clock me-1"></i>{new Date(submission.submittedAt).toLocaleString()}</small>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-secondary" onClick={() => setExpandedCode(expandedCode === submission.docId ? null : submission.docId)}>
                                <i className={`bi bi-code-slash me-1`}></i>{expandedCode === submission.docId ? "Hide Code" : "View Code"}
                              </button>
                              <button
                                className="btn btn-outline-primary"
                                disabled={loadingHelp[submission.docId]}
                                onClick={() => handleHelpRequest(submission)}
                              >
                                {loadingHelp[submission.docId] ?
                                  <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Loading</> :
                                  <><i className="bi bi-magic me-1"></i>Randoman AI</>
                                }
                              </button>
                              {helpResponses[submission.docId] && (
                                <button className="btn btn-outline-info" onClick={() => setExpandedHelp(expandedHelp === submission.docId ? null : submission.docId)}>
                                  <i className={`bi bi-chat-left-text-fill me-1`}></i>{expandedHelp === submission.docId ? "Hide Help" : "Show Help"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Code Section */}
                        {expandedCode === submission.docId && (
                          <div className="card-body p-0">
                            <SyntaxHighlighter language={submission.language === 'py' ? 'python' : submission.language} style={theme === 'dark' ? oneDark : oneLight} showLineNumbers={true} customStyle={{ margin: 0, borderRadius: '0 0 0.375rem 0.375rem' }}>
                              {submission.code || "// No code submitted."}
                            </SyntaxHighlighter>
                          </div>
                        )}

                        {/* Help Response Section */}
                        {expandedHelp === submission.docId && helpResponses[submission.docId] && (
                          <div className="card-footer">
                            <div className="help-card card">
                              <div className="card-header bg-transparent border-0 d-flex align-items-center gap-2">
                                <i className="bi bi-robot text-primary"></i>
                                <h6 className="mb-0 fw-semibold">Randoman AI Feedback</h6>
                              </div>
                              <div className="card-body">
                                <ReactMarkdown
                                  children={helpResponses[submission.docId]}
                                  components={{
                                    code({ node, inline, className, children, ...props }) {
                                      const match = /language-(\w+)/.exec(className || "");
                                      return !inline && match ? (
                                        <SyntaxHighlighter style={theme === 'dark' ? oneDark : oneLight} language={match[1]} PreTag="div" {...props}>
                                          {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlighter>
                                      ) : (
                                        <code className={`${className} bg-secondary-subtle p-1 rounded`} {...props}>{children}</code>
                                      );
                                    },
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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

export default Submission;