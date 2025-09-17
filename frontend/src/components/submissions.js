import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
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
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [helpExpanded, setHelpExpanded] = useState(null);
  const [helpResponses, setHelpResponses] = useState({});
  const [loadingHelp, setLoadingHelp] = useState({});
  const [helpCount, setHelpCount] = useState(0);

  const today = getTodayDate();
  const helpDocRef = doc(db, "helpCounts", `${user?._id}_${today}`);
  const helpResponsesRef = collection(db, "helpResponses");

  // 🔽 Fetch daily help count from Firestore
  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new Tooltip(el));
  }, []);
  useEffect(() => {
    const fetchHelpCount = async () => {
      if (!user?._id) return;
      try {
        const docSnap = await getDoc(helpDocRef);
        if (docSnap.exists()) {
          setHelpCount(docSnap.data().count || 0);
        } else {
          await setDoc(helpDocRef, {
            userId: user._id,
            date: today,
            count: 0,
          });
          setHelpCount(0);
        }
      } catch (err) {
        console.error("Error fetching help count:", err);
      }
    };
    fetchHelpCount();
  }, [user, helpDocRef, today]);

  // 🔼 Update help count in Firestore
  const updateHelpCount = async () => {
    try {
      const newCount = helpCount + 1;
      await updateDoc(helpDocRef, { count: newCount });
      setHelpCount(newCount);
    } catch (err) {
      console.error("Error updating help count:", err);
    }
  };

  // 🔁 Fetch user submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const q = query(collection(db, "submissions"), where("id", "==", user._id));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }));
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

    if (user?._id) fetchSubmissions();
  }, [user]);

  // 💬 Handle help request
  const handleHelpRequest = async (code, index) => {
    if (helpCount >= 20) {
      alert("❌ Daily help limit of 20 reached!");
      return;
    }

    try {
      setLoadingHelp(prev => ({ ...prev, [index]: true }));
      setHelpResponses(prev => ({ ...prev, [index]: "Checking saved help..." }));

      const helpId = `${user._id}_${submissions[index].docId}`;
      const helpDoc = await getDoc(doc(helpResponsesRef, helpId));

      if (helpDoc.exists()) {
        const saved = helpDoc.data().response;
        setHelpResponses(prev => ({ ...prev, [index]: saved }));
        setHelpExpanded(index);
      } else {
        const QID = submissions[index].QID;
        const response = await axios.post(`${API_URL}/help`, { code, QID });
        const result = response.data.result || "No suggestion returned.";

        await setDoc(doc(helpResponsesRef, helpId), {
          userId: user._id,
          submissionId: submissions[index].docId,
          response: result,
          timestamp: new Date().toISOString()
        });

        setHelpResponses(prev => ({ ...prev, [index]: result }));
        setHelpExpanded(index);
        await updateHelpCount();
      }
    } catch (err) {
      console.error("❌ Help error:", err);
      setHelpResponses(prev => ({
        ...prev,
        [index]: "⚠️ Error retrieving help from AI or Firestore."
      }));
      setHelpExpanded(index);
    } finally {
      setLoadingHelp(prev => ({ ...prev, [index]: false }));
    }
  };

  const getVerdictBadge = (verdict) => {
    const badgeClass = verdict === "Passed"
      ? "badge bg-success"
      : verdict === "Failed"
        ? "badge bg-danger"
        : "badge bg-secondary";
    return <span className={badgeClass}>{verdict}</span>;
  };

  const filtered = filter === "All"
    ? submissions
    : submissions.filter(sub => sub.verdict === filter);

  const verdicts = Array.from(new Set(submissions.map(sub => sub.verdict)));

  return (
    <>
      <Navbar />
      <div className="container-fluid my-4">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <div className="bg-dark rounded-4 p-4 shadow-lg">
              {/* Header Section */}
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-3"
                  style={{
                    background: "linear-gradient(to right, #ff416c, #ff4b2b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}>
                  Submissions
                </h2>
                <p className="text-muted mb-0 fs-4">
                  Welcome back, <span className="text-warning fw-semibold">{user?.firstname} {user?.lastname}</span>
                </p>
              </div>

              {/* Stats Card */}
              <div className="card border-0 mb-4"
                style={{
                  background: "linear-gradient(to right, #ff416c, #ff4b2b)",
                }}>
                <div className="card-body py-3">
                  <div className="row align-items-center text-white">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-calendar-date me-2 fs-5"></i>
                        <span className="fw-semibold">{today}</span>
                      </div>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <div className="d-flex align-items-center justify-content-md-end">
                        <i
                          className="bi bi-question-circle me-2 fs-5"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="You can use Help only 20 times a day. It resets every 24 hours."
                        ></i>
                        <span>Help Used: <strong>{helpCount}/20</strong></span>

                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Filter Section */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label htmlFor="filter" className="form-label text-light mb-2">
                    <i className="bi bi-funnel me-2"></i>Filter by Status:
                  </label>
                  <select
                    id="filter"
                    className="form-select bg-secondary text-light border-secondary"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="All">All Submissions ({submissions.length})</option>
                    {verdicts.map((v, idx) => (
                      <option key={idx} value={v}>
                        {v} ({submissions.filter(sub => sub.verdict === v).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submissions List */}
              {filtered.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                  <h5 className="text-light">No submissions found</h5>
                  <p className="text-muted">Try adjusting your filter or submit some code first!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((submission, index) => (
                    <div key={index} className="card bg-dark border-secondary mb-3 shadow-sm">
                      {/* Card Header */}
                      <div className="card-header bg-gradient border-0 p-3"
                        style={{
                          background: "linear-gradient(90deg, #2c3e50 0%, #34495e 100%)"
                        }}>
                        <div className="row align-items-center">
                          {/* Left side - Problem info */}
                          <div className="col-lg-6">
                            <div className="d-flex flex-wrap align-items-center gap-3">
                              <div className="d-flex align-items-center">
                                <span className="badge bg-primary me-2">QID: {submission.QID}</span>
                                <span className="badge bg-info text-dark">{submission.language}</span>
                              </div>
                              <div>
                                {getVerdictBadge(submission.verdict)}
                              </div>
                            </div>
                          </div>

                          {/* Right side - Timestamp and actions */}
                          <div className="col-lg-6">
                            <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2">
                              <small className="text-muted me-2">
                                <i className="bi bi-clock me-1"></i>
                                {new Date(submission.submittedAt).toLocaleString()}
                              </small>

                              {/* Action Buttons */}
                              <div className="btn-group btn-group-sm" role="group">
                                <button
                                  className="btn btn-outline-light"
                                  onClick={() => setExpanded(expanded === index ? null : index)}
                                  title="View Code"
                                >
                                  <i className="bi bi-code-slash me-1"></i>
                                  {expanded === index ? "Hide" : "Code"}
                                </button>

                                {helpResponses[submission.docId] && (
                                  <button
                                    className="btn btn-outline-info"
                                    onClick={() => {
                                      setHelpExpanded(index);
                                      setHelpResponses(prev => ({
                                        ...prev,
                                        [index]: helpResponses[submission.docId]
                                      }));
                                    }}
                                    title="View Previous Help"
                                  >
                                    <i className="bi bi-eye me-1"></i>
                                    Previous
                                  </button>
                                )}

                                <button
                                  className="btn btn-outline-warning"
                                  disabled={loadingHelp[index] || helpCount >= 20}
                                  onClick={() => handleHelpRequest(submission.code, index)}
                                  title={helpCount >= 20 ? "Daily help limit reached" : "Get AI Help"}
                                >
                                  {loadingHelp[index] ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                      Loading
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-lightbulb me-1"></i>
                                      Help
                                    </>
                                  )}
                                </button>

                                {helpResponses[index] && !loadingHelp[index] && (
                                  <button
                                    className="btn btn-outline-success"
                                    onClick={() => setHelpExpanded(helpExpanded === index ? null : index)}
                                    title="Toggle Help Response"
                                  >
                                    <i className="bi bi-chat-left-text me-1"></i>
                                    {helpExpanded === index ? "Hide" : "Show"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Code Section */}
                      {expanded === index && (
                        <div className="card-body p-0">
                          <div className="bg-black rounded-bottom overflow-hidden">
                            <div className="d-flex align-items-center justify-content-between bg-secondary px-3 py-2 border-bottom">
                              <small className="text-light">
                                <i className="bi bi-file-code me-1"></i>
                                {submission.language} Code
                              </small>

                            </div>
                            <pre
                              className="p-3 m-0 text-white overflow-auto"
                              style={{
                                maxHeight: '400px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                              }}
                              onClick={() => navigator.clipboard?.writeText(submission.code || "")}
                            >
                              <code>{submission.code || "// No code submitted."}</code>
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Help Response Section */}
                      {helpExpanded === index && (
                        <div className="card-body border-top">
                          <div className="bg-light rounded p-3">
                            <div className="d-flex align-items-center mb-3">

                              <h6 className="mb-0 text-dark fw-semibold">Catch The Logic ('_')</h6>
                            </div>
                            <div className="text-dark">
                              <ReactMarkdown
                                children={helpResponses[index]}
                                components={{
                                  code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    return !inline && match ? (
                                      <SyntaxHighlighter
                                        style={oneDark}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                      >
                                        {String(children).replace(/\n$/, "")}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code className={`${className} bg-light text-dark p-1 rounded`} {...props}>
                                        {children}
                                      </code>
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
    </>
  );
};

export default Submission;