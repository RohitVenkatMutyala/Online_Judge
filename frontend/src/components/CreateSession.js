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
    if (!user) return;

    // --- NEW PERMISSION LOGIC ---
    const accessType = window.prompt("Who can access this session? Type 'public' for anyone with the link, or 'private' for specific people.", 'public');

    let allowedEmails = [];
    if (accessType && accessType.toLowerCase() === 'private') {
      const emailsInput = window.prompt("Enter the emails of people who can access this session, separated by commas.");
      if (emailsInput) {
        allowedEmails = emailsInput.split(',').map(email => email.trim());
      }
    }
    // Always include the creator's email
    if (user.email && !allowedEmails.includes(user.email)) {
        allowedEmails.push(user.email);
    }
    // --- END OF NEW LOGIC ---

    const newSessionId = Math.random().toString(36).substring(2, 9);
    const sessionDocRef = doc(db, 'sessions', newSessionId);

    try {
      await setDoc(sessionDocRef, {
        code: `// Welcome, ${user.displayName || user.email}!\n// Session ID: ${newSessionId}`,
        text: 'This is a shared notes area.',
        createdAt: serverTimestamp(),
        ownerId: user.uid,
        ownerName: user.displayName || user.email,
        access: accessType.toLowerCase() === 'private' ? 'private' : 'public',
        allowedEmails: allowedEmails,
        permissions: {
          [user.uid]: 'editor'
        }
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