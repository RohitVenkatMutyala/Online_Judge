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

        // 1. Determine if the session is public or private
        const accessType = window.prompt("Who can access this session? Type 'public' for anyone, or 'private' for specific people.", 'public')?.toLowerCase() || 'public';

        // 2. Determine the default role for OTHER users
        const defaultRole = window.prompt("What permission should other users have? Type 'editor' or 'viewer'.", 'viewer')?.toLowerCase() || 'viewer';

        // 3. Initialize permissions map. The creator is always an editor.
        const permissions = { [user._id]: 'editor' };

        // 4. If private, find invited users by email and add their IDs to the permissions map
        if (accessType === 'private') {
            const emailsInput = window.prompt("Enter the emails of people to invite, separated by commas:");
            if (emailsInput) {
                const emails = emailsInput.split(',').map(email => email.trim()).filter(email => email && email !== user.email);
                
                if (emails.length > 0) {
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('email', 'in', emails));
                    const userSnapshot = await getDocs(q);
                    
                    let foundUsers = 0;
                    userSnapshot.forEach(doc => {
                        permissions[doc.id] = defaultRole;
                        foundUsers++;
                    });
                    toast.info(`Found and invited ${foundUsers} user(s) as ${defaultRole}s.`);
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
                access: accessType,
                defaultRole: defaultRole,
                permissions: permissions
            });
            
            navigate(`/chat/${newSessionId}`);
        } catch (error) {
            console.error("Failed to create session:", error);
            toast.error("Could not create the session. Please try again.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card text-center shadow-sm">
                <div className="card-body p-4">
                    <h5 className="card-title">Start a New Collaboration</h5>
                    <p className="card-text">Click the button below to start a new live coding session.</p>
                    <button className="btn btn-primary" onClick={createAndNavigate}>
                        Create New Session
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateSession;