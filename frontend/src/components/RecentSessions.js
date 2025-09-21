import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function RecentSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, sessionId: null });

  useEffect(() => {
    // Query to get the last 5 sessions, ordered by creation time
    const sessionsQuery = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'), limit(5));
    
    // onSnapshot listens for real-time updates
    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Show context menu on right-click for admins
  const handleRightClick = (event, sessionId) => {
    if (user && user.role === 'admin') {
      event.preventDefault();
      setContextMenu({ visible: true, x: event.pageX, y: event.pageY, sessionId });
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  // Delete the session from Firestore
  const handleDelete = async () => {
    if (contextMenu.sessionId) {
      try {
        await deleteDoc(doc(db, 'sessions', contextMenu.sessionId));
        toast.success(`Session ${contextMenu.sessionId} deleted.`);
      } catch (error) {
        toast.error("Failed to delete session.");
        console.error(error);
      }
    }
    handleCloseContextMenu();
  };

  return (
    <div className="card shadow-sm mt-4" onMouseLeave={handleCloseContextMenu}>
      <div className="card-header bg-dark text-white">
        <h5>Recent Sessions</h5>
      </div>
      <div className="list-group list-group-flush">
        {sessions.map(session => (
          <Link
            key={session.id}
            to={`/chat/${session.id}`}
            className="list-group-item list-group-item-action"
            onContextMenu={(e) => handleRightClick(e, session.id)}
          >
            <div className="d-flex w-100 justify-content-between">
              <h6 className="mb-1">Session: {session.id}</h6>
              {session.access === 'private' && <span className="badge bg-secondary">Private</span>}
            </div>
            <small className="text-muted">Created by {session.ownerName || 'Unknown'}</small>
          </Link>
        ))}
      </div>
      {contextMenu.visible && (
        <div style={{ top: contextMenu.y, left: contextMenu.x, position: 'absolute' }} className="dropdown-menu show">
          <button className="dropdown-item text-danger" onClick={handleDelete}>
            Delete Session
          </button>
        </div>
      )}
    </div>
  );
}

export default RecentSessions;