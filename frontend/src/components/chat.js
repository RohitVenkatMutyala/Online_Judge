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
import './chat.css';

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
    
    // --- Voice Chat State ---
    const [stream, setStream] = useState(null);
    const [muteStatus, setMuteStatus] = useState({});
    const peersRef = useRef({});
    const audioContainerRef = useRef(null);
    const chatMessagesEndRef = useRef(null);

    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ✅ FIX FOR STUCK LOADING SCREEN IS IN THIS REWRITTEN HOOK
    useEffect(() => {
        if (!sessionId) {
            setAccessDenied(true);
            setLoading(false);
            return;
        }

        const sessionDocRef = doc(db, 'sessions', sessionId);

        const unsubscribeSession = onSnapshot(sessionDocRef, (docSnap) => {
            // Path 1: Session document doesn't exist at all.
            if (!docSnap.exists()) {
                setAccessDenied(true);
                setLoading(false);
                return;
            }

            const data = docSnap.data();
            
            // Path 2: Session is private, but the user object hasn't loaded yet.
            // We must wait for the user object to check permissions.
            if (data.access === 'private' && !user) {
                // Keep showing the loading screen. The hook will re-run when `user` loads.
                return;
            }

            // From here, we either have a public session or a loaded user for a private one.
            const isOwner = user && data.ownerId === user._id;
            const hasAccess = data.access === 'public' || (user && data.allowedEmails?.includes(user.email)) || isOwner;

            // Path 3: User does not have access to the private session.
            if (!hasAccess) {
                setAccessDenied(true);
                setLoading(false);
                return;
            }
            
            // Path 4: Success. User has access.
            if (user) {
                const participantExists = data.activeParticipants?.some(p => p.id === user._id);
                if (!participantExists) {
                    updateDoc(sessionDocRef, {
                        activeParticipants: arrayUnion({ id: user._id, name: `${user.firstname} ${user.lastname}` })
                    }).catch(console.error);
                }
            }
            
            const role = isOwner ? 'editor' : (data.defaultRole || 'viewer');
            setAccessDenied(false); setUserRole(role); setCode(data.code || '');
            setInput(data.codeInput || ''); setSessionAccess(data.access || 'public');
            setActiveUsers(data.activeParticipants || []); setCodeLanguage(data.language || 'javascript');
            setMuteStatus(data.muteStatus || {}); setVerdicts(data.lastRunVerdicts || []);
            setOutput(data.lastRunOutput || ''); setTime(data.lastRunTime || null);

            if (data.access === 'private' && !stream) {
                navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(setStream).catch(err => toast.error("Could not access microphone."));
            }
            
            // This is now guaranteed to be called on all successful or denied paths.
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

    // Effect for handling WebRTC connections
    useEffect(() => {
        if (!stream || sessionAccess !== 'private' || !user) return;

        const signalingColRef = collection(db, 'sessions', sessionId, 'signaling');

        // Creates a new peer connection to call another user
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

        // Adds a peer connection to answer an incoming call
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

        // Connect to new users and disconnect from users who left
        activeUsers.forEach(p => {
            if (p.id !== user._id && !peersRef.current[p.id]) {
                peersRef.current[p.id] = createPeer(p.id, user._id, stream);
            }
        });
        Object.keys(peersRef.current).forEach(peerId => {
            if (!activeUsers.find(p => p.id === peerId)) {
                peersRef.current[peerId].destroy();
                delete peersRef.current[peerId];
            }
        });

        // Listen for signaling data to complete connections
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
                        deleteDoc(change.doc.ref); // Clean up signal doc
                    }
                }
            });
        });

        return () => unsubscribeSignaling();
    }, [stream, activeUsers, sessionId, user]);

    // Effect for applying mute status to your own microphone
    useEffect(() => {
        if (!stream || !user || stream.getAudioTracks().length === 0) return;

        const isMuted = muteStatus[user._id] ?? true;
        const audioTrack = stream.getAudioTracks()[0];
        audioTrack.enabled = !isMuted; // Mute/unmute the local track

        // Forcefully update the track for all connected peers
        Object.values(peersRef.current).forEach(peer => {
            const sender = peer._pc.getSenders().find(s => s.track?.kind === 'audio');
            if (sender) {
                sender.replaceTrack(audioTrack);
            }
        });
    }, [muteStatus, stream, user]);
    
    // --- Handler Functions ---

    /**
     * Toggles the mute status for a given user ID based on permissions.
     */
    const handleToggleMute = async (targetUserId) => {
        const isSelf = targetUserId === user._id;
        const isOwner = userRole === 'editor';
        const currentMuteState = muteStatus[targetUserId] ?? true;
        const newMuteState = !currentMuteState;

        // The owner can mute/unmute anyone.
        if (isOwner) {
            await updateDoc(doc(db, 'sessions', sessionId), { [`muteStatus.${targetUserId}`]: newMuteState });
            return;
        }
        
        // Non-owners can only mute themselves.
        if (isSelf) {
            if (newMuteState === false) { // Block unmuting
                toast.error("Only the session owner can unmute you.");
                return;
            }
            await updateDoc(doc(db, 'sessions', sessionId), { [`muteStatus.${targetUserId}`]: true });
        }
    };

    /**
     * Updates the code in Firestore if the user is an editor.
     */
    const handleCodeChange = (newCode) => {
        if (userRole === 'editor') {
            updateDoc(doc(db, 'sessions', sessionId), { code: newCode });
        }
    };

    /**
     * Updates the code input field in Firestore if the user is an editor.
     */
    const handleInputChange = (e) => {
        const newInput = e.target.value;
        setInput(newInput);
        if (userRole === 'editor') {
            updateDoc(doc(db, 'sessions', sessionId), { codeInput: newInput });
        }
    };

    /**
     * Formats a Firestore timestamp into a readable time string.
     */
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        return timestamp.toDate().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    /**
     * Sends a new chat message to Firestore.
     */
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!user || newMessage.trim() === '') return;

        await addDoc(collection(db, 'sessions', sessionId, 'messages'), {
            text: newMessage,
            senderName: `${user.firstname} ${user.lastname}`,
            senderId: user._id,
            timestamp: serverTimestamp()
        });
        setNewMessage('');
    };

    /**
     * Sends the code and input to the compiler API and updates the session.
     */
    const handleRun = async () => {
        setIsRunning(true);
        setActiveTab('output');
        const apiLanguage = codeLanguage === 'python' ? 'py' : codeLanguage;

        try {
            const res = await axios.post(`${API_COM}/run`, {
                language: apiLanguage,
                code,
                input
            });
            const dataToUpdate = {
                lastRunOutput: res.data.output || 'Execution finished.',
                lastRunVerdicts: res.data.verdicts || [],
                lastRunTime: res.data.totalTime || null,
                lastRunTimestamp: serverTimestamp()
            };
            await updateDoc(doc(db, 'sessions', sessionId), dataToUpdate);
        } catch (error) {
            setOutput(error.message || 'An unexpected error occurred.');
        } finally {
            setIsRunning(false);
        }
    };
    
    // --- Render Logic ---

  if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="text-center">
                    <div 
                        className="spinner-border text-primary mb-3" 
                        style={{ width: '3rem', height: '3rem' }} 
                        role="status"
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4>Loading Session...</h4>
                    <p className="text-muted">Please wait while we connect you.</p>
                </div>
            </div>
        );
    }

    if (accessDenied) {
        return <div className="container mt-5"><div className="alert alert-danger"><b>Access Denied.</b></div></div>;
    }

    return (
        <>
            <Navbar />
            <div className="chat-page-container">
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
                            <div className="card-body p-0" style={{ height: '50vh' }}>
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
                            <div className="tab-content border border-top-0 p-3 rounded-bottom bg-body flex-grow-1">
                                {activeTab === 'input' && (
                                    <div className="tab-pane fade show active h-100 d-flex flex-column">
                                        <textarea
                                            className="form-control mb-3 flex-grow-1"
                                            placeholder="Enter custom input..."
                                            value={input}
                                            onChange={handleInputChange}
                                        />
                                        <button
                                            className="btn btn-primary btn-sm align-self-start" // UI FIX: Smaller button
                                            onClick={handleRun}
                                            disabled={isRunning}
                                        >
                                            {isRunning ? 'Running...' : 'Run Code'}
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
                            <ul className="list-group list-group-flush">
                                {activeUsers.map(p => (
                                    <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span className="fw-bold">{p.name}</span> {/* UI FIX: Bolder font */}
                                        {p.id === user?._id && <span className="ms-2">(You)</span>}
                                        {sessionAccess === 'private' && stream && (
                                            <button
                                                className={`btn btn-sm ${muteStatus[p.id] ?? true ? 'text-danger' : 'text-success'}`}
                                                onClick={() => handleToggleMute(p.id)}
                                                disabled={userRole !== 'editor' && p.id !== user?._id}
                                                style={{ fontSize: '1.2rem' }} // UI FIX: Larger mic icon
                                            >
                                                <i className={`bi ${muteStatus[p.id] ?? true ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
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