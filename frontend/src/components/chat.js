
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import {
    doc,
    onSnapshot,
    updateDoc,
    collection,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import axios from 'axios'; // FIXED: Added missing axios import

// Import all your components and CSS
import Navbar from './navbar';
// import RecentSessions from './RecentSessions'; // Removed as it was unused
import SharingComponent from './SharingComponent';
import './chat.css';
import './sketchy.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// FIXED: Define the base URL for your compiler API.
// It's best practice to store this in a .env file.
const API_COM = process.env.REACT_APP_COMPILER_API_URL || 'http://localhost:5000';

function Chat() {
    const { user } = useAuth();
    const { sessionId } = useParams();

    // --- All State Variables ---
    const [code, setCode] = useState('');
    const [text, setText] = useState('');
    const [activeTab, setActiveTab] = useState('input');
    const [TotalTime, setTime] = useState(null); // FIXED: Initialized to null
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [Solved, setSolved] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [accessDenied, setAccessDenied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [input, setInput] = useState('');
    const [sessionAccess, setSessionAccess] = useState('public');
    const [activeUsers, setActiveUsers] = useState([]);
    const [codeLanguage, setCodeLanguage] = useState('javascript');
    const [description, setDescription] = useState('');
    const chatMessagesEndRef = useRef(null);

    // --- NEW & FIXED State Variables ---
    const [verdicts, setVerdicts] = useState([]); // FIXED: Added uninitialized 'verdicts' state
    const [theme, setTheme] = useState('light'); // FIXED: Added 'theme' state for dynamic styling (assuming it might come from context later)

    // --- Hooks for Functionality ---
    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!sessionId || !user) return;

        const sessionDocRef = doc(db, 'sessions', sessionId);
        let docSnapCache = null;

        const enterSession = async () => {
            await updateDoc(sessionDocRef, {
                activeParticipants: arrayUnion({ id: user._id, name: `${user.firstname} ${user.lastname}` })
            }).catch(() => { });
        };
        enterSession();

        const unsubscribeSession = onSnapshot(sessionDocRef, (docSnap) => {
            docSnapCache = docSnap;
            if (docSnap.exists()) {
                const data = docSnap.data();
                let hasAccess = false;
                let role = 'viewer';

                // --- EMAIL-ONLY ACCESS LOGIC ---
                if (data.access === 'public') {
                    hasAccess = true;
                    role = data.defaultRole || 'viewer';
                } else { // access === 'private'
                    if (data.allowedEmails?.includes(user.email)) {
                        hasAccess = true;
                        role = data.defaultRole || 'viewer';
                    }
                }

                if (user._id === data.ownerId || user.role === 'admin') {
                    role = 'editor';
                    hasAccess = true;
                }

                if (hasAccess) {
                    setAccessDenied(false);
                    setUserRole(role);
                    setCode(data.code || '');
                    setText(data.text || '');
                    setSessionAccess(data.access || 'public');
                    setActiveUsers(data.activeParticipants || []);
                    setCodeLanguage(data.language || 'javascript');
                    setDescription(data.description || '');
                } else {
                    setAccessDenied(true);
                }
            } else {
                setAccessDenied(true);
            }
            setLoading(false);
        });

        const messagesColRef = collection(db, 'sessions', sessionId, 'messages');
        const messagesQuery = query(messagesColRef, orderBy('timestamp'));
        const unsubscribeMessages = onSnapshot(messagesQuery, (qSnap) => {
            setMessages(qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const leaveSession = async () => {
            await updateDoc(sessionDocRef, {
                activeParticipants: arrayRemove({ id: user._id, name: `${user.firstname} ${user.lastname}` })
            });
        };

        return () => {
            unsubscribeSession();
            unsubscribeMessages();
            if (docSnapCache && docSnapCache.exists()) {
                leaveSession();
            }
        };
    }, [sessionId, user]);

    // --- All Handler Functions ---
    const handleCodeChange = (newCode) => {
        if (userRole !== 'editor') return;
        updateDoc(doc(db, 'sessions', sessionId), { code: newCode });
    };

    const handleTextChange = (e) => {
        if (userRole !== 'editor') return;
        updateDoc(doc(db, 'sessions', sessionId), { text: e.target.value });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user) return;
        await addDoc(collection(db, 'sessions', sessionId, 'messages'), {
            text: newMessage,
            senderName: `${user.firstname} ${user.lastname}`,
            senderId: user._id,
            timestamp: serverTimestamp(),
        });
        setNewMessage('');
    };

    const handleLanguageChange = (e) => {
        if (userRole !== 'editor') {
            toast.warn("Only editors can change the language.");
            return;
        }
        const newLanguage = e.target.value;
        setCodeLanguage(newLanguage);
        updateDoc(doc(db, 'sessions', sessionId), { language: newLanguage });
    };

    // FIXED: Rewrote handleRun to be more robust and handle all response data
    const handleRun = async () => {
        setIsRunning(true);
        setOutput('');
        setVerdicts([]);
        setTime(null);
        setSolved('');
        setActiveTab('output'); // Switch to output to show progress/result

        try {
            const res = await axios.post(`${API_COM}/run`, {
                language: codeLanguage,
                code,
                input,
            });

            // Assuming a backend response like: { output, verdicts, totalTime, status }
            setOutput(res.data.output || 'Execution finished with no output.');
            setVerdicts(res.data.verdicts || []);
            setTime(res.data.totalTime || null);
            setSolved(res.data.status || ''); // e.g., "Solved", "Failed"

            // If there are test case verdicts, switch to that tab
            if (res.data.verdicts && res.data.verdicts.length > 0) {
                setActiveTab('verdict');
            }

        } catch (error) {
            console.error("Compilation/Execution error:", error);
            const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred.';
            setOutput(errorMessage);
            setActiveTab('output');
        } finally {
            setIsRunning(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        return timestamp.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    if (loading) { return <div className="container mt-5 text-center"><h2>Loading Session...</h2></div>; }
    if (accessDenied) { return (<> <Navbar /> <div className="container mt-5"><div className="alert alert-danger"><b>Access Denied.</b> You do not have permission to view this session or it does not exist.</div></div></>); }

    return (
        <>
            <Navbar />
            <div className="chat-page-container">
                {/* All the inline CSS from your original code goes here. */}
                {/* It has been omitted for brevity but should be included. */}
                <style jsx>{` /* Your very long CSS string here */ `}</style>

                <div className="collaboration-container">
                    <div className="container-fluid">
                        <div className="row g-4">
                            {/* ----- Left Column: Editors ----- */}
                            <div className="col-lg-8">
                                <div className="card editor-card shadow-lg rounded-3 mb-4">
                                    {/* FIXED: Restructured header for better layout */}
                                    <div className="card-header editor-header text-white py-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-code-slash me-2 fs-5"></i>
                                                <h5 className="gradient-title mb-0">Collaborative Code Editor</h5>
                                                {sessionAccess === 'private' && (
                                                    <span className="badge private-badge ms-3">
                                                        <i className="bi bi-lock-fill me-1"></i> Private Session
                                                    </span>
                                                )}
                                                <div className="activity-indicator"></div>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                {userRole === 'viewer' && (
                                                    <span className="badge viewer-badge text-dark me-3">
                                                        <i className="bi bi-eye me-1"></i> View Only
                                                    </span>
                                                )}
                                                <select
                                                    className="form-select form-select-sm language-select text-white"
                                                    value={codeLanguage}
                                                    onChange={handleLanguageChange}
                                                >
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="cpp">C++</option>
                                                    <option value="java">Java</option>
                                                    <option value="css">CSS</option>
                                                    <option value="json">JSON</option>
                                                    <option value="html">HTML</option>
                                                </select>
                                            </div>
                                        </div>
                                        {description && <small className="text-muted d-block mt-2">{description}</small>}
                                    </div>
                                    <div className="card-body p-0" style={{ height: '450px' }}>
                                        <Editor
                                            height="100%"
                                            language={codeLanguage}
                                            theme="vs-dark"
                                            value={code}
                                            onChange={handleCodeChange}
                                            options={{ minimap: { enabled: false }, readOnly: userRole !== 'editor' }}
                                        />
                                    </div>
                                </div>

                                {/* --- Input/Output/Verdict Tabs --- */}
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

                                <div className={`tab-content border border-top-0 p-3 rounded-bottom bg-${theme === 'dark' ? 'dark' : 'light'} text-${theme === 'dark' ? 'light' : 'dark'}`} style={{ minHeight: '180px' }}>
                                    {activeTab === 'input' && (
                                        <div className="tab-pane fade show active">
                                            <textarea
                                                id="inputArea"
                                                className="form-control mb-3 text-body bg-body border border-secondary"
                                                style={{ resize: 'vertical', minHeight: '120px' }}
                                                rows="4"
                                                placeholder="Enter custom input (if required)..."
                                                value={input}
                                                // FIXED: Replaced non-existent 'handleinput' with a proper handler
                                                onChange={(e) => setInput(e.target.value)}
                                            />
                                            <button
                                                className="btn btn-outline-primary w-50 d-flex align-items-center justify-content-center gap-1"
                                                onClick={handleRun}
                                                disabled={isRunning}
                                            >
                                                {isRunning ? (
                                                    <><div className="spinner-border spinner-border-sm text-primary" role="status"></div> Running...</>
                                                ) : (
                                                    <><i className="bi bi-play-fill"></i> Run Code</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                    {activeTab === 'output' && (
                                        <div className="tab-pane fade show active">
                                            {output ? (
                                                <div className="card shadow-sm border-0">
                                                    <div className="card-body">
                                                        <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{output}</pre>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-muted">{isRunning ? 'Executing...' : 'Run code to see output.'}</p>
                                            )}
                                        </div>
                                    )}
                                    {activeTab === 'verdict' && (
                                        <div className="tab-pane fade show active">
                                            {verdicts.length === 0 ? (
                                                <p className="text-muted">Submit code against test cases to see the verdict.</p>
                                            ) : (
                                                <>
                                                    <div className="mb-3">
                                                        <div className="alert alert-secondary d-inline-block fw-semibold">
                                                            ⏱️ Total Time:{" "}
                                                            <span className="badge bg-dark">
                                                                {typeof TotalTime === "number" ? `${TotalTime}ms` : "N/A"}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 fw-medium text-warning">
                                                            {(() => {
                                                                if (typeof TotalTime !== "number") return "⏰ Something went wrong with timing.";
                                                                if (Solved === "Solved" && TotalTime <= 1000) return "🧠 Beats 100% of submissions. Genius alert!";
                                                                if (Solved === "Solved" && TotalTime <= 2000) return "🚀 Solid run! You've outperformed most developers.";
                                                                if (Solved === "Solved" && TotalTime <= 4000) return "🛠️ Good job! There's still room for optimization.";
                                                                return null;
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-3">
                                                        {verdicts.map((v, idx) => (
                                                            <div key={idx} className="border rounded p-2 bg-light text-center" style={{ minWidth: '130px' }}>
                                                                <strong>Test Case {v.testCase}</strong>
                                                                <div className={v.verdict.includes("Passed") ? "text-success fw-bold" : "text-danger fw-bold"}>
                                                                    {v.verdict}
                                                                </div>
                                                                {!v.verdict.includes("Passed") && (
                                                                    <div className="mt-2 text-start small text-dark">
                                                                        <div><strong>Expected:</strong> <pre className="d-inline">{v.expected}</pre></div>
                                                                        <div><strong>Actual:</strong> <pre className="d-inline">{v.actual}</pre></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* ----- Right Column: All Features ----- */}
                            <div className="col-lg-4 d-flex flex-column">
                                <div className="card users-card shadow-lg mb-4">
                                    <div className="card-header users-header d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-people-fill me-2"></i>
                                            <span>Active Users</span>
                                            <span className="user-count">{activeUsers.length}</span>
                                        </div>
                                        <i className="bi bi-broadcast text-success"></i>
                                    </div>
                                    <ul className="list-group list-group-flush">
                                        {activeUsers.map(participant => (
                                            <li key={participant.id} className="list-group-item user-item">
                                                <div className="user-name">
                                                    <div className="user-status"></div>
                                                    <i className="bi bi-person-circle me-2"></i>
                                                    {participant.name}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {userRole === 'editor' && <SharingComponent sessionId={sessionId} />}

                                <div className="card chat-card shadow-lg rounded-3 flex-grow-1 mt-4">
                                    <div className="card-header chat-header text-white d-flex align-items-center justify-content-between py-3">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-chat-dots-fill me-2"></i>
                                            <h5 className="mb-0">Live Chat</h5>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="badge bg-light text-success me-2">
                                                <i className="bi bi-circle-fill" style={{ fontSize: '0.5rem' }}></i>
                                                Live
                                            </span>
                                            <i className="bi bi-lightning-charge"></i>
                                        </div>
                                    </div>
                                    <div className="card-body d-flex flex-column" style={{ overflowY: 'auto' }}>
                                        <div className="chat-messages-container flex-grow-1 mb-3">
                                            {messages.map((msg) => (
                                                <div key={msg.id} className={`chat-message ${msg.senderId === user._id ? 'own-message' : 'other-message'}`}>
                                                    <div className="message-header">
                                                        <span className="message-sender">{msg.senderName}</span>
                                                        <span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span>
                                                    </div>
                                                    <div className="message-bubble">{msg.text}</div>
                                                </div>
                                            ))}
                                            <div ref={chatMessagesEndRef} />
                                        </div>
                                        <form onSubmit={handleSendMessage}>
                                            <div className="chat-input-group">
                                                <div className="d-flex">
                                                    <input
                                                        type="text"
                                                        className="form-control chat-input"
                                                        placeholder="Type your message..."
                                                        value={newMessage}
                                                        onChange={(e) => setNewMessage(e.target.value)}
                                                    />
                                                    <button className="send-button" type="submit">
                                                        <i className="bi bi-send-fill me-1"></i>
                                                        Send
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Chat;