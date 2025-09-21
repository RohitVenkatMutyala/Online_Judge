// src/components/Chat.js

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

// Import all your components and CSS
import Navbar from './navbar';
import RecentSessions from './RecentSessions';
import SharingComponent from './SharingComponent';
import './chat.css';
import './sketchy.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Chat() {
    const { user } = useAuth();
    const { sessionId } = useParams();

    // --- All State Variables ---
    const [code, setCode] = useState('');
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [accessDenied, setAccessDenied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [sessionAccess, setSessionAccess] = useState('public');
    const [activeUsers, setActiveUsers] = useState([]);
    const [codeLanguage, setCodeLanguage] = useState('javascript');
 const [description, setDescription] = useState('');
    const chatMessagesEndRef = useRef(null);

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
                <style jsx>{`
        .collaboration-container {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.03), rgba(239, 68, 68, 0.03));
            min-height: 100vh;
            padding: 1rem 0;
        }
        
        .editor-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .editor-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
        }
        
        .editor-header {
            background: linear-gradient(135deg, #1f2937, #374151);
            border: none;
            position: relative;
            overflow: hidden;
        }
        
        .editor-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 2s ease-in-out;
            animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: -100%; }
        }
        
        .gradient-title {
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 600;
        }
        
        .private-badge {
            background: linear-gradient(135deg, #f12711, #f5af19);
            border: none;
            animation: pulse-glow 2s ease-in-out infinite;
            box-shadow: 0 0 10px rgba(241, 39, 17, 0.3);
        }
        
        @keyframes pulse-glow {
            0%, 100% { 
                box-shadow: 0 0 10px rgba(241, 39, 17, 0.3);
                transform: scale(1);
            }
            50% { 
                box-shadow: 0 0 20px rgba(241, 39, 17, 0.5);
                transform: scale(1.05);
            }
        }
        
        .viewer-badge {
            background: linear-gradient(45deg, #fbbf24, #f59e0b);
            border: none;
            animation: gentle-pulse 2s ease-in-out infinite;
        }
        
        @keyframes gentle-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        
        .language-select {
            background: rgba(31, 41, 55, 0.9);
            border: 1px solid rgba(139, 92, 246, 0.3);
            transition: all 0.3s ease;
        }
        
        .language-select:hover, .language-select:focus {
            border-color: rgba(139, 92, 246, 0.6);
            box-shadow: 0 0 0 0.2rem rgba(139, 92, 246, 0.25);
        }
        
        .notes-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
            position: relative;
        }
        
        .notes-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(135deg, #f12711, #f5af19);
        }
        
        .notes-header {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            color: #1f2937;
            font-weight: 600;
        }
        
        .notes-textarea {
            background: rgba(248, 250, 252, 0.5);
            border: none;
            transition: all 0.3s ease;
            resize: none;
        }
        
        .notes-textarea:focus {
            background: rgba(248, 250, 252, 0.8);
            box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
        }
        
        .users-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            transition: all 0.3s ease;
        }
        
        .users-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #10b981, #059669);
        }
        
        .users-header {
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            color: #065f46;
            font-weight: 600;
            position: relative;
        }
        
        .user-count {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-left: 0.5rem;
            animation: count-pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes count-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .user-item {
            border: none;
            background: rgba(236, 253, 245, 0.3);
            margin-bottom: 2px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .user-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: linear-gradient(90deg, #10b981, #059669);
        }
        
        .user-item:hover {
            background: rgba(236, 253, 245, 0.6);
            transform: translateX(5px);
        }
        
        .user-name {
            font-weight: 500;
            color: #065f46;
            display: flex;
            align-items: center;
        }
        
        .user-status {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            margin-right: 0.5rem;
            animation: online-blink 2s ease-in-out infinite;
        }
        
        @keyframes online-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .chat-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            transition: all 0.3s ease;
        }
        
        .chat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #10b981, #059669);
        }
        
        .chat-header {
            background: linear-gradient(135deg, #10b981, #059669);
            position: relative;
            overflow: hidden;
        }
        
        .chat-header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 50px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1));
            animation: chat-shimmer 2s ease-in-out infinite;
        }
        
        @keyframes chat-shimmer {
            0% { transform: translateX(-50px); }
            100% { transform: translateX(50px); }
        }
        
        .chat-messages-container {
            background: linear-gradient(135deg, rgba(248, 250, 252, 0.3), rgba(241, 245, 249, 0.3));
            border-radius: 8px;
            padding: 1rem;
            max-height: 300px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
        }
        
        .chat-messages-container::-webkit-scrollbar {
            width: 6px;
        }
        
        .chat-messages-container::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .chat-messages-container::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 3px;
        }
        
        .chat-message {
            margin-bottom: 1rem;
            animation: message-appear 0.3s ease-out;
        }
        
        @keyframes message-appear {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .own-message {
            text-align: right;
        }
        
        .other-message {
            text-align: left;
        }
        
        .message-header {
            font-size: 0.75rem;
            color: #6b7280;
            margin-bottom: 0.25rem;
        }
        
        .message-sender {
            font-weight: 600;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .message-timestamp {
            margin-left: 0.5rem;
        }
        
        .message-bubble {
            display: inline-block;
            padding: 0.75rem 1rem;
            border-radius: 18px;
            max-width: 80%;
            word-wrap: break-word;
            position: relative;
            backdrop-filter: blur(10px);
        }
        
        .own-message .message-bubble {
            background: linear-gradient(135deg, #f12711, #f5af19);
            color: white;
            margin-left: auto;
            box-shadow: 0 2px 8px rgba(241, 39, 17, 0.3);
        }
        
        .other-message .message-bubble {
            background: rgba(59, 130, 246, 0.1);
            color: #1f2937;
            border: 1px solid rgba(59, 130, 246, 0.2);
        }
        
        .chat-input-group {
            background: rgba(248, 250, 252, 0.5);
            border-radius: 25px;
            overflow: hidden;
            border: 2px solid rgba(16, 185, 129, 0.2);
            transition: all 0.3s ease;
        }
        
        .chat-input-group:focus-within {
            border-color: rgba(16, 185, 129, 0.5);
            box-shadow: 0 0 0 0.2rem rgba(16, 185, 129, 0.25);
        }
        
        .chat-input {
            background: transparent;
            border: none;
            padding: 0.75rem 1rem;
        }
        
        .chat-input:focus {
            background: transparent;
            border: none;
            box-shadow: none;
        }
        
        .send-button {
            background: linear-gradient(135deg, #10b981, #059669);
            border: none;
            color: white;
            padding: 0.75rem 1.5rem;
            font-weight: 600;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .send-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .send-button:hover::before {
            left: 100%;
        }
        
        .send-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            color: white;
        }
        
        /* Dark theme adjustments */
        [data-bs-theme="dark"] .editor-card,
        [data-bs-theme="dark"] .notes-card,
        [data-bs-theme="dark"] .users-card,
        [data-bs-theme="dark"] .chat-card {
            background: rgba(31, 41, 55, 0.95);
            border-color: rgba(255, 255, 255, 0.1);
        }
        
        [data-bs-theme="dark"] .notes-header,
        [data-bs-theme="dark"] .users-header {
            background: rgba(55, 65, 81, 0.8);
            color: #e5e7eb;
        }
        
        [data-bs-theme="dark"] .notes-textarea {
            background: rgba(31, 41, 55, 0.5);
            color: #e5e7eb;
        }
        
        [data-bs-theme="dark"] .user-item {
            background: rgba(31, 41, 55, 0.3);
        }
        
        [data-bs-theme="dark"] .user-name {
            color: #d1fae5;
        }
        
        [data-bs-theme="dark"] .chat-messages-container {
            background: rgba(31, 41, 55, 0.3);
        }
        
        [data-bs-theme="dark"] .other-message .message-bubble {
            background: rgba(59, 130, 246, 0.2);
            color: #e5e7eb;
        }
        
        [data-bs-theme="dark"] .chat-input-group {
            background: rgba(31, 41, 55, 0.5);
        }
        
        .activity-indicator {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 12px;
            height: 12px;
            background: #10b981;
            border-radius: 50%;
            animation: activity-pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes activity-pulse {
            0% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            }
            70% {
                transform: scale(1);
                box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
            }
            100% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
            }
        }
    `}</style>

                <div className="collaboration-container">
                    <div className="container-fluid">
                        <div className="row g-4">
                            {/* ----- Left Column: Editors ----- */}
                            <div className="col-lg-8">
                                <div className="card editor-card shadow-lg rounded-3 mb-4">
                                    <div className="card-header editor-header text-white d-flex justify-content-between align-items-center py-3">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-code-slash me-2 fs-5"></i>
                                            <h5 className="gradient-title mb-0">Collaborative Code Editor</h5>
                                            {sessionAccess === 'private' && (
                                                <span className="badge private-badge ms-3">
                                                    <i className="bi bi-lock-fill me-1"></i>
                                                    Private Session
                                                </span>
                                            )}
                                            <div className="activity-indicator"></div>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            {userRole === 'viewer' && (
                                                <span className="badge viewer-badge text-dark me-3">
                                                    <i className="bi bi-eye me-1"></i>
                                                    View Only
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
                                        {/* --- ADDED: Display the description as a subtitle --- */}
                                    <small className="text-muted d-block mt-1">{description}</small>
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

                                <div className="card notes-card shadow-lg rounded-3">
                                    <div className="card-header notes-header d-flex align-items-center">
                                        <i className="bi bi-journal-text me-2"></i>
                                        <h5 className="mb-0">Shared Notes</h5>
                                    </div>
                                    <div className="card-body">
                                        <textarea
                                            className="form-control notes-textarea"
                                            style={{ height: '200px' }}
                                            value={text}
                                            onChange={handleTextChange}
                                            disabled={userRole !== 'editor'}
                                            placeholder="Share your thoughts, ideas, and notes with your team..."
                                        />
                                    </div>
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