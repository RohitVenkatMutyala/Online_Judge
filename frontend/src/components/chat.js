import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import {
  doc, onSnapshot, updateDoc, collection, addDoc, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import Editor from '@monaco-editor/react';

// Bootstrap and Custom CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './sketchy.css';
import './Chat.css';

// Components
import Navbar from './navbar';
import RecentSessions from './RecentSessions';
import UserList from './UserList'; // Make sure UserList is imported if used

function Chat() {
  const { user } = useAuth();
  const { sessionId } = useParams();

  const [code, setCode] = useState('');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatMessagesEndRef = useRef(null);
  
  // States for permissions and loading
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Auto-scroll logic
  const scrollToBottom = () => chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  // Main listener for session data and permissions
  useEffect(() => {
    if (!sessionId || !user) return;
    setLoading(true);

    const sessionDocRef = doc(db, 'sessions', sessionId);
    const unsubscribeSession = onSnapshot(sessionDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentUserRole = data.permissions?.[user._id];

        if (currentUserRole || user.role === 'admin') {
          setAccessDenied(false);
          setUserRole(currentUserRole || 'admin'); // Admin role overrides
          setCode(data.code || '');
          setText(data.text || '');
        } else {
          setAccessDenied(true);
        }
      } else {
        setAccessDenied(true);
      }
      setLoading(false);
    });

    // Listener for chat messages
    const messagesColRef = collection(db, 'sessions', sessionId, 'messages');
    const messagesQuery = query(messagesColRef, orderBy('timestamp'));
    const unsubscribeMessages = onSnapshot(messagesQuery, (qSnap) => {
      setMessages(qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeSession();
      unsubscribeMessages();
    };
  }, [sessionId, user]);

  // Handlers
  const handleCodeChange = (newCode) => {
    if (userRole === 'editor' || userRole === 'admin') {
      setCode(newCode);
      updateDoc(doc(db, 'sessions', sessionId), { code: newCode });
    }
  };

  const handleTextChange = (e) => {
    if (userRole === 'editor' || userRole === 'admin') {
      const newText = e.target.value;
      setText(newText);
      updateDoc(doc(db, 'sessions', sessionId), { text: newText });
    }
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

  // Render logic for different states
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center"><h2>Loading Session...</h2></div>
      </>
    );
  }

  if (accessDenied) {
    return (
      <>
        <Navbar />
        <div className="container mt-5">
          <div className="alert alert-danger">Access Denied. You do not have permission to view this session.</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="chat-page-container">
        <div className="container-fluid">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card shadow-sm rounded-3 mb-4">
                <div className="card-header bg-dark text-white d-flex justify-content-between">
                  <h5>Collaborative Code Editor</h5>
                  {userRole === 'viewer' && <span className="badge bg-warning text-dark">View Only</span>}
                </div>
                <div className="card-body p-0" style={{ height: '450px' }}>
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={handleCodeChange}
                    options={{ readOnly: userRole !== 'editor' && userRole !== 'admin', minimap: { enabled: false } }}
                  />
                </div>
              </div>
              <div className="card shadow-sm rounded-3">
                <div className="card-header"><h5>Shared Notes</h5></div>
                <div className="card-body">
                  <textarea
                    className="form-control border-0"
                    style={{ height: '200px', resize: 'none' }}
                    value={text}
                    onChange={handleTextChange}
                    disabled={userRole !== 'editor' && userRole !== 'admin'}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-4 d-flex flex-column">
              <div className="card shadow-sm rounded-3 flex-grow-1">
                <div className="card-header bg-success text-white"><h5>Live Chat</h5></div>
                <div className="card-body d-flex flex-column" style={{ overflowY: 'auto' }}>
                  <div className="chat-messages-container flex-grow-1 mb-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`chat-message ${msg.senderId === user._id ? 'own-message' : 'other-message'}`}>
                        <div className="message-sender">{msg.senderName}</div>
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