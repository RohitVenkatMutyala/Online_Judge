import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, updateDoc, collection, addDoc, query, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import Editor from '@monaco-editor/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './sketchy.css';
import Navbar from './navbar';
import './chat.css';
import RecentSessions from './RecentSessions';

function Chat() {
    const { user } = useAuth();
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [code, setCode] = useState('');
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [accessDenied, setAccessDenied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    const chatMessagesEndRef = useRef(null);

    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!sessionId || !user) return;

        const sessionDocRef = doc(db, 'sessions', sessionId);
        const unsubscribeSession = onSnapshot(sessionDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // --- PERMISSION CHECK ---
                const isPublic = data.access === 'public';
                const isAllowed = data.allowedEmails?.includes(user.email);
                
                if (isPublic || isAllowed) {
                    setAccessDenied(false);
                    setCode(data.code || '');
                    setText(data.text || '');
                    setUserRole(data.permissions?.[user.uid] || 'viewer');
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
        const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
            setMessages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubscribeSession();
            unsubscribeMessages();
        };
    }, [sessionId, user]);

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
            senderName: user.displayName || user.email,
            senderId: user.uid,
            timestamp: serverTimestamp(),
        });
        setNewMessage('');
    };
    
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        return timestamp.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    if (loading) {
        return <div className="container mt-5 text-center"><h2>Loading Session...</h2></div>;
    }

    if (accessDenied) {
        return <div className="container mt-5"><div className="alert alert-danger"><b>Access Denied.</b> You do not have permission to view this session or it does not exist.</div></div>;
    }
    
    return (
        <>
            <Navbar />
            <div className="chat-page-container">
                <div className="container-fluid">
                    <div className="row g-4">
                        <div className="col-lg-8">
                            <div className="card shadow-sm rounded-3 mb-4">
                                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                                    <h5>Collaborative Code Editor</h5>
                                    {userRole === 'viewer' && <span className="badge bg-warning text-dark">View Only</span>}
                                </div>
                                <div className="card-body p-0" style={{ height: '450px' }}>
                                    <Editor height="100%" defaultLanguage="javascript" theme="vs-dark" value={code} onChange={handleCodeChange} options={{ minimap: { enabled: false }, readOnly: userRole !== 'editor' }} />
                                </div>
                            </div>
                            <div className="card shadow-sm rounded-3">
                                <div className="card-header"><h5>Shared Notes</h5></div>
                                <div className="card-body">
                                    <textarea className="form-control border-0" style={{ height: '200px', resize: 'none' }} value={text} onChange={handleTextChange} disabled={userRole !== 'editor'} />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 d-flex flex-column">
                            <div className="card shadow-sm rounded-3 flex-grow-1">
                                <div className="card-header bg-success text-white"><h5>Live Chat</h5></div>
                                <div className="card-body d-flex flex-column" style={{ overflowY: 'auto' }}>
                                    <div className="chat-messages-container flex-grow-1 mb-3">
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={`chat-message ${msg.senderId === user.uid ? 'own-message' : 'other-message'}`}>
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
                                        <div className="input-group">
                                            <input type="text" className="form-control" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                                            <button className="btn btn-success" type="submit">Send</button>
                                        </div>
                                    </form>
                                </div>
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