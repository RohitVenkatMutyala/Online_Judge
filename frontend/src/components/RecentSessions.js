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
      limit(6) // Fetching 6 is good for a 3x2 grid layout
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
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'No date';
    return timestamp.toDate().toLocaleString(); 
  };

  if (loading) {
    return <p className="text-center mt-3">Loading recent sessions...</p>;
  }

  return (
    <div className="mt-4">
      <h5 className="mb-3">Recent Sessions</h5>
      {/* --- UI CHANGED: Wrapped in a Bootstrap row --- */}
      <div className="row">
        {sessions.map(session => (
          // --- UI CHANGED: Each card is now a responsive column ---
          <div key={session.id} className="col-12 col-md-6 col-lg-4 mb-4">
            {/* --- UI CHANGED: Added h-100 for uniform card height in a row --- */}
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start">
                  <h6 className="card-title mb-1">Session: {session.id}</h6>
                  {session.access === 'private' ? (
                    <span className="badge bg-info">Private</span>
                  ) : (
                    <span className="badge bg-success">Public</span>
                  )}
                </div>
                
                <div className="card-text small text-muted mb-3">
                  <div><strong>Creator:</strong> {session.ownerName || 'Unknown'}</div>
                  <div><strong>Created:</strong> {formatTimestamp(session.createdAt)}</div>
                  {session.access === 'private' && (
                    <div>
                      <strong>Invited:</strong> {(session.allowedEmails?.length || 1) - 1} user(s)
                    </div>
                  )}
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center">
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentSessions;