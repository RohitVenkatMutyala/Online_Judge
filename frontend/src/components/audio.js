import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './sketchy.css';
import { db, storage } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

function Audiobook() {
  const { user } = useAuth();
  const theme = 'dark'; // Hardcoded theme for styling

  // State for managing playlists and files
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistItems, setPlaylistItems] = useState([]);

  // State for the "Add File" modal
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  
  // General UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchPlaylists = async () => {
      if (!user || !user._id) return;
      try {
        // Updated query to fetch playlists where the user is a member
        const q = query(collection(db, "playlists"), where("memberIds", "array-contains", user._id), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const playlists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (isMounted) {
          setUserPlaylists(playlists);
        }
      } catch (err) {
        console.error("Error fetching playlists:", err);
        if (isMounted) {
          setError("Could not fetch your playlists.");
        }
      }
    };

    fetchPlaylists();
    return () => { isMounted = false; };
  }, [user]);

  const fetchPlaylistItems = async (playlistId) => {
    setIsLoading(true);
    setLoadingMessage('Loading files...');
    try {
      const q = query(collection(db, "playlistItems"), where("playlistId", "==", playlistId), orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlaylistItems(items);
    } catch (err) {
      console.error("Error fetching playlist items:", err);
      setError("Could not load files for this playlist.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!user || !user._id) {
        setError("User not loaded. Please try again.");
        return;
    }
    if (!newPlaylistName.trim()) return;
    
    setIsLoading(true);
    setLoadingMessage('Creating playlist...');
    try {
      // Initialize playlist with a memberIds array containing the owner
      await addDoc(collection(db, "playlists"), {
        name: newPlaylistName,
        userId: user._id, // owner
        memberIds: [user._id], // members
        isPublic: true,
        createdAt: serverTimestamp(),
      });
      setNewPlaylistName('');
      // Refresh the list after creation
      const q = query(collection(db, "playlists"), where("memberIds", "array-contains", user._id), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const playlists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserPlaylists(playlists);
    } catch (err) {
      console.error("Error creating playlist:", err);
      setError('Failed to create playlist.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSelectPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
    setPlaylistItems([]); // Clear previous items before fetching new ones
    fetchPlaylistItems(playlist.id);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!user || !user._id) {
        setError("User not loaded. Please try again.");
        return;
    }
    if (!fileToUpload || !fileTitle.trim()) {
      setError("Please select a file and provide a title.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Uploading file...');
    try {
      const fileId = uuidv4();
      const storageRef = ref(storage, `playlistFiles/${user._id}/${selectedPlaylist.id}/${fileId}-${fileToUpload.name}`);
      const snapshot = await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "playlistItems"), {
        title: fileTitle,
        fileUrl: downloadURL,
        fileName: fileToUpload.name,
        fileType: fileToUpload.type,
        playlistId: selectedPlaylist.id,
        userId: user._id,
        createdAt: serverTimestamp(),
      });
      
      setShowAddFileModal(false);
      setFileToUpload(null);
      setFileTitle('');
      fetchPlaylistItems(selectedPlaylist.id);
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("File upload failed.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  if (!user) { return ( <div className="container mt-5"><div className="alert alert-danger text-center">You are not logged in.</div></div> ); }

  return (
    <>
      <style>{`
        /* Your Provided CSS Styles */
        .theme-dark .dashboard-page { background-color: #12121c; }
        .theme-light .dashboard-page { background-color: #f8f9fa; }
        .dashboard-container { min-height: 85vh; }
        .theme-dark .dashboard-container { background-color: #1e1e2f; border: 1px solid #3a3a5a; color: #fff; }
        .theme-light .dashboard-container { background-color: #ffffff; border: 1px solid #dee2e6; color: #212529; }
        .btn-share { background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s ease; padding: 0.25rem 0.75rem; font-size: 0.8rem; }
        .theme-light .btn-share { background: #e9ecef; color: #495057; border-color: #dee2e6; }
        .btn-share:hover { transform: translateY(-2px); background: linear-gradient(90deg, #3b82f6, #8b5cf6); color: white; border-color: transparent; }
        .theme-dark .list-group-item { background-color: #2c3340; color: #fff; border-color: #3a3a5a; }
        .theme-dark .list-group-item.active { background-color: #3b82f6; border-color: #3b82f6; }
        .theme-light .list-group-item { background-color: #fff; color: #212529; border-color: #dee2e6; }
      `}</style>
      <Navbar />
      <div className={`theme-${theme} dashboard-page py-4`}>
        <div className="container">
            <div className="dashboard-container p-4 rounded-3 shadow-sm">
                <h2 className="mb-4">Playlist Manager</h2>
                {error && <div className="alert alert-danger" onClick={() => setError('')}>{error}</div>}

                <div className="row">
                  <div className="col-md-4">
                    <div className="card bg-transparent mb-4">
                      <div className="card-body">
                        <h5 className="card-title">Create New Playlist</h5>
                        <form onSubmit={handleCreatePlaylist}>
                          <div className="input-group">
                            <input type="text" className="form-control" placeholder="Playlist Name" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} disabled={isLoading} />
                            <button className="btn btn-primary" type="submit" disabled={isLoading || !newPlaylistName.trim()}>Create</button>
                          </div>
                        </form>
                      </div>
                    </div>
                    <h3>Your Playlists</h3>
                    <div className="list-group">
                      {userPlaylists.map(playlist => (
                        <button key={playlist.id} type="button" className={`list-group-item list-group-item-action ${selectedPlaylist?.id === playlist.id ? 'active' : ''}`} onClick={() => handleSelectPlaylist(playlist)}>
                          {playlist.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-8">
                    {selectedPlaylist ? (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h3>Files in "{selectedPlaylist.name}"</h3>
                          <div>
                            <button className="btn btn-success me-2" onClick={() => setShowAddFileModal(true)}><i className="bi bi-plus-lg me-2"></i>Add New File</button>
                            <button className="btn btn-share" onClick={() => {
                                const shareUrl = `${window.location.origin}/playlist/${selectedPlaylist.id}`;
                                navigator.clipboard.writeText(shareUrl);
                                alert(`Copied share link to clipboard:\n${shareUrl}`);
                            }}><i className="bi bi-share-fill me-2"></i>Share</button>
                          </div>
                        </div>
                        {isLoading && loadingMessage ? <p>{loadingMessage}</p> : (
                            <ul className="list-group">
                                {playlistItems.length > 0 ? playlistItems.map(item => (
                                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" key={item.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                        {item.title}
                                        <span className="badge bg-secondary rounded-pill">{item.fileName}</span>
                                    </a>
                                )) : <li className="list-group-item">This playlist is empty. Add a file to get started.</li>}
                            </ul>
                        )}
                      </div>
                    ) : (
                      <div className="text-center mt-5 pt-5">
                        <h4>Select a playlist to view its files, or create a new one.</h4>
                      </div>
                    )}
                  </div>
                </div>
              </div>
        </div>
      </div>

      {showAddFileModal && selectedPlaylist && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleFileUpload}>
                <div className="modal-header">
                  <h5 className="modal-title">Add File to "{selectedPlaylist.name}"</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddFileModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="fileTitle" className="form-label">File Title</label>
                    <input type="text" id="fileTitle" className="form-control" value={fileTitle} onChange={(e) => setFileTitle(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="fileUpload" className="form-label">Select File</label>
                    <input type="file" id="fileUpload" className="form-control" onChange={(e) => setFileToUpload(e.target.files[0])} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddFileModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Uploading...' : 'Upload'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Audiobook;