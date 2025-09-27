import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import {
    doc, onSnapshot, updateDoc, collection, addDoc, query,
    orderBy, serverTimestamp, arrayUnion, arrayRemove, deleteDoc
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import Peer from 'simple-peer';
import axios from 'axios';

import Navbar from './navbar';
import SharingComponent from './SharingComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


const API_COM = process.env.REACT_APP_COMPILER_API || 'http://localhost:5000';

function Chat() {
    const { user } = useAuth();
    const { sessionId } = useParams();

    // --- State Variables ---
    const [code, setCode] = useState('');
    const [activeTab, setActiveTab] = useState('input');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [accessDenied, setAccessDenied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [input, setInput] = useState('');
    const [sessionAccess, setSessionAccess] = useState('public');
    const [activeUsers, setActiveUsers] = useState([]);
    const [codeLanguage, setCodeLanguage] = useState('javascript');
    const [verdicts, setVerdicts] = useState([]);
    const [TotalTime, setTime] = useState(null);
    const [showAllUsers, setShowAllUsers] = useState(false);

    // --- Voice Chat State ---
    const [stream, setStream] = useState(null);
    const [muteStatus, setMuteStatus] = useState({});
    const peersRef = useRef({});
    const audioContainerRef = useRef(null);
    const chatMessagesEndRef = useRef(null);

    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Main useEffect to handle session data and user presence
    useEffect(() => {
        console.log("Debug 1: Hook started. Session ID:", sessionId, "User:", user);

        if (!sessionId) {
            console.error("Debug Fail: No Session ID found.");
            setAccessDenied(true);
            setLoading(false);
            return;
        }

        const sessionDocRef = doc(db, 'sessions', sessionId);

        const unsubscribeSession = onSnapshot(sessionDocRef, (docSnap) => {
            console.log("Debug 2: onSnapshot listener fired.");

            if (!docSnap.exists()) {
                console.error("Debug Fail: Session document does not exist.");
                setAccessDenied(true);
                setLoading(false);
                return;
            }

            const data = docSnap.data();
            console.log("Debug 3: Session data loaded. Access type:", data.access);

            if (data.access === 'private' && !user) {
                console.warn("Debug Wait: Private session, waiting for user object to load...");
                return; // Wait for user to load
            }

            const isOwner = user && data.ownerId === user._id;
            const hasAccess = data.access === 'public' || (user && data.allowedEmails?.includes(user.email)) || isOwner;

            console.log("Debug 4: Checking access. Has Access:", hasAccess);

            if (!hasAccess) {
                console.error("Debug Fail: Access Denied.");
                setAccessDenied(true);
                setLoading(false);
                return;
            }

            console.log("Debug 5: Access granted. Updating state.");

            if (user) {
                const participantExists = data.activeParticipants?.some(p => p.id === user._id);
                if (!participantExists) {
                    updateDoc(sessionDocRef, {
                        activeParticipants: arrayUnion({ id: user._id, name: `${user.firstname} ${user.lastname}` })
                    }).catch(console.error);
                }
            }

            const role = isOwner ? 'editor' : (data.defaultRole || 'viewer');
            setUserRole(role);
            setCode(data.code || '');
            setInput(data.codeInput || '');
            setSessionAccess(data.access || 'public');
            setActiveUsers(data.activeParticipants || []);
            setCodeLanguage(data.language || 'javascript');
            setMuteStatus(data.muteStatus || {});
            setVerdicts(data.lastRunVerdicts || []);
            setOutput(data.lastRunOutput || '');
            setTime(data.lastRunTime || null);

            if (data.access === 'private' && !stream) {
                navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(setStream).catch(err => toast.error("Could not access microphone."));
            }

            console.log("Debug 6: State updated. Turning off loading screen.");
            setLoading(false);
        }, (error) => {
            console.error("Debug Fail: Error in onSnapshot listener:", error);
            setAccessDenied(true);
            setLoading(false);
        });

        const messagesQuery = query(collection(db, 'sessions', sessionId, 'messages'), orderBy('timestamp'));
        const unsubscribeMessages = onSnapshot(messagesQuery, qSnap => setMessages(qSnap.docs.map(d => ({ id: d.id, ...d.data() }))));

        return () => {
            if (user) {
                updateDoc(doc(db, 'sessions', sessionId), {
                    activeParticipants: arrayRemove({ id: user._id, name: `${user.firstname} ${user.lastname}` })
                }).catch(console.error);
            }
            if (stream) { stream.getTracks().forEach(track => track.stop()); }
            Object.values(peersRef.current).forEach(peer => peer.destroy());
            unsubscribeSession();
            unsubscribeMessages();
        };
    }, [sessionId, user, stream]);

    // useEffect for WebRTC connections
    useEffect(() => {
        if (!stream || sessionAccess !== 'private' || !user) return;

        const signalingColRef = collection(db, 'sessions', sessionId, 'signaling');

        const createPeer = (recipientId, senderId, stream) => {
            const peer = new Peer({ initiator: true, trickle: false, stream });
            peer.on('signal', signal => addDoc(signalingColRef, { recipientId, senderId, signal }));
            peer.on('stream', remoteStream => {
                if (audioContainerRef.current) {
                    let audio = document.getElementById(`audio-${recipientId}`);
                    if (!audio) {
                        audio = document.createElement('audio'); audio.id = `audio-${recipientId}`;
                        audio.autoplay = true; audioContainerRef.current.appendChild(audio);
                    }
                    audio.srcObject = remoteStream;
                }
            });
            peer.on('close', () => { const audioElem = document.getElementById(`audio-${recipientId}`); if (audioElem) audioElem.remove(); });
            return peer;
        };

        const addPeer = (incoming, recipientId, stream) => {
            const peer = new Peer({ initiator: false, trickle: false, stream });
            peer.on('signal', signal => addDoc(signalingColRef, { recipientId: incoming.senderId, senderId: recipientId, signal }));
            peer.on('stream', remoteStream => {
                if (audioContainerRef.current) {
                    let audio = document.getElementById(`audio-${incoming.senderId}`);
                    if (!audio) {
                        audio = document.createElement('audio'); audio.id = `audio-${incoming.senderId}`;
                        audio.autoplay = true; audioContainerRef.current.appendChild(audio);
                    }
                    audio.srcObject = remoteStream;
                }
            });
            peer.on('close', () => { const audioElem = document.getElementById(`audio-${incoming.senderId}`); if (audioElem) audioElem.remove(); });
            peer.signal(incoming.signal);
            return peer;
        };

        activeUsers.forEach(p => { if (p.id !== user._id && !peersRef.current[p.id]) { peersRef.current[p.id] = createPeer(p.id, user._id, stream); } });
        Object.keys(peersRef.current).forEach(peerId => { if (!activeUsers.find(p => p.id === peerId)) { peersRef.current[peerId].destroy(); delete peersRef.current[peerId]; } });

        const unsubscribeSignaling = onSnapshot(query(signalingColRef), snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const data = change.doc.data();
                    if (data.recipientId === user._id) {
                        const peer = peersRef.current[data.senderId];
                        if (peer) { peer.signal(data.signal); } else { peersRef.current[data.senderId] = addPeer(data, user._id, stream); }
                        deleteDoc(change.doc.ref);
                    }
                }
            });
        });
        return () => unsubscribeSignaling();
    }, [stream, activeUsers, sessionId, user]);

    // useEffect for applying mute status to local microphone
    useEffect(() => {
        if (!stream || !user || stream.getAudioTracks().length === 0) { return; }
        const isMuted = muteStatus[user._id] ?? true;
        const audioTrack = stream.getAudioTracks()[0];
        audioTrack.enabled = !isMuted;
        Object.values(peersRef.current).forEach(peer => {
            const sender = peer._pc.getSenders().find(s => s.track?.kind === 'audio');
            if (sender) { sender.replaceTrack(audioTrack); }
        });
    }, [muteStatus, stream, user]);

    // --- Handler Functions ---

    const handleToggleMute = async (targetUserId) => {
        const isSelf = targetUserId === user._id;
        const isOwner = userRole === 'editor';
        const currentMuteState = muteStatus[targetUserId] ?? true;
        const newMuteState = !currentMuteState;
        if (isOwner) {
            await updateDoc(doc(db, 'sessions', sessionId), { [`muteStatus.${targetUserId}`]: newMuteState });
            return;
        }
        if (isSelf) {
            if (newMuteState === false) {
                toast.error("Only the session owner can unmute you.");
                return;
            }
            await updateDoc(doc(db, 'sessions', sessionId), { [`muteStatus.${targetUserId}`]: true });
        }
    };

    const handleCodeChange = (newCode) => { if (userRole === 'editor') updateDoc(doc(db, 'sessions', sessionId), { code: newCode }); };
    const handleInputChange = (e) => { const newInput = e.target.value; setInput(newInput); if (userRole === 'editor') updateDoc(doc(db, 'sessions', sessionId), { codeInput: newInput }); };
    const formatTimestamp = (timestamp) => !timestamp ? '' : timestamp.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!user || newMessage.trim() === '') return;
        await addDoc(collection(db, 'sessions', sessionId, 'messages'), { text: newMessage, senderName: `${user.firstname} ${user.lastname}`, senderId: user._id, timestamp: serverTimestamp() });
        setNewMessage('');
    };
    const handleRun = async () => {
        setIsRunning(true); setActiveTab('output');
        const apiLanguage = codeLanguage === 'python' ? 'py' : codeLanguage;
        try {
            const res = await axios.post(`${API_COM}/run`, { language: apiLanguage, code, input });
            const dataToUpdate = { lastRunOutput: res.data.output || 'Execution finished.', lastRunVerdicts: res.data.verdicts || [], lastRunTime: res.data.totalTime || null, lastRunTimestamp: serverTimestamp() };
            await updateDoc(doc(db, 'sessions', sessionId), dataToUpdate);
        } catch (error) { setOutput(error.message || 'An unexpected error occurred.'); }
        finally { setIsRunning(false); }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4>Loading Session...</h4>
                    <p className="text-muted">Please wait while we connect you.</p>
                </div>
            </div>
        );
    }

    if (accessDenied) { return <div className="container mt-5"><div className="alert alert-danger"><b>Access Denied.</b></div></div>; }
    return (
        <>
            <Navbar />
            <div className="chat-page-container">
                <style jsx>{`
                  /* --- 1. General Page & Layout Styles --- */

:root {
  --dark-bg-primary: #12121c;   /* Main page background */
  --dark-bg-secondary: #1e1e2f; /* Card and container background */
  --border-color: #3a3a5a;      /* Borders and dividers */
  --text-primary: #e0e0e0;      /* Main text color */
  --text-secondary: #a9a9b3;    /* Muted text for timestamps/subtitles */
  --accent-blue: #4a69bd;       /* Accent for user's own message bubble & active elements */
}

body {
  background-color: var(--dark-bg-primary); /* Ensure body background is dark */
}

.chat-page-container {
  background-color: var(--dark-bg-primary);
  color: var(--text-primary);
  min-height: calc(100vh - 56px);
  padding: 1.5rem 0;
}

/* --- 2. Card Component Overrides --- */

.card {
  background-color: var(--dark-bg-secondary);
  border: 1px solid var(--border-color);
}

.card-header, .card-footer {
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-primary);
}

.card-footer {
  border-top: 1px solid var(--border-color);
  border-bottom: none;
}

.list-group-item {
  background-color: transparent;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.list-group-item:last-child {
  border-bottom: none;
}

/* --- 3. I/O Tabs and Content Area (NEW) --- */

.nav-tabs {
  border-bottom: 1px solid var(--border-color);
}

.nav-tabs .nav-link {
  background-color: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  color: var(--text-primary);
}

.nav-tabs .nav-link.active {
  background-color: var(--dark-bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  border-color: var(--border-color);
  border-bottom-color: var(--dark-bg-secondary); 
}

.tab-content {
  background-color: var(--dark-bg-secondary);
  border: 1px solid var(--border-color);
  border-top: none;
  padding: 1rem;
  color: var(--text-primary);
}

.tab-content pre {
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
}

/* --- 4. Chat-Specific Styles --- */

.chat-card .card-body {
  padding: 0.5rem 1rem;
}

.chat-messages-container {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 40vh;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
}

.chat-message {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.3rem;
}

.message-sender {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.message-timestamp {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.message-bubble {
  padding: 0.6rem 1.1rem;
  border-radius: 18px;
  max-width: 85%;
  word-wrap: break-word;
  line-height: 1.4;
}

.own-message {
  align-items: flex-end;
}
.own-message .message-bubble {
  background-color: var(--accent-blue);
  color: #ffffff;
  border-top-right-radius: 4px;
}
.own-message .message-header {
    justify-content: flex-end;
}

.other-message {
  align-items: flex-start;
}
.other-message .message-bubble {
  background-color: #313147;
  color: var(--text-primary);
  border-top-left-radius: 4px;
}

/* --- 5. Form & Input Styles (Updated) --- */

/* General style for all textareas/inputs */
.form-control {
  background-color: var(--dark-bg-primary) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.form-control:focus {
  border-color: var(--accent-blue) !important;
  box-shadow: 0 0 0 0.2rem rgba(74, 105, 189, 0.25) !important;
}

.form-control::placeholder {
  color: var(--text-secondary) !important;
}

/* Specific style for chat input field */
.chat-input {
  border-radius: 20px;
  padding: 0.5rem 1rem;
}

.send-button {
  background: var(--accent-blue);
  border: none;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  transition: background-color 0.2s ease;
}

.send-button:hover {
  background-color: #5a7ccb;
}

.send-button:disabled {
  background-color: #313147;
  cursor: not-allowed;
}
                `}</style>
                <div className="row g-3 h-100">

                    {/* Left Column: Editor and I/O */}
                    <div className="col-lg-8 d-flex flex-column">
                        <div className="card shadow-sm rounded-3 mb-3">
                            <div className="card-header p-2"> {/* UI FIX: Reduced header padding */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 d-flex align-items-center fs-6">
                                        <i className="bi bi-code-slash me-2"></i>
                                        Collaborative Editor
                                        {sessionAccess === 'private' && (
                                            <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill ms-2">
                                                <i className="bi bi-lock-fill me-1"></i> Private
                                            </span>
                                        )}
                                    </h5>
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ width: 'auto' }}
                                        value={codeLanguage}
                                        onChange={(e) => userRole === 'editor' && updateDoc(doc(db, 'sessions', sessionId), { language: e.target.value })}
                                    >
                                        <option value="python">Python</option>
                                        <option value="cpp">C++</option>
                                        <option value="java">Java</option>
                                        <option value="javascript">JavaScript</option>
                                    </select>
                                </div>
                            </div>
                            <div className="card-body p-0" style={{ height: '65vh' }}>
                                <Editor
                                    height="100%"
                                    language={codeLanguage}
                                    theme="vs-dark"
                                    value={code}
                                    onChange={handleCodeChange}
                                    options={{ readOnly: userRole !== 'editor', minimap: { enabled: false } }}
                                />
                            </div>
                        </div>

                        <div className="flex-grow-1 d-flex flex-column">
                            <ul className="nav nav-tabs">
                                <li className="nav-item"><button className={`nav-link ${activeTab === 'input' ? 'active' : ''}`} onClick={() => setActiveTab('input')}>Input</button></li>
                                <li className="nav-item"><button className={`nav-link ${activeTab === 'output' ? 'active' : ''}`} onClick={() => setActiveTab('output')}>Output</button></li>
                                <li className="nav-item"><button className={`nav-link ${activeTab === 'verdict' ? 'active' : ''}`} onClick={() => setActiveTab('verdict')}>Verdict</button></li>
                            </ul>
                            <div className="tab-content border border-top-0 p-2 rounded-bottom bg-body flex-grow-1">
                                {activeTab === 'input' && (
                                    <div className="tab-pane fade show active h-100 d-flex flex-column">
                                        <textarea
                                            className="form-control mb-3 flex-grow-1"
                                            placeholder="Enter custom input..."
                                            value={input}
                                            onChange={handleInputChange}
                                        />
                                        {/* Find the "Run Code" button */}
                                        <button
                                            className="btn btn-primary btn-sm align-self-start d-flex align-items-center" // <-- Added flex classes
                                            onClick={handleRun}
                                            disabled={isRunning}
                                            style={{ width: '80px', justifyContent: 'center' }} // <-- Optional: fixed width for consistency
                                        >
                                            {isRunning ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Running
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-play-fill fs-6 me-1"></i>
                                                    Run
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                                {activeTab === 'output' && (<div className="tab-pane fade show active"><pre>{output || (isRunning ? 'Executing...' : 'Run code to see output.')}</pre></div>)}
                                {activeTab === 'verdict' && (<div className="tab-pane fade show active">{!verdicts || verdicts.length === 0 ? <p className="text-muted">No verdict yet.</p> : (<div><div className="mb-2">Total Time: {TotalTime}ms</div><div className="d-flex flex-wrap gap-3">{verdicts.map((v, idx) => <div key={idx} className={`border rounded p-2 text-center ${v.verdict.includes("Passed") ? "text-success" : "text-danger"}`}><strong>Test Case {v.testCase}</strong>: {v.verdict}</div>)}</div></div>)}</div>)}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Users, Share, Chat */}
                    <div className="col-lg-4 d-flex flex-column h-100">
                        <div className="card shadow-sm mb-3">
                            <div className="card-header d-flex justify-content-between">
                                <span>Active Users ({activeUsers.length})</span>
                                <i className="bi bi-broadcast text-success"></i>
                            </div>
                            {/* Replace the entire <ul className="list-group list-group-flush">...</ul> block with this */}

                            <ul className="list-group list-group-flush">
                                {/* Always show the first 4 users */}
                                {activeUsers.slice(0, 4).map(p => (
                                    <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span className="fw-bold">{p.name}</span>
                                        {p.id === user?._id && <span className="ms-2">(You)</span>}
                                        {sessionAccess === 'private' && stream && (
                                            <button
                                                className={`btn btn-sm ${muteStatus[p.id] ?? true ? 'text-danger' : 'text-success'}`}
                                                onClick={() => handleToggleMute(p.id)}

                                                // --- UPDATED LOGIC HERE ---
                                                // The button is disabled if:
                                                // 1. You are NOT the owner AND...
                                                // 2. It's for another user OR it's for yourself but you are ALREADY muted.
                                                disabled={userRole !== 'editor' && (p.id !== user?._id || (muteStatus[p.id] ?? true))}

                                                style={{ fontSize: '1.2rem' }}
                                            >
                                                <i className={`bi ${muteStatus[p.id] ?? true ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
                                            </button>
                                        )}
                                    </li>
                                ))}

                                {/* Conditionally show the rest of the users if the list is expanded */}
                                {showAllUsers && activeUsers.slice(4).map(p => (
                                    <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span className="fw-bold">{p.name}</span>
                                        {p.id === user?._id && <span className="ms-2">(You)</span>}
                                        {sessionAccess === 'private' && stream && (
                                            <button
                                                className={`btn btn-sm ${muteStatus[p.id] ?? true ? 'text-danger' : 'text-success'}`}
                                                onClick={() => handleToggleMute(p.id)}

                                                // --- UPDATED LOGIC HERE ---
                                                disabled={userRole !== 'editor' && (p.id !== user?._id || (muteStatus[p.id] ?? true))}

                                                style={{ fontSize: '1.2rem' }}
                                            >
                                                <i className={`bi ${muteStatus[p.id] ?? true ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {/* Add this button below the <ul> to toggle the view */}
                            {activeUsers.length > 4 && (
                                <div className="card-footer text-center p-1">
                                    <button
                                        className="btn btn-link btn-sm text-decoration-none"
                                        onClick={() => setShowAllUsers(!showAllUsers)}
                                    >
                                        {showAllUsers ? 'Show Less' : `Show ${activeUsers.length - 4} More...`}
                                    </button>
                                </div>
                            )}
                            <div ref={audioContainerRef} style={{ display: 'none' }}></div>
                        </div>

                        {userRole === 'editor' && <div className="mb-3"><SharingComponent sessionId={sessionId} /></div>}

                        <div className="card shadow-sm flex-grow-1 chat-card">
                            <div className="card-header">Live Chat</div>
                            <div className="card-body d-flex flex-column">
                                <div className="chat-messages-container">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`chat-message ${msg.senderId === user?._id ? 'own-message' : 'other-message'}`}>
                                            <div className="message-header">
                                                <span className="message-sender">{msg.senderName}</span>
                                                <span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span>
                                            </div>
                                            <div className="message-bubble">{msg.text}</div>
                                        </div>
                                    ))}
                                    <div ref={chatMessagesEndRef} />
                                </div>
                                <form onSubmit={handleSendMessage} className="chat-input-group">
                                    <div className="d-flex align-items-center">
                                        <input
                                            type="text"
                                            className="form-control chat-input"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <button className="send-button flex-shrink-0" type="submit" disabled={!newMessage.trim()}>
                                            <i className="bi bi-send-fill"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Chat;