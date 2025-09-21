import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext'; // --- ADD THIS IMPORT ---

// --- CHANGE 1: Remove 'user' from props ---
function CreateSession() { 
  const navigate = useNavigate();
  // --- CHANGE 2: Call useAuth() inside the component ---
  const { user } = useAuth(); 

  useEffect(() => {
    // The rest of the logic remains the same.
    // It now uses the 'user' from the useAuth() hook.
    const createAndNavigate = async () => {
      if (!user) {
        // This check is still important for when the user state is loading
        return;
      }

      const newSessionId = Math.random().toString(36).substring(2, 9);
      const sessionDocRef = doc(db, 'sessions', newSessionId);

      await setDoc(sessionDocRef, {
        code: `// Welcome, ${user.firstname}!\n// Session ID: ${newSessionId}`,
        text: 'This is a shared notes area.',
        createdAt: serverTimestamp(),
        ownerId: user._id,
        ownerName: `${user.firstname} ${user.lastname}`,
        permissions: {
          [user._id]: 'editor'
        }
      });
      
      navigate(`/chat/${newSessionId}`);
    };

    // This condition prevents running the function before the user object is available.
    if (user) {
        createAndNavigate();
    }
    
  }, [user, navigate]);

  return (
    <div className="container mt-5">
      <h2 className="text-center">Creating a secure session...</h2>
    </div>
  );
}

export default CreateSession;