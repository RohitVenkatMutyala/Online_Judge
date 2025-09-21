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
      limit(21) // Fetching 6 is good for a 3x2 grid layout
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
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted fs-5">Loading recent sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <style jsx>{`
        .gradient-header {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
        
        .session-card {
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          overflow: hidden;
          position: relative;
        }
        
        .session-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
        }
        
        .session-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border-color: rgba(123, 97, 255, 0.3);
        }
        
        .private-badge {
          background: linear-gradient(135deg, #f12711, #f5af19);
          color: white;
          border: none;
        }
        
        .public-badge {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
        }
        
        .btn-join {
          background: linear-gradient(135deg, #f12711, #f5af19);
          border: none;
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .btn-join::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .btn-join:hover::before {
          left: 100%;
        }
        
        .btn-join:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(241, 39, 17, 0.4);
          color: white;
        }
        
        .btn-delete:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
        }
        
        .session-id {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
        }
        
        /* Dark theme adjustments */
        [data-bs-theme="dark"] .session-card {
          background-color: rgba(33, 37, 41, 0.8);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        [data-bs-theme="dark"] .session-card:hover {
          background-color: rgba(33, 37, 41, 0.95);
        }
        
        /* Light theme adjustments */
        [data-bs-theme="light"] .session-card,
        .session-card {
          background-color: rgba(255, 255, 255, 0.9);
          border-color: rgba(0, 0, 0, 0.1);
        }
        
        [data-bs-theme="light"] .session-card:hover,
        .session-card:hover {
          background-color: rgba(255, 255, 255, 0.95);
        }
        
        .info-text {
          color: var(--bs-secondary);
          font-size: 0.9rem;
        }
        
        .creator-info {
          background: rgba(var(--bs-primary-rgb), 0.1);
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 1rem;
        }
      `}</style>
      
      <div className="mb-4">
        <h2 className="gradient-header display-6 text-center mb-4">
          Recent Sessions
        </h2>
      </div>
      
      <div className="row g-4">
        {sessions.map(session => (
          <div key={session.id} className="col-12 col-md-6 col-xl-4">
            <div className="card session-card h-100 shadow-sm">
              <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-4 px-4">
                <h5 className="session-id mb-0 text-truncate" title={`Session: ${session.id}`}>
                  Session: {session.id}
                </h5>
                <span className={`badge rounded-pill px-3 py-2 ${session.access === 'private' ? 'private-badge' : 'public-badge'}`}>
                  <i className={`bi ${session.access === 'private' ? 'bi-lock-fill' : 'bi-globe'} me-1`}></i>
                  {session.access === 'private' ? 'Private' : 'Public'}
                </span>
              </div>
              
              <div className="card-body px-4">
                <div className="creator-info">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-person-circle me-2 text-primary"></i>
                    <strong className="info-text">Creator:</strong>
                    <span className="ms-2 text-primary fw-medium">{session.ownerName || 'Unknown'}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-calendar-event me-2 text-primary"></i>
                    <strong className="info-text">Created:</strong>
                    <span className="ms-2 info-text">{formatTimestamp(session.createdAt)}</span>
                  </div>
                  {session.access === 'private' && (
                    <div className="d-flex align-items-center">
                      <i className="bi bi-people me-2 text-primary"></i>
                      <strong className="info-text">Invited:</strong>
                      <span className="ms-2 info-text">{(session.allowedEmails?.length || 1) - 1} user(s)</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-footer bg-transparent border-0 px-4 pb-4">
                <div className="d-flex gap-2 flex-wrap">
                  <Link 
                    to={`/session/${session.id}`} 
                    className="btn btn-join flex-fill d-flex align-items-center justify-content-center"
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Join Session
                  </Link>
                  {user && user.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="btn btn-outline-danger btn-delete px-3"
                      title="Delete Session"
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {sessions.length === 0 && !loading && (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-collection display-1 text-muted"></i>
          </div>
          <h4 className="text-muted mb-3">No Recent Sessions</h4>
          <p className="text-muted">Sessions will appear here once they are created.</p>
        </div>
      )}
    </div>
  );
}

export default RecentSessions;