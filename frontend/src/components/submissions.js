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

const getTodayDate = () => new Date().toISOString().slice(0, 10);

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
    const fetchHelpCount = async () => {
      if (!user?._id) return;
      try {
        const docSnap = await getDoc(helpDocRef);
        if (docSnap.exists()) {
          setHelpCount(docSnap.data().count || 0);
        } else {
          // First time use today: initialize with 0
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
        //These will for retriving the previous Help from helpResponses Collection
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

      // 🔍 Check if help response already exists for this submission
      const helpId = `${user._id}_${submissions[index].docId}`;
      const helpDoc = await getDoc(doc(helpResponsesRef, helpId));

      if (helpDoc.exists()) {
        const saved = helpDoc.data().response;
        setHelpResponses(prev => ({ ...prev, [index]: saved }));
        setHelpExpanded(index);
      } else {
        // 🧠 Request fresh help
        const response = await axios.post(`${API_URL}/help`, { code });
        const result = response.data.result || "No suggestion returned.";

        // 💾 Save to Firestore
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


  const filtered = filter === "All"
    ? submissions
    : submissions.filter(sub => sub.verdict === filter);

  const verdicts = Array.from(new Set(submissions.map(sub => sub.verdict)));

  return (
    <>
      <Navbar />
      <div className="container my-5 text-light bg-dark rounded p-4">
        <h2
          className="mb-4 text-center fw-bold"
          style={{
            background: "linear-gradient(to right, #ff416c, #ff4b2b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Submissions Done By ('_') {user?.firstname} {user?.lastname}
        </h2>

        <div className="d-flex justify-content-between align-items-center rounded p-3 shadow mb-3 fw-bold text-white"
          style={{
            background: "linear-gradient(to right,#f12711,#f5af19)",
            fontSize: "1.1rem"
          }}
        >
          <strong><span>{today}</span></strong>
          <span>Help Used Today: <strong>{helpCount}</strong> / 20</span>
        </div>


        <div className="mb-4">
          <label htmlFor="filter" className="form-label text-light"
            style={{
              background: 'linear-gradient(to right, #11998e, #38ef7d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '600'
            }}>Filter by Verdict:</label>
          <select
            id="filter"
            className="form-select bg-dark text-light border-secondary"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            {verdicts.map((v, idx) => (
              <option key={idx} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="alert alert-info text-dark bg-light">No submissions found.</div>
        ) : (
          <div className="accordion" id="submissionAccordion">
            {filtered.map((submission, index) => (
              <div className="card mb-3 bg-secondary text-light" key={index}>
                <div className="card-header d-flex flex-wrap justify-content-between align-items-center bg-dark text-light">
                  <div><strong>QID:</strong> {submission.QID}</div>
                  <div><strong>{submission.language}</strong></div>
                  <div><strong>Verdict:</strong> {submission.verdict}</div>
                  <small className="text-muted">{new Date(submission.submittedAt).toLocaleString()}</small>
                  {/* View Previous Help Button */}
                  {helpResponses[submission.docId] && (
                    <button
                      className="btn btn-sm btn-outline-info me-2"
                      onClick={() => {
                        setHelpExpanded(index);
                        setHelpResponses(prev => ({
                          ...prev,
                          [index]: helpResponses[submission.docId]
                        }));
                      }}
                    >
                      View Previous Help
                    </button>
                  )}

                  <button
                    className="btn btn-sm btn-outline-primary ms-2"
                    onClick={() => setExpanded(expanded === index ? null : index)}
                  >
                    {expanded === index ? "Hide Code" : "View Code"}
                  </button>

                  <button
                    className="btn btn-sm btn-outline-warning ms-2 d-flex align-items-center gap-2"
                    disabled={loadingHelp[index]}
                    onClick={() => handleHelpRequest(submission.code, index)}
                  >
                    {loadingHelp[index] ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Loading...
                      </>
                    ) : (
                      "Take Help"
                    )}
                  </button>
                  {helpResponses[index] && !loadingHelp[index] && (
                    <button
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={() =>
                        setHelpExpanded(helpExpanded === index ? null : index)
                      }
                    >
                      {helpExpanded === index ? "Hide Help" : "Show Help"}
                    </button>
                  )}

                </div>

                {expanded === index && (
                  <div className="card-body p-0">
                    <pre className="p-3 m-0 rounded bg-black text-white overflow-auto" style={{ maxHeight: '400px' }}>
                      <code>{submission.code || "// No code submitted."}</code>
                    </pre>
                  </div>
                )}

                {helpExpanded === index && (
                  <div className="card-body bg-light text-dark border-top">
                    <strong>Catch The Logic ('_')</strong>
                    <div className="mt-2 p-2 bg-white rounded text-dark">
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
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Submission;
