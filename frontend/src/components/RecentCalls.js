// src/components/RecentCalls.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function RecentCalls() {
    const { user } = useAuth();
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const callsQuery = query(
            collection(db, 'calls'), // Changed from 'sessions' to 'calls'
            orderBy('createdAt', 'desc'),
            limit(12) 
        );

        const unsubscribe = onSnapshot(callsQuery, (snapshot) => {
            const callsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCalls(callsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (callId) => {
        // Note: window.confirm is not ideal in React, but keeping logic same
        if (window.confirm(`Are you sure you want to delete call "${callId}"?`)) {
            try {
                await deleteDoc(doc(db, 'calls', callId)); // Changed to 'calls' collection
                toast.success(`Call "${callId}" was deleted.`);
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
                    <p className="text-muted fs-5">Loading recent calls...</p>
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
        
        .call-card { /* Renamed from session-card */
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          overflow: hidden;
          position: relative;
        }
        
        .call-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
        }
        
        .call-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border-color: rgba(123, 97, 255, 0.3);
        }
        
        /* Removed private/public badges, added 1-on-1 badge */
        .one-on-one-badge {
          background: linear-gradient(135deg, #10b981, #34d399);
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
        
        .call-id { /* Renamed from session-id */
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
        }
        
        /* Dark theme adjustments */
        [data-bs-theme="dark"] .call-card {
          background-color: rgba(33, 37, 41, 0.8);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        [data-bs-theme="dark"] .call-card:hover {
          background-color: rgba(33, 37, 41, 0.95);
        }
        
        /* Light theme adjustments */
        [data-bs-theme="light"] .call-card,
        .call-card {
          background-color: rgba(255, 255, 255, 0.9);
          border-color: rgba(0, 0, 0, 0.1);
        }
        
        [data-bs-theme="light"] .call-card:hover,
        .call-card:hover {
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
            <br></br>
            <div className="mb-4">
                <h2 className="gradient-header display-6 text-center mb-4">
                    Recent Calls
                </h2>
            </div>

            <div className="row g-4">
                {calls.map(call => (
                    <div key={call.id} className="col-12 col-md-6 col-xl-4">
                        <div className="card call-card h-100 shadow-sm">
                            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-4 px-4">
                                <h5 className="call-id mb-0 text-truncate" title={`Call: ${call.id}`}>
                                    Call: {call.id}
                                </h5>
                                {/* Replaced public/private with 1-on-1 badge */}
                                <span className={`badge rounded-pill px-3 py-2 one-on-one-badge`}>
                                    <i className={`bi bi-person-fill me-1`}></i>
                                    1-on-1 Call
                                </span>
                            </div>
                            
                            {/* --- Description Section --- */}
                            <div className="session-description-container">
                                <style jsx>{`
        .description-wrapper {
          position: relative;
          margin: 1rem 0;
          padding: 1rem;
          background: rgba(248, 250, 252, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.1);
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .description-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .description-wrapper:hover::before {
          opacity: 1;
        }
        
        .description-wrapper:hover {
          background: rgba(248, 250, 252, 0.8);
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .description-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        
        .description-icon {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          color: white;
          transition: all 0.3s ease;
        }
        
        .description-wrapper:hover .description-icon {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        
        .description-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .description-text {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #4b5563;
          margin: 0;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .description-text.has-content {
          font-weight: 500;
        }
        
        .description-text.no-content {
          color: #9ca3af;
          font-style: italic;
          position: relative;
        }
        
        .description-text.no-content::before {
          content: '💭';
          margin-right: 0.5rem;
          opacity: 0.6;
        }
        
        .description-wrapper:hover .description-text {
          color: #374151;
        }
        
        .description-wrapper:hover .description-text.no-content {
          color: #6b7280;
        }
        
        .expand-indicator {
          position: absolute;
          bottom: 0.5rem;
          right: 0.75rem;
          font-size: 0.7rem;
          color: #9ca3af;
          opacity: 0;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .description-wrapper:hover .expand-indicator {
          opacity: 1;
        }
        
        .truncated {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .expanded {
          -webkit-line-clamp: unset;
          overflow: visible;
        }
        
        /* Dark theme support */
        [data-bs-theme="dark"] .description-wrapper {
          background: rgba(31, 41, 55, 0.5);
          border-color: rgba(139, 92, 246, 0.2);
        }
        
        [data-bs-theme="dark"] .description-wrapper:hover {
          background: rgba(31, 41, 55, 0.8);
          border-color: rgba(139, 92, 246, 0.4);
        }
        
        [data-bs-theme="dark"] .description-label {
          color: #9ca3af;
        }
        
        [data-bs-theme="dark"] .description-text {
          color: #d1d5db;
        }
        
        [data-bs-theme="dark"] .description-text.no-content {
          color: #6b7280;
        }
        
        [data-bs-theme="dark"] .description-wrapper:hover .description-text {
          color: #e5e7eb;
        }
        
        [data-bs-theme="dark"] .description-wrapper:hover .description-text.no-content {
          color: #9ca3af;
        }
        
        /* Light theme specific */
        [data-bs-theme="light"] .description-wrapper {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(59, 130, 246, 0.1);
        }
        
        [data-bs-theme="light"] .description-wrapper:hover {
          background: rgba(255, 255, 255, 0.95);
        }
        
        .highlight-keyword {
          background: linear-gradient(135deg, #f12711, #f5af19);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
        }
        
        .fade-in {
          animation: fadeInUp 0.3s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

                                <div className="description-wrapper fade-in">
                                    <div className="description-header">
                                        <div className="description-icon">
                                            <i className="bi bi-file-text"></i>
                                        </div>
                                        <span className="description-label">Description</span>
                                    </div>

                                    <p className={`description-text truncated ${call.description ? 'has-content' : 'no-content'}`}>
                                        {call.description || 'No description available for this call.'}
                                    </p>

                                    {call.description && call.description.length > 100 && (
                                        <div className="expand-indicator">
                                            <i className="bi bi-arrows-expand"></i>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="card-body px-4">
                                <div className="creator-info">
                                    <div className="d-flex align-items-center mb-2">
                                        <i className="bi bi-person-circle me-2 text-primary"></i>
                                        <strong className="info-text">Creator:</strong>
                                        <span className="ms-2 text-primary fw-medium">{call.ownerName || 'Unknown'}</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <i className="bi bi-calendar-event me-2 text-primary"></i>
                                        <strong className="info-text">Created:</strong>
                                        <span className="ms-2 info-text">{formatTimestamp(call.createdAt)}</span>
                                    </div>
                                    {/* Updated invited logic */}
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-person-check me-2 text-primary"></i>
                                        <strong className="info-text">Invited:</strong>
                                        <span className="ms-2 info-text">{(call.allowedEmails?.length || 1) - 1} person</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer bg-transparent border-0 px-4 pb-4">
                                <div className="d-flex gap-2 flex-wrap">
                                    <Link
                                        to={`/call/${call.id}`} // Changed from /chat/ to /call/
                                        className="btn btn-join flex-fill d-flex align-items-center justify-content-center"
                                    >
                                        <i className="bi bi-box-arrow-in-right me-2"></i>
                                        Join Call
                                    </Link>
                                    {user && user.role === 'admin' && (
                                        <button
                                            onClick={() => handleDelete(call.id)}
                                            className="btn btn-outline-danger btn-delete px-3"
                                            title="Delete Call"
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

            {calls.length === 0 && !loading && (
                <div className="text-center py-5">
                    <div className="mb-4">
                        <i className="bi bi-collection display-1 text-muted"></i>
                    </div>
                    <h4 className="text-muted mb-3">No Recent Calls</h4>
                    <p className="text-muted">Calls will appear here once they are created.</p>
                </div>
            )}
        </div>
    );
}

export default RecentCalls;