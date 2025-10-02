import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, arrayUnion } from 'firebase/firestore';
import Navbar from './navbar';

function PublicPlaylist() {
  const { playlistId } = useParams();
  const { user } = useAuth();
  const theme = 'dark'; // Hardcoded theme for styling

  const [playlist, setPlaylist] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

        const itemsQuery = query(collection(db, "playlistItems"), where("playlistId", "==", playlistId), orderBy("createdAt", "asc"));
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

  const handleJoinPlaylist = async () => {
    if (!user || !user._id) {
      alert("Please log in to join a playlist.");
      return;
    }
    setIsSaving(true);
    try {
      const playlistDocRef = doc(db, 'playlists', playlistId);
      // Atomically add the user's ID to the memberIds array
      await updateDoc(playlistDocRef, {
        memberIds: arrayUnion(user._id)
      });
      // Update local state to immediately reflect the change
      setPlaylist(prev => ({
        ...prev,
        memberIds: [...(prev.memberIds || []), user._id]
      }));
    } catch (err) {
      console.error("Error joining playlist:", err);
      alert("Failed to join the playlist.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) { return <div className="container mt-5 text-center"><h4>Loading Playlist...</h4></div>; }
  if (error) { return <div className="container mt-5"><div className="alert alert-danger text-center">{error}</div></div>; }
  if (!playlist) { return null; }

  const isOwner = user && user._id === playlist.userId;
  const isMember = user && playlist.memberIds?.includes(user._id);
  
  return (
    <>
      <style>{`
        /* Your Provided CSS Styles */
        .theme-dark .dashboard-page { background-color: #12121c; }
        .theme-light .dashboard-page { background-color: #f8f9fa; }
        .dashboard-container { min-height: 85vh; }
        .theme-dark .dashboard-container { background-color: #1e1e2f; border: 1px solid #3a3a5a; color: #fff; }
        .theme-light .dashboard-container { background-color: #ffffff; border: 1px solid #dee2e6; color: #212529; }
        .btn-randoman-ai { background: linear-gradient(90deg, #6e48aa, #9448a0); color: #ffffff; border: none; font-weight: 500; border-radius: 8px; padding: 10px 15px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }
        .btn-randoman-ai:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); }
        .theme-dark .list-group-item { background-color: #2c3340; color: #fff; border-color: #3a3a5a; }
        .theme-light .list-group-item { background-color: #fff; color: #212529; border-color: #dee2e6; }
      `}</style>
      <Navbar />
      <div className={`theme-${theme} dashboard-page py-4`}>
        <div className="container">
            <div className="dashboard-container p-4 rounded-3 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>{playlist.name}</h2>
                    {user && (
                      <button 
                        className={`btn ${isMember ? 'btn-secondary' : 'btn-randoman-ai'}`}
                        onClick={handleJoinPlaylist}
                        disabled={isMember || isSaving}
                      >
                        {isOwner ? "You Own This Playlist" : isMember ? "You are a Member" : isSaving ? "Joining..." : <><i className="bi bi-plus-circle-fill me-2"></i>Join Playlist</>}
                      </button>
                    )}
                </div>
                <p>A publicly shared playlist. Members: {playlist.memberIds?.length || 0}</p>
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
        </div>
      </div>
    </>
  );
}

export default PublicPlaylist;