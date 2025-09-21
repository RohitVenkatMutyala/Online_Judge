import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Import the firestore instance
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

// --- CHANGE 1: Import Monaco Editor instead of Ace ---
import Editor from '@monaco-editor/react';

// Bootstrap and CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './sketchy.css';
import Navbar from './navbar';

function Chat() {
  const { user } = useAuth();
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // State for collaborative features
  const [code, setCode] = useState('// Start coding here...');
  const [text, setText] = useState('Type your notes here...');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatMessagesEndRef = useRef(null);

  // Scroll to the latest message
  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Set up real-time listeners for Firestore
  useEffect(() => {
    if (!sessionId) return;

    // --- Real-time listener for Code and Text ---
    const sessionDocRef = doc(db, 'sessions', sessionId);

    const unsubscribeSession = onSnapshot(sessionDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCode(data.code || '');
        setText(data.text || '');
      } else {
        // If the session doesn't exist, create it.
        setDoc(sessionDocRef, { 
          code: '// Welcome! Start coding collaboratively.',
          text: 'This is a shared notes area.',
          createdAt: serverTimestamp()
        });
      }
    });

    // --- Real-time listener for Chat Messages ---
    const messagesColRef = collection(db, 'sessions', sessionId, 'messages');
    const messagesQuery = query(messagesColRef, orderBy('timestamp'));

    const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    // Cleanup listeners on component unmount
    return () => {
      unsubscribeSession();
      unsubscribeMessages();
    };
  }, [sessionId]);

  // --- Handler Functions to update Firestore ---

  // Note: Monaco's onChange provides the value directly, same as Ace
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    const sessionDocRef = doc(db, 'sessions', sessionId);
    updateDoc(sessionDocRef, { code: newCode });
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    const sessionDocRef = doc(db, 'sessions', sessionId);
    updateDoc(sessionDocRef, { text: newText });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const messagesColRef = collection(db, 'sessions', sessionId, 'messages');
    await addDoc(messagesColRef, {
      text: newMessage,
      senderName: `${user.firstname} ${user.lastname}`,
      senderId: user._id,
      timestamp: serverTimestamp(),
    });
    setNewMessage('');
  };

  // --- Auth Check ---
  if (!user || user.role === 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
            You must be logged in as a regular user to access this page.
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container-fluid mt-4">
        <div className="row g-4">
          {/* ----- Left Column: Editors ----- */}
          <div className="col-lg-8">
            {/* Code Editor */}
            <div className="card border-primary mb-4">
              <div className="card-header">
                <h5>Collaborative Code Editor</h5>
              </div>
              <div className="card-body p-0" style={{ height: '400px' }}>
                {/* --- CHANGE 2: Use the Monaco Editor Component --- */}
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark" // Common theme for Monaco, similar to monokai
                  value={code}
                  onChange={handleCodeChange}
                  options={{ minimap: { enabled: false } }} // Optional: hide the minimap
                />
              </div>
            </div>

            {/* Text Editor */}
            <div className="card border-secondary">
              <div className="card-header">
                <h5>Shared Notes</h5>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  style={{ height: '200px', resize: 'none' }}
                  value={text}
                  onChange={handleTextChange}
                />
              </div>
            </div>
          </div>

          {/* ----- Right Column: Chat ----- */}
          <div className="col-lg-4">
            <div className="card border-success" style={{ height: '75vh' }}>
              <div className="card-header">
                <h5>Live Chat</h5>
              </div>
              <div className="card-body d-flex flex-column" style={{ overflowY: 'auto' }}>
                <div className="flex-grow-1 mb-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`mb-2 ${msg.senderId === user._id ? 'text-end' : ''}`}>
                      <div className="fw-bold small">{msg.senderName}</div>
                      <span className={`badge ${msg.senderId === user._id ? 'bg-primary' : 'bg-secondary'}`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                  <div ref={chatMessagesEndRef} />
                </div>
                {/* Chat Input Form */}
                <form onSubmit={handleSendMessage}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button className="btn btn-success" type="submit">Send</button>
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