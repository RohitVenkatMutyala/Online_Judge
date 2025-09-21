import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function RecentSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionsQuery = query(
      collection(db, 'sessions'), 
      orderBy('createdAt', 'desc'), 
      limit(5)
    );

    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(sessionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (sessionId) => {
    if (window.confirm(`Are you sure you want to delete session "${sessionId}"?`)) {
      try {
        await deleteDoc(doc(db, 'sessions', sessionId));
        toast.success(`Session "${sessionId}" was deleted.`);
      } catch (error) {
        toast.error("You don't have permission to delete this.");
        console.error("Delete error: ", error);
      }
    }
  };
  
  // --- ADDED: Helper function to format the timestamp ---
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'No date';
    // Converts Firestore timestamp to a readable Date string
    return timestamp.toDate().toLocaleString(); 
  };

  if (loading) {
    return <p className="text-center mt-3">Loading recent sessions...</p>;
  }

  return (
    <div className="mt-4">
      <h5 className="mb-3">Recent Sessions</h5>
      {/* --- UI CHANGED: From a list-group to individual cards --- */}
      {sessions.map(session => (
        <div key={session.id} className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <h6 className="card-title mb-1">Session: {session.id}</h6>
              {/* --- ADDED: Public or Private badge --- */}
              {session.access === 'private' ? (
                <span className="badge bg-info">Private</span>
              ) : (
                <span className="badge bg-success">Public</span>
              )}
            </div>
            
            <div className="card-text small text-muted">
              {/* --- ADDED: Clearer creator (sender) and timestamp info --- */}
              <div><strong>Creator:</strong> {session.ownerName || 'Unknown'}</div>
              <div><strong>Created:</strong> {formatTimestamp(session.createdAt)}</div>
              {/* --- ADDED: Receiver count for private sessions --- */}
              {session.access === 'private' && (
                <div>
                  <strong>Invited:</strong> {(session.allowedEmails?.length || 1) - 1} user(s)
                </div>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <Link to={`/chat/${session.id}`} className="btn btn-sm btn-outline-primary">
                Join
              </Link>
              {user && user.role === 'admin' && (
                <button 
                  onClick={() => handleDelete(session.id)} 
                  className="btn btn-sm btn-outline-danger"
                  title="Delete Session"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RecentSessions;