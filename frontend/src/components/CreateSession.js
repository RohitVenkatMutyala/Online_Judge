// src/components/CreateSession.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

        // 1. Get session type
        const accessType = window.prompt("Session access: 'public' or 'private'?", 'public')?.toLowerCase() || 'public';

        // 2. Get the role for all other users
        const defaultRole = window.prompt("What permission should other users have? ('editor' or 'viewer')", 'viewer')?.toLowerCase() || 'viewer';

        // 3. Initialize the list of allowed emails with the creator's email
        let allowedEmails = [user.email];

        // 4. If private, add the invited emails to the list
        if (accessType === 'private') {
            const emailsInput = window.prompt("Enter emails to invite (comma-separated):");
            if (emailsInput) {
                const invitedEmails = emailsInput.split(',').map(email => email.trim()).filter(Boolean);
                allowedEmails = [...allowedEmails, ...invitedEmails];
            }
        }
        
        const newSessionId = Math.random().toString(36).substring(2, 9);
        const sessionDocRef = doc(db, 'sessions', newSessionId);

        try {
            await setDoc(sessionDocRef, {
                code: `// Welcome, ${user.firstname}!\n// Session ID: ${newSessionId}`,
                text: 'This is a shared notes area.',
                createdAt: serverTimestamp(),
                ownerId: user._id, // Still need owner ID for the 'editor' override
                ownerName: `${user.firstname} ${user.lastname}`,
                access: accessType,
                defaultRole: defaultRole,
                allowedEmails: allowedEmails // Save the array of emails
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