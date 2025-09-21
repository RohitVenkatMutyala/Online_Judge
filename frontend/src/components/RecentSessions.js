import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { ListGroup } from 'bootstrap'; // Using bootstrap components for consistency

function RecentSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionsQuery = query(
      collection(db, 'sessions'), 
      orderBy('createdAt', 'desc'), 
      limit(5)
    );

    const unsubscribe = onSnapshot(sessionsQuery, (querySnapshot) => {
      const sessionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(sessionsData);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading recent sessions...</p>;
  }

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header bg-dark text-white">
        <h5>Recent Sessions</h5>
      </div>
      <div className="list-group list-group-flush">
        {sessions.map(session => (
          <Link 
            key={session.id} 
            to={`/chat/${session.id}`} 
            className="list-group-item list-group-item-action"
          >
            <div className="d-flex w-100 justify-content-between">
              <h6 className="mb-1">Session: {session.id}</h6>
            </div>
            <small className="text-muted">Created by {session.ownerName || 'Unknown'}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RecentSessions;