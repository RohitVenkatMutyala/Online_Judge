// src/components/RecentSessions.js (File renamed from RecentSubmissions.js)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function RecentSessions() { // Function name updated
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

  if (loading) {
    return <p className="text-center mt-3">Loading recent sessions...</p>;
  }

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header bg-dark text-white">
        <h5>Recent Sessions</h5>
      </div>
      <div className="list-group list-group-flush">
        {sessions.map(session => (
          <div key={session.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <Link to={`/chat/${session.id}`} className="text-decoration-none text-dark flex-grow-1">
              <h6 className="mb-1">Session: {session.id}</h6>
              <small className="text-muted">By: {session.ownerName || 'Unknown'}</small>
            </Link>

            {user && user.role === 'admin' && (
              <button 
                onClick={() => handleDelete(session.id)} 
                className="btn btn-sm btn-outline-danger ms-2"
                title="Delete Session"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentSessions; // Export name updated