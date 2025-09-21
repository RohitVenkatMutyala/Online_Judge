// src/components/CreateSession.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp, collection, where, query, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function CreateSession() { 
    const navigate = useNavigate();
    const { user } = useAuth(); 

    const createAndNavigate = async () => {
        if (!user) {
            toast.error("You must be logged in to create a session.");
            return;
        }

        // --- UNIFIED PERMISSION LOGIC ---

        const accessType = window.prompt("Is this session 'public' or 'private'?", 'public')?.toLowerCase() || 'public';
        const defaultRole = window.prompt("What permission should others have? ('editor' or 'viewer')", 'viewer')?.toLowerCase() || 'viewer';
        
        // The creator is always an editor.
        const permissions = { [user._id]: 'editor' };

        if (accessType === 'private') {
            const emailsInput = window.prompt("Enter emails to invite (comma-separated):");
            if (emailsInput) {
                const emails = emailsInput.split(',').map(email => email.trim()).filter(Boolean);
                
                if (emails.length > 0) {
                    // Find the user documents that match the invited emails
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('email', 'in', emails));
                    const userSnapshot = await getDocs(q);
                    
                    // Add the found user's ID and their assigned role to the permissions map
                    userSnapshot.forEach(doc => {
                        permissions[doc.id] = defaultRole;
                    });
                    toast.info(`Invited ${userSnapshot.size} user(s) as ${defaultRole}s.`);
                }
            }
        }
        
        const newSessionId = Math.random().toString(36).substring(2, 9);
        const sessionDocRef = doc(db, 'sessions', newSessionId);

        try {
            await setDoc(sessionDocRef, {
                code: `// Welcome, ${user.firstname}!\n// Session ID: ${newSessionId}`,
                text: 'This is a shared notes area.',
                createdAt: serverTimestamp(),
                ownerId: user._id,
                ownerName: `${user.firstname} ${user.lastname}`,
                access: accessType, // 'public' or 'private'
                defaultRole: defaultRole, // 'editor' or 'viewer' for public sessions
                permissions: permissions // The map of user IDs to roles
            });
            
            navigate(`/chat/${newSessionId}`);
        } catch (error) {
            console.error("Failed to create session:", error);
            toast.error("Could not create the session. Please try again.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card text-center">
                <div className="card-body">
                    <h5 className="card-title">Start a New Collaboration</h5>
                    <p className="card-text">Click below to start a new live coding session.</p>
                    <button className="btn btn-primary" onClick={createAndNavigate}>
                        Create New Session
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateSession;