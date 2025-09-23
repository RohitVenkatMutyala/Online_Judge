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
    arrayRemove,
    deleteDoc
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import Peer from 'simple-peer';
import axios from 'axios';

// Import all your components and CSS
import Navbar from './navbar';
import SharingComponent from './SharingComponent';
import './chat.css';
import './sketchy.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_COM = process.env.REACT_APP_COMPILER_API || 'http://localhost:5000';

function Chat() {
    const { user } = useAuth();
    const { sessionId } = useParams();

    // --- State Variables ---
    const [code, setCode] = useState('');
    const [text, setText] = useState('');
    const [activeTab, setActiveTab] = useState('input');
    const [TotalTime, setTime] = useState(null);
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
    const [verdicts, setVerdicts] = useState([]);
    const [theme, setTheme] = useState('light');

    // --- Voice Chat State ---
    const [stream, setStream] = useState(null);
    const [muteStatus, setMuteStatus] = useState({});
    const peersRef = useRef({});
    const audioContainerRef = useRef(null);
    const chatMessagesEndRef = useRef(null);

    // --- Hooks ---

    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!sessionId || !user) return;

        const sessionDocRef = doc(db, 'sessions', sessionId);

        const enterSession = async () => {
            await updateDoc(sessionDocRef, {
                activeParticipants: arrayUnion({ id: user._id, name: `${user.firstname} ${user.lastname}` })
            }).catch(console.error);
        };

        const leaveSession = async () => {
            await updateDoc(sessionDocRef, {
                activeParticipants: arrayRemove({ id: user._id, name: `${user.firstname} ${user.lastname}` })
            }).catch(console.error);
        };

        enterSession();

        const unsubscribeSession = onSnapshot(sessionDocRef, (docSnap) => {
            if (!docSnap.exists()) {
                setAccessDenied(true); setLoading(false); return;
            }

            const data = docSnap.data();
            const isOwner = data.ownerId === user._id;
            const isAdmin = user.role === 'admin';
            const hasAccess = data.access === 'public' || data.allowedEmails?.includes(user.email) || isOwner || isAdmin;

            if (!hasAccess) {
                setAccessDenied(true); setLoading(false); return;
            }

            const role = (isOwner || isAdmin) ? 'editor' : (data.defaultRole || 'viewer');

            setAccessDenied(false);
            setUserRole(role);
            setCode(data.code || '');
            setText(data.text || '');
            setInput(data.codeInput || '');
            setSessionAccess(data.access || 'public');
            setActiveUsers(data.activeParticipants || []);
            setCodeLanguage(data.language || 'javascript');
            setDescription(data.description || '');
            setMuteStatus(data.muteStatus || {});

            setOutput(data.lastRunOutput || '');
            setVerdicts(data.lastRunVerdicts || []);
            setTime(data.lastRunTime || null);
            setSolved(data.lastRunStatus || '');

            if (data.access === 'private' && !stream) {
                navigator.mediaDevices.getUserMedia({ video: false, audio: true })
                    .then(setStream)
                    .catch(err => {
                        console.error("Mic access error:", err);
                        toast.error("Could not access microphone.");
                    });
            }
            setLoading(false);
        });

        const messagesQuery = query(collection(db, 'sessions', sessionId, 'messages'), orderBy('timestamp'));
        const unsubscribeMessages = onSnapshot(messagesQuery, qSnap => {
            setMessages(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {
            leaveSession();
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            Object.values(peersRef.current).forEach(peer => peer.destroy());
            unsubscribeSession();
            unsubscribeMessages();
        };
    }, [sessionId, user]);

    useEffect(() => {
        if (!stream || sessionAccess !== 'private') return;

        const signalingColRef = collection(db, 'sessions', sessionId, 'signaling');

        const createPeer = (recipientId, senderId, stream) => {
            const peer = new Peer({ initiator: true, trickle: false, stream });
            peer.on('signal', signal => addDoc(signalingColRef, { recipientId, senderId, signal }));
            peer.on('stream', remoteStream => {
                if (audioContainerRef.current) {
                    let audio = document.getElementById(`audio-${recipientId}`);
                    if (!audio) {
                        audio = document.createElement('audio');
                        audio.id = `audio-${recipientId}`;
                        audio.autoplay = true;
                        audioContainerRef.current.appendChild(audio);
                    }
                    audio.srcObject = remoteStream;
                }
            });
            peer.on('close', () => {
                const audioElem = document.getElementById(`audio-${recipientId}`);
                if (audioElem) audioElem.remove();
            });
            return peer;
        };

        const addPeer = (incoming, recipientId, stream) => {
            const peer = new Peer({ initiator: false, trickle: false, stream });
            peer.on('signal', signal => addDoc(signalingColRef, { recipientId: incoming.senderId, senderId: recipientId, signal }));
            peer.on('stream', remoteStream => {
                if (audioContainerRef.current) {
                    let audio = document.getElementById(`audio-${incoming.senderId}`);
                    if (!audio) {
                        audio = document.createElement('audio');
                        audio.id = `audio-${incoming.senderId}`;
                        audio.autoplay = true;
                        audioContainerRef.current.appendChild(audio);
                    }
                    audio.srcObject = remoteStream;
                }
            });
            peer.on('close', () => {
                const audioElem = document.getElementById(`audio-${incoming.senderId}`);
                if (audioElem) audioElem.remove();
            });
            peer.signal(incoming.signal);
            return peer;
        };

        activeUsers.forEach(participant => {
            if (participant.id !== user._id && !peersRef.current[participant.id]) {
                peersRef.current[participant.id] = createPeer(participant.id, user._id, stream);
            }
        });

        Object.keys(peersRef.current).forEach(peerId => {
            if (!activeUsers.find(p => p.id === peerId)) {
                peersRef.current[peerId].destroy();
                delete peersRef.current[peerId];
            }
        });

        const unsubscribeSignaling = onSnapshot(query(signalingColRef), snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const data = change.doc.data();
                    if (data.recipientId === user._id) {
                        const peer = peersRef.current[data.senderId];
                        if (peer) {
                            peer.signal(data.signal);
                        } else {
                            peersRef.current[data.senderId] = addPeer(data, user._id, stream);
                        }
                        deleteDoc(change.doc.ref);
                    }
                }
            });
        });

        return () => unsubscribeSignaling();

    }, [stream, activeUsers, sessionId, user._id, sessionAccess]);

    // 4. Effect for applying mute status to your own microphone
    // 4. Effect for applying mute status to your own microphone
    useEffect(() => {
        // BUG FIX: The '!' was removed from the length check to allow the code to run.
        if (!stream || !user || stream.getAudioTracks().length === 0) {
            return;
        }
        
        const isMuted = muteStatus[user._id] ?? true;
        const audioTrack = stream.getAudioTracks()[0];
        
        // 1. Locally enable or disable the track
        audioTrack.enabled = !isMuted;

        // 2. Explicitly tell every peer connection to update the track
        Object.values(peersRef.current).forEach(peer => {
            // Added optional chaining (?.) to make this more robust
            const sender = peer._pc.getSenders().find(s => s.track?.kind === 'audio');
            if (sender) {
                sender.replaceTrack(audioTrack);
            }
        });

    }, [muteStatus, stream, user]);

    // --- Handler Functions ---
    const handleToggleMute = async (targetUserId) => {
        const isSelf = targetUserId === user._id;
        const isOwner = userRole === 'editor';
        const currentMuteState = muteStatus[targetUserId] ?? true;
        const newMuteState = !currentMuteState;

        if (isOwner) {
            await updateDoc(doc(db, 'sessions', sessionId), {
                [`muteStatus.${targetUserId}`]: newMuteState
            });
            return;
        }

        if (isSelf && !isOwner) {
            if (newMuteState === false) {
                toast.error("Only the session owner can unmute you.");
                return;
            }
            await updateDoc(doc(db, 'sessions', sessionId), {
                [`muteStatus.${targetUserId}`]: true
            });
        }
    };

    const handleCodeChange = (newCode) => {
        if (userRole === 'editor') updateDoc(doc(db, 'sessions', sessionId), { code: newCode });
    };

    const handleTextChange = (e) => {
        if (userRole === 'editor') updateDoc(doc(db, 'sessions', sessionId), { text: e.target.value });
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
        if (userRole === 'editor') {
            updateDoc(doc(db, 'sessions', sessionId), { language: e.target.value });
        } else {
            toast.warn("Only editors can change the language.");
        }
    };

    const handleInputChange = (e) => {
        const newInput = e.target.value;
        setInput(newInput);
        if (userRole === 'editor') updateDoc(doc(db, 'sessions', sessionId), { codeInput: newInput });
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        return timestamp.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const handleRun = async () => {
        setIsRunning(true);
        setActiveTab('output');
        const apiLanguage = codeLanguage === 'python' ? 'py' : codeLanguage;
        try {
            const res = await axios.post(`${API_COM}/run`, {
                language: apiLanguage,
                code,
                input,
            });
            const dataToUpdate = {
                lastRunOutput: res.data.output || 'Execution finished with no output.',
                lastRunVerdicts: res.data.verdicts || [],
                lastRunTime: res.data.totalTime || null,
                lastRunStatus: res.data.status || '',
                lastRunTimestamp: serverTimestamp()
            };
            await updateDoc(doc(db, 'sessions', sessionId), dataToUpdate);
        } catch (error) {
            console.error("An error occurred during the run process:", error);
            setOutput(error.message || 'An unexpected error occurred.');
        } finally {
            setIsRunning(false);
        }
    };

    // --- Render Logic ---

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4>Loading Session...</h4>
                </div>
            </div>
        );
    }

    if (accessDenied) {
        return (
            <>
                <Navbar />
                <div className="container mt-5">
                    <div className="alert alert-danger"><b>Access Denied.</b> You do not have permission to view this session or it does not exist.</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="chat-page-container">
                <div className="collaboration-container">
                    <div className="container-fluid">
                        <div className="row g-4">
                            <div className="col-lg-8">
                                <div className="card editor-card shadow-lg rounded-3 mb-4">
                                    <div className={`card-header ${theme === 'dark' ? 'editor-header text-white' : 'bg-light text-dark'} py-3`}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-code-slash me-2 fs-5"></i>
                                                <h5 className="mb-0">Collaborative Code Editor</h5>
                                                {sessionAccess === 'private' && (
                                                    <span className="badge bg-warning text-dark ms-3">
                                                        <i className="bi bi-lock-fill me-1"></i> Private
                                                    </span>
                                                )}
                                            </div>
                                            <div className="d-flex align-items-center">
                                                {userRole === 'viewer' && (
                                                    <span className="badge bg-secondary me-3">
                                                        <i className="bi bi-eye me-1"></i> View Only
                                                    </span>
                                                )}
                                                <select className="form-select form-select-sm" style={{ width: 'auto' }} value={codeLanguage} onChange={handleLanguageChange}>
                                                    <option value="python">Python</option>
                                                    <option value="cpp">C++</option>
                                                    <option value="java">Java</option>
                                                    <option value="javascript">JavaScript</option>
                                                </select>
                                            </div>
                                        </div>
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
                                <ul className="nav nav-tabs rounded-top">
                                    <li className="nav-item"><button className={`nav-link ${activeTab === 'input' ? 'active' : ''}`} onClick={() => setActiveTab('input')}>Input</button></li>
                                    <li className="nav-item"><button className={`nav-link ${activeTab === 'output' ? 'active' : ''}`} onClick={() => setActiveTab('output')}>Output</button></li>
                                    <li className="nav-item"><button className={`nav-link ${activeTab === 'verdict' ? 'active' : ''}`} onClick={() => setActiveTab('verdict')}>Verdict</button></li>
                                </ul>
                                <div className="tab-content border border-top-0 p-3 rounded-bottom" style={{ minHeight: '180px' }}>
                                    {activeTab === 'input' && (
                                        <div className="tab-pane fade show active">
                                            <textarea
                                                id="inputArea"
                                                className="form-control mb-3 text-body bg-body border border-secondary"
                                                style={{ resize: 'vertical', minHeight: '120px' }}
                                                rows="4"
                                                placeholder="Enter custom input (if required)..."
                                                value={input}
                                                onChange={handleInputChange}
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
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-3">
                                                        {verdicts.map((v, idx) => (
                                                            <div key={idx} className="border rounded p-2 bg-light text-center" style={{ minWidth: '130px' }}>
                                                                <strong>Test Case {v.testCase}</strong>
                                                                <div className={v.verdict.includes("Passed") ? "text-success fw-bold" : "text-danger fw-bold"}>
                                                                    {v.verdict}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-lg-4 d-flex flex-column">
                                <div className="card users-card shadow-lg mb-4">
                                    <div className="card-header users-header d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-people-fill me-2"></i>
                                            <span>Active Users</span>
                                            <span className="user-count ms-2">{activeUsers.length}</span>
                                        </div>
                                        <i className="bi bi-broadcast text-success"></i>
                                    </div>
                                    <ul className="list-group list-group-flush">
                                        {activeUsers.map(participant => {
                                            const isMuted = muteStatus[participant.id] ?? true;
                                            const isOwner = userRole === 'editor';
                                            const isSelf = participant.id === user._id;

                                            return (
                                                <li key={participant.id} className="list-group-item user-item d-flex justify-content-between align-items-center">
                                                    <div className="user-name">
                                                        <div className="user-status"></div>
                                                        <i className="bi bi-person-circle me-2"></i>
                                                        {participant.name} {isSelf && "(You)"}
                                                    </div>

                                                    {sessionAccess === 'private' && stream && (
                                                        <button
                                                            className={`btn btn-sm ${isMuted ? 'text-danger' : 'text-success'}`}
                                                            onClick={() => handleToggleMute(participant.id)}
                                                            disabled={!isOwner && !isSelf}
                                                            title={isOwner ? (isMuted ? "Unmute" : "Mute") : (isSelf ? "Mute Yourself (Owner can unmute)" : "Owner controls audio")}
                                                        >
                                                            <i className={`bi ${isMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`} style={{ fontSize: '1.1rem' }}></i>
                                                        </button>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <div ref={audioContainerRef} style={{ display: 'none' }}></div>
                                </div>

                                {userRole === 'editor' && <SharingComponent sessionId={sessionId} />}

                                <div className="card chat-card shadow-lg rounded-3 flex-grow-1 mt-4">
                                    <div className="card-header chat-header d-flex align-items-center justify-content-between py-3">
                                        <h5 className="mb-0">Live Chat</h5>
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
                                        <form onSubmit={handleSendMessage} className="chat-input-group">
                                            <div className="d-flex">
                                                <input type="text" className="form-control" placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                                                <button className="btn btn-primary" type="submit" disabled={!newMessage.trim()}>Send</button>
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