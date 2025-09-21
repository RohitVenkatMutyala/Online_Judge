import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateSession() {
  const navigate = useNavigate();

  useEffect(() => {
    // Generate a simple, random, URL-friendly ID (e.g., 'a1b2c3d')
    const newSessionId = Math.random().toString(36).substring(2, 9);
    
    // Redirect the user to the new chat room URL
    navigate(`/chat/${newSessionId}`);
  }, [navigate]);

  // You can show a loading message while the redirect happens
  return (
    <div className="container mt-5">
      <h2 className="text-center">Creating a new session...</h2>
    </div>
  );
}

export default CreateSession;