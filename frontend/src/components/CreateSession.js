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
    // This check is important to make sure the user object is loaded
    if (!user) {
      toast.error("You must be logged in to create a session.");
      return;
    }

    const accessType = window.prompt("Who can access this session? Type 'public' for anyone with the link, or 'private' for specific people.", 'public');

    let allowedEmails = [];
    if (accessType && accessType.toLowerCase() === 'private') {
      const emailsInput = window.prompt("Enter the emails of people who can access this session, separated by commas.");
      if (emailsInput) {
        allowedEmails = emailsInput.split(',').map(email => email.trim());
      }
    }
    
    if (user.email && !allowedEmails.includes(user.email)) {
        allowedEmails.push(user.email);
    }
    
    const newSessionId = Math.random().toString(36).substring(2, 9);
    const sessionDocRef = doc(db, 'sessions', newSessionId);

    try {
      // --- UPDATED THIS BLOCK WITH CORRECT USER PROPERTIES ---
      await setDoc(sessionDocRef, {
        code: `// Welcome, ${user.firstname}!\n// Session ID: ${newSessionId}`,
        text: 'This is a shared notes area.',
        createdAt: serverTimestamp(),
        ownerId: user._id, // Changed from user.uid
        ownerName: `${user.firstname} ${user.lastname}`, // Changed from user.displayName
        access: accessType.toLowerCase() === 'private' ? 'private' : 'public',
        allowedEmails: allowedEmails,
        permissions: {
          [user._id]: 'editor' // Changed from user.uid
        }
      });
      // --- END OF UPDATE ---
      
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