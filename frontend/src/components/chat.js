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
    const [ownerId, setOwnerId] = useState(null); // NEW: State for owner's ID
    
    // --- Media State ---
    const [stream, setStream] = useState(null);
    const [muteStatus, setMuteStatus] = useState({});
    const peersRef = useRef({});
    const audioContainerRef = useRef(null);
    const chatMessagesEndRef = useRef(null);

    // --- Video Refs ---
    const [isVideoOn, setIsVideoOn] = useState(true); 
    const localVideoRef = useRef(null); // For owner's local preview
    const ownerVideoContainerRef = useRef(null); // For participants to see owner's stream

    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Main useEffect to handle session data and user presence
    useEffect(() => {
        if (!sessionId) {
            setAccessDenied(true);
            setLoading(false);
            return;
        }

        const sessionDocRef = doc(db, 'sessions', sessionId);

        const unsubscribeSession = onSnapshot(sessionDocRef, (docSnap) => {
            if (!docSnap.exists()) {
                setAccessDenied(true);
                setLoading(false);
                return;
            }

            const data = docSnap.data();
            if (data.access === 'private' && !user) return;

            const isOwner = user && data.ownerId === user._id;
            const hasAccess = data.access === 'public' || (user && data.allowedEmails?.includes(user.email)) || isOwner;
            
            if (!hasAccess) {
                setAccessDenied(true);
                setLoading(false);
                return;
            }
            
            const role = isOwner ? 'editor' : (data.defaultRole || 'viewer');
            setUserRole(role);
            setOwnerId(data.ownerId); // NEW: Set owner ID state

            if (user) {
                const participantExists = data.activeParticipants?.some(p => p.id === user._id);
                if (!participantExists) {
                    updateDoc(sessionDocRef, {
                        activeParticipants: arrayUnion({ id: user._id, name: `${user.firstname} ${user.lastname}` })
                    }).catch(console.error);
                }
            }
            
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
                const wantsVideo = role === 'editor'; // Only the owner requests video
                navigator.mediaDevices.getUserMedia({ video: wantsVideo, audio: true })
                    .then(stream => {
                        setStream(stream);
                        if (wantsVideo && localVideoRef.current) {
                            localVideoRef.current.srcObject = stream;
                        }
                    }).catch(err => toast.error("Could not access microphone/camera."));
            }

            setLoading(false);
        }, (error) => {
            console.error("Error in onSnapshot listener:", error);
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
    }, [sessionId, user]);

    // useEffect for WebRTC connections (Audio for participants, Video for Owner)
    useEffect(() => {
        if (!stream || sessionAccess !== 'private' || !user || !ownerId) return;

        const signalingColRef = collection(db, 'sessions', sessionId, 'signaling');

        const handleRemoteStream = (remoteStream, remotePeerId) => {
            if (remotePeerId === ownerId) {
                // If the stream is from the owner, show it in the video container
                if (ownerVideoContainerRef.current) {
                    let video = document.getElementById('video-owner');
                    if (!video) {
                        video = document.createElement('video');
                        video.id = 'video-owner';
                        video.autoplay = true;
                        video.playsInline = true;
                        ownerVideoContainerRef.current.innerHTML = ''; // Clear placeholder
                        ownerVideoContainerRef.current.appendChild(video);
                    }
                    video.srcObject = remoteStream;
                }
            } else {
                // If the stream is from another participant, only play audio
                if (audioContainerRef.current) {
                    let audio = document.getElementById(`audio-${remotePeerId}`);
                    if (!audio) {
                        audio = document.createElement('audio');
                        audio.id = `audio-${remotePeerId}`;
                        audio.autoplay = true;
                        audioContainerRef.current.appendChild(audio);
                    }
                    audio.srcObject = remoteStream;
                }
            }
        };
        
        const createPeer = (recipientId, senderId, stream) => {
            const peer = new Peer({ initiator: true, trickle: false, stream });
            peer.on('signal', signal => addDoc(signalingColRef, { recipientId, senderId, signal }));
            peer.on('stream', remoteStream => handleRemoteStream(remoteStream, recipientId));
            peer.on('close', () => { 
                if (recipientId === ownerId) {
                    if(ownerVideoContainerRef.current) ownerVideoContainerRef.current.innerHTML = '<div class="video-placeholder"><i class="bi bi-camera-video-off"></i><p class="text-muted mt-2">Owner\'s stream ended.</p></div>';
                } else {
                    const audioElem = document.getElementById(`audio-${recipientId}`);
                    if (audioElem) audioElem.remove();
                }
            });
            return peer;
        };

        const addPeer = (incoming, recipientId, stream) => {
            const peer = new Peer({ initiator: false, trickle: false, stream });
            peer.on('signal', signal => addDoc(signalingColRef, { recipientId: incoming.senderId, senderId: recipientId, signal }));
            peer.on('stream', remoteStream => handleRemoteStream(remoteStream, incoming.senderId));
            peer.on('close', () => {
                if (incoming.senderId === ownerId) {
                    if(ownerVideoContainerRef.current) ownerVideoContainerRef.current.innerHTML = '<div class="video-placeholder"><i class="bi bi-camera-video-off"></i><p class="text-muted mt-2">Owner\'s stream ended.</p></div>';
                } else {
                    const audioElem = document.getElementById(`audio-${incoming.senderId}`);
                    if (audioElem) audioElem.remove();
                }
            });
            peer.signal(incoming.signal);
            return peer;
        };

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

        const unsubscribeSignaling = onSnapshot(query(signalingColRef), snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const data = change.doc.data();
                    if (data.recipientId === user._id) {
                        const peer = peersRef.current[data.senderId];
                        if (peer) { peer.signal(data.signal); } 
                        else { peersRef.current[data.senderId] = addPeer(data, user._id, stream); }
                        deleteDoc(change.doc.ref);
                    }
                }
            });
        });
        return () => unsubscribeSignaling();
    }, [stream, activeUsers, sessionId, user, ownerId]);

    // useEffect for applying mute status
    useEffect(() => {
        if (!stream || !user || stream.getAudioTracks().length === 0) return;
        const isMuted = muteStatus[user._id] ?? true;
        stream.getAudioTracks()[0].enabled = !isMuted;
    }, [muteStatus, stream, user]);

    // useEffect to toggle owner's local video track
    useEffect(() => {
        if (stream && userRole === 'editor' && stream.getVideoTracks().length > 0) {
            stream.getVideoTracks()[0].enabled = isVideoOn;
        }
    }, [isVideoOn, stream, userRole]);
    
    // --- Handler Functions ---
    const handleToggleMute = async (targetUserId) => {
        const isSelf = targetUserId === user._id;
        const isOwner = userRole === 'editor';
        const currentMuteState = muteStatus[targetUserId] ?? true;
        
        if (isOwner) {
            await updateDoc(doc(db, 'sessions', sessionId), { [`muteStatus.${targetUserId}`]: !currentMuteState });
        } else if (isSelf && currentMuteState === false) {
            await updateDoc(doc(db, 'sessions', sessionId), { [`muteStatus.${targetUserId}`]: true });
        } else if (isSelf && currentMuteState === true) {
            toast.error("Only the session owner can unmute you.");
        }
    };

    const handleToggleVideo = () => setIsVideoOn(prevState => !prevState);

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
    
    if (loading) { return (<div className="d-flex justify-content-center align-items-center vh-100"><div className="text-center"><div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"><span className="visually-hidden">Loading...</span></div><h4>Loading Session...</h4></div></div>); }
    if (accessDenied) { return <div className="container mt-5"><div className="alert alert-danger"><b>Access Denied.</b></div></div>; }
    
    return (
        <>
            <Navbar />
            <div className="chat-page-container">
                <div className="row g-3 h-100">
                    <div className="col-lg-8 d-flex flex-column">
                        <div className="card shadow-sm rounded-3 mb-3">
                            <div className="card-header p-2"><div className="d-flex justify-content-between align-items-center"><h5 className="mb-0 d-flex align-items-center fs-6"><i className="bi bi-code-slash me-2"></i>Collaborative Editor{sessionAccess === 'private' && <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill ms-2"><i className="bi bi-lock-fill me-1"></i> Private</span>}</h5><select className="form-select form-select-sm" style={{ width: 'auto' }} value={codeLanguage} onChange={(e) => userRole === 'editor' && updateDoc(doc(db, 'sessions', sessionId), { language: e.target.value })}><option value="python">Python</option><option value="cpp">C++</option><option value="java">Java</option><option value="javascript">JavaScript</option></select></div></div>
                            <div className="card-body p-0" style={{ height: '65vh' }}><Editor height="100%" language={codeLanguage} theme="vs-dark" value={code} onChange={handleCodeChange} options={{ readOnly: userRole !== 'editor', minimap: { enabled: false } }} /></div>
                        </div>
                        <div className="flex-grow-1 d-flex flex-column">
                            <ul className="nav nav-tabs"><li className="nav-item"><button className={`nav-link ${activeTab === 'input' ? 'active' : ''}`} onClick={() => setActiveTab('input')}>Input</button></li><li className="nav-item"><button className={`nav-link ${activeTab === 'output' ? 'active' : ''}`} onClick={() => setActiveTab('output')}>Output</button></li><li className="nav-item"><button className={`nav-link ${activeTab === 'verdict' ? 'active' : ''}`} onClick={() => setActiveTab('verdict')}>Verdict</button></li></ul>
                            <div className="tab-content border border-top-0 p-2 rounded-bottom bg-body flex-grow-1">
                                {activeTab === 'input' && (<div className="tab-pane fade show active h-100 d-flex flex-column"><textarea className="form-control mb-3 flex-grow-1" placeholder="Enter custom input..." value={input} onChange={handleInputChange} /><button className="btn btn-primary btn-sm align-self-start" onClick={handleRun} disabled={isRunning}>{isRunning ? 'Running...' : 'Run Code'}</button></div>)}
                                {activeTab === 'output' && (<div className="tab-pane fade show active"><pre>{output || (isRunning ? 'Executing...' : 'Run code to see output.')}</pre></div>)}
                                {activeTab === 'verdict' && (<div className="tab-pane fade show active">{!verdicts || verdicts.length === 0 ? <p className="text-muted">No verdict yet.</p> : (<div><div className="mb-2">Total Time: {TotalTime}ms</div><div className="d-flex flex-wrap gap-3">{verdicts.map((v, idx) => <div key={idx} className={`border rounded p-2 text-center ${v.verdict.includes("Passed") ? "text-success" : "text-danger"}`}><strong>Test Case {v.testCase}</strong>: {v.verdict}</div>)}</div></div>)}</div>)}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4 d-flex flex-column h-100">
                        {userRole === 'editor' && stream && (
                            <div className="card shadow-sm mb-3"><div className="card-header d-flex justify-content-between align-items-center py-2"><span className="fw-bold fs-6">My Video Preview</span></div><div className="owner-video-container"><video ref={localVideoRef} muted autoPlay playsInline className="owner-video-preview" />{!isVideoOn && <div className="video-overlay"><i className="bi bi-camera-video-off-fill"></i></div>}</div></div>
                        )}
                        {userRole !== 'editor' && sessionAccess === 'private' && (
                            <div className="card shadow-sm mb-3"><div className="card-header d-flex justify-content-between align-items-center py-2"><span className="fw-bold fs-6">Session Owner's Stream</span></div><div ref={ownerVideoContainerRef} className="owner-stream-container"><div className="video-placeholder"><i className="bi bi-camera-video-off"></i><p className="text-muted mt-2">Waiting for owner's stream...</p></div></div></div>
                        )}
                        <div className="card shadow-sm mb-3">
                            <div className="card-header d-flex justify-content-between"><span>Active Users ({activeUsers.length})</span><i className="bi bi-broadcast text-success"></i></div>
                            <ul className="list-group list-group-flush">
                                {activeUsers.map(p => (
                                    <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div><span className="fw-bold">{p.name}</span>{p.id === user?._id && <span className="ms-2 text-muted">(You)</span>}</div>
                                        {sessionAccess === 'private' && stream && (
                                            <div className="d-flex align-items-center">
                                                {userRole === 'editor' && p.id === user?._id && (<button className={`btn btn-sm ${isVideoOn ? 'text-success' : 'text-danger'}`} onClick={handleToggleVideo} style={{ fontSize: '1.2rem' }}><i className={`bi ${isVideoOn ? 'bi-camera-video-fill' : 'bi-camera-video-off-fill'}`}></i></button>)}
                                                <button className={`btn btn-sm ${muteStatus[p.id] ?? true ? 'text-danger' : 'text-success'}`} onClick={() => handleToggleMute(p.id)} style={{ fontSize: '1.2rem' }}><i className={`bi ${muteStatus[p.id] ?? true ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i></button>
                                            </div>
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
                                <div className="chat-messages-container">{messages.map(msg => (<div key={msg.id} className={`chat-message ${msg.senderId === user?._id ? 'own-message' : 'other-message'}`}><div className="message-header"><span className="message-sender">{msg.senderName}</span><span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span></div><div className="message-bubble">{msg.text}</div></div>))}<div ref={chatMessagesEndRef} /></div>
                                <form onSubmit={handleSendMessage} className="chat-input-group"><div className="d-flex align-items-center"><input type="text" className="form-control chat-input" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} /><button className="send-button flex-shrink-0" type="submit" disabled={!newMessage.trim()}><i className="bi bi-send-fill"></i></button></div></form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Chat;

