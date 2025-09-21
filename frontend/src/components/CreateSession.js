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

        const accessType = window.prompt("Session access: 'public' or 'private'?", 'public');
        const permissions = { [user._id]: 'editor' }; // Creator is always an editor
        let allowedEmails = [user.email];

        if (accessType && accessType.toLowerCase() === 'private') {
            const emailsInput = window.prompt("Enter emails to invite (comma-separated):");
            if (emailsInput) {
                const emails = emailsInput.split(',').map(email => email.trim());
                // --- ADDED: Ask for permission level ---
                const permissionLevel = window.prompt("Assign permission: 'editor' or 'viewer'?", 'viewer');
                
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('email', 'in', emails));
                const userSnapshot = await getDocs(q);
                
                userSnapshot.forEach(doc => {
                    permissions[doc.id] = permissionLevel.toLowerCase() === 'editor' ? 'editor' : 'viewer';
                    if (!allowedEmails.includes(doc.data().email)) {
                        allowedEmails.push(doc.data().email);
                    }
                });
                toast.info(`Invited ${userSnapshot.size} user(s) as ${permissionLevel}s.`);
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
                access: accessType.toLowerCase() === 'private' ? 'private' : 'public',
                allowedEmails: allowedEmails,
                permissions: permissions // Updated permissions map
            });
            
            navigate(`/chat/${newSessionId}`);
        } catch (error) {
            console.error("Failed to create session:", error);
            toast.error("Could not create the session.");
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