// src/components/Chat.js

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { 
    doc, onSnapshot, updateDoc, collection, addDoc, query, orderBy, serverTimestamp, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import Editor from '@monaco-editor/react';

// Import all your components and CSS
import Navbar from './navbar';
import RecentSessions from './RecentSessions'; // Ensure this points to the renamed file
import SharingComponent from './SharingComponent';
import './chat.css';
import './sketchy.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Chat() {
    const { user } = useAuth();
    const { sessionId } = useParams();

    // State variables
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

    const chatMessagesEndRef = useRef(null);

    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!sessionId || !user) return;
        
        const sessionDocRef = doc(db, 'sessions', sessionId);

        const enterSession = async () => {
            await updateDoc(sessionDocRef, {
                activeParticipants: arrayUnion({ id: user._id, name: `${user.firstname} ${user.lastname}` })
            }).catch(err => console.log("Failed to enter session, might not exist yet."));
        };
        enterSession();

        const unsubscribeSession = onSnapshot(sessionDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const permissions = data.permissions || {};
                let hasAccess = false;
                let role = 'viewer';

                // --- CORRECTED ACCESS LOGIC ---
                if (data.access === 'public') {
                    hasAccess = true;
                    role = permissions[user._id] || data.defaultRole || 'viewer';
                } else { // private
                    if (permissions[user._id]) {
                        hasAccess = true;
                        role = permissions[user._id];
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
            leaveSession();
        };
    }, [sessionId, user]);

    // --- All Handlers ---
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
    if (accessDenied) { return <div className="container mt-5"><div className="alert alert-danger"><b>Access Denied.</b> You do not have permission to view this session or it does not exist.</div></div>; }
    
    return (
        <>
            <Navbar />
            <div className="chat-page-container">
                <div className="container-fluid">
                    <div className="row g-4">
                        <div className="col-lg-8">
                            <div className="card shadow-sm rounded-3 mb-4">
                                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <h5 className="mb-0">Collaborative Code Editor</h5>
                                        {sessionAccess === 'private' && (
                                            <span className="badge bg-info ms-3">Private Session</span>
                                        )}
                                    </div>
                                    <div className="d-flex align-items-center">
                                        {userRole === 'viewer' && <span className="badge bg-warning text-dark me-3">View Only</span>}
                                        <select className="form-select form-select-sm bg-dark text-white" value={codeLanguage} onChange={handleLanguageChange}>
                                            <option value="javascript">JavaScript</option>
                                            <option value="python">Python</option>
                                            <option value="html">HTML</option>
                                            <option value="css">CSS</option>
                                            <option value="json">JSON</option>
                                        </select>
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
                            <div className="card shadow-sm rounded-3">
                                {/* Shared Notes JSX */}
                            </div>
                        </div>
                        <div className="col-lg-4 d-flex flex-column">
                           {/* Active Users and Sharing JSX */}
                           <div className="card shadow-sm rounded-3 flex-grow-1 mt-4">
                                {/* Live Chat JSX */}
                           </div>
                           <RecentSessions />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Chat;