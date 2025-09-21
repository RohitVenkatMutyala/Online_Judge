import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateSession({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }

    const newSessionId = Math.random().toString(36).substring(2, 9);
    const sessionDocRef = doc(db, 'sessions', newSessionId);

    const createSessionInDb = async () => {
      await setDoc(sessionDocRef, {
        code: `// Welcome, ${user.firstname}!\n// Session ID: ${newSessionId}`,
        text: 'This is a shared notes area.',
        createdAt: serverTimestamp(),
        ownerId: user._id,
        // --- ADD THIS LINE ---
        ownerName: `${user.firstname} ${user.lastname}`, 
        permissions: {
          [user._id]: 'editor'
        }
      });
      navigate(`/chat/${newSessionId}`);
    };

    createSessionInDb();
    
  }, [user, navigate]);
  // You can show a loading message while the redirect happens
  return (
    <div className="container mt-5">
      <h2 className="text-center">Creating a new session...</h2>
    </div>
  );
}

export default CreateSession;