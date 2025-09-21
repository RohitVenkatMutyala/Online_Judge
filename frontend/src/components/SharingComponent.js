// src/components/SharingComponent.js

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

function SharingComponent({ sessionId }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersRef = collection(db, 'users');
            const userSnapshot = await getDocs(usersRef);
            setUsers(userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        };
        fetchUsers();
    }, []);

    // --- MODIFIED: Function now accepts a role ---
    const handleSendInvite = async (userId, userName, role) => {
        if (!sessionId || !userId) return;

        try {
            const sessionDocRef = doc(db, 'sessions', sessionId);
            // Use dot notation to add or update a field in the permissions map
            await updateDoc(sessionDocRef, {
                [`permissions.${userId}`]: role 
            });
            toast.success(`Added ${userName} as an ${role}!`);
        } catch (error) {
            console.error("Error sending invite:", error);
            toast.error("Failed to send invite.");
        }
    };

    if (loading) {
        return <div>Loading users...</div>;
    }

    return (
        <div className="card border-info">
            <div className="card-header">
                <h5>Share Session</h5>
            </div>
            <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <ul className="list-group list-group-flush">
                    {users.map(user => (
                        <li key={user.id} className="list-group-item">
                            <div>
                                {user.firstname} {user.lastname}
                                <small className="d-block text-muted">{user.email}</small>
                            </div>
                            {/* --- ADDED: Buttons for each permission level --- */}
                            <div className="btn-group mt-2" role="group">
                                <button 
                                    className="btn btn-sm btn-outline-secondary" 
                                    onClick={() => handleSendInvite(user.id, user.firstname, 'viewer')}
                                >
                                    Add as Viewer
                                </button>
                                <button 
                                    className="btn btn-sm btn-outline-primary" 
                                    onClick={() => handleSendInvite(user.id, user.firstname, 'editor')}
                                >
                                    Add as Editor
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SharingComponent;