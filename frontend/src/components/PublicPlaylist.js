import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import Navbar from './navbar';

function PublicPlaylist() {
  const { playlistId } = useParams();
  const { user } = useAuth(); // Get the current logged-in user

  // State for displaying the playlist
  const [playlist, setPlaylist] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // New state for the "Save" button functionality
  const [isSaving, setIsSaving] = useState(false);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);

  // Effect to fetch the main playlist data
  useEffect(() => {
    const fetchPlaylistData = async () => {
      if (!playlistId) return;
      setIsLoading(true);
      
      try {
        const playlistDocRef = doc(db, 'playlists', playlistId);
        const playlistDocSnap = await getDoc(playlistDocRef);

        if (!playlistDocSnap.exists() || !playlistDocSnap.data().isPublic) {
          setError("This playlist could not be found or is not public.");
          return;
        }
        
        const playlistData = playlistDocSnap.data();
        setPlaylist({ id: playlistDocSnap.id, ...playlistData });

        const itemsQuery = query(
          collection(db, "playlistItems"), 
          where("playlistId", "==", playlistId), 
          orderBy("createdAt", "asc")
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        const playlistItems = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(playlistItems);
      } catch (err) {
        console.error("Error fetching public playlist:", err);
        setError("Could not load the playlist.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistData();
  }, [playlistId]);

  // New effect to check if the user has already saved this playlist
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !playlist) return; // Only run if user is logged in and playlist is loaded
      
      const savedPlaylistRef = doc(db, `users/${user._id}/savedPlaylists`, playlist.id);
      const docSnap = await getDoc(savedPlaylistRef);
      setIsAlreadySaved(docSnap.exists());
    };

    checkIfSaved();
  }, [user, playlist]); // Re-run when user or playlist changes

  // Function to handle saving the playlist
  const handleSavePlaylist = async () => {
    if (!user) {
      alert("Please log in to save a playlist.");
      return;
    }

    setIsSaving(true);
    try {
      // We use setDoc here because the document ID is the playlist ID, preventing duplicates
      const savedPlaylistRef = doc(db, `users/${user._id}/savedPlaylists`, playlist.id);
      await setDoc(savedPlaylistRef, {
        originalPlaylistId: playlist.id,
        savedAt: serverTimestamp(),
        playlistName: playlist.name, // Store a copy of the name for easy display
        ownerId: playlist.userId
      });
      setIsAlreadySaved(true);
    } catch (err) {
      console.error("Error saving playlist:", err);
      alert("Failed to save the playlist.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="container mt-5 text-center"><h4>Loading Playlist...</h4></div>;
  }

  if (error) {
    return <div className="container mt-5"><div className="alert alert-danger text-center">{error}</div></div>;
  }

  // Determine button state
  const isOwner = user && user._id === playlist.userId;
  
  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{playlist.name}</h2>
            {/* --- Conditional Button Logic --- */}
            {user && ( // Only show the button if the user is logged in
              <button 
                className={`btn ${isAlreadySaved ? 'btn-secondary' : 'btn-success'}`}
                onClick={handleSavePlaylist}
                disabled={isOwner || isAlreadySaved || isSaving}
              >
                {isOwner ? "This is Your Playlist" : isAlreadySaved ? "Saved to Your Library" : isSaving ? "Saving..." : <><i className="bi bi-plus-circle-fill me-2"></i>Save to My Playlists</>}
              </button>
            )}
        </div>
        <p>A publicly shared playlist.</p>
        <ul className="list-group">
            {items.length > 0 ? items.map(item => (
                <a 
                    href={item.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    key={item.id} 
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                >
                    {item.title}
                    <span className="badge bg-primary rounded-pill">
                        <i className="bi bi-download me-2"></i>{item.fileName}
                    </span>
                </a>
            )) : <li className="list-group-item">This playlist is empty.</li>}
        </ul>
      </div>
    </>
  );
}

export default PublicPlaylist;