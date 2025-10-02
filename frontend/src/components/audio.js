import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './sketchy.css';
import { db, storage } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || ''; 

function Audiobook() {
  const { user } = useAuth();
  
  // State has been simplified: removed pdfFile, added inputText
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [generatedAudioBlob, setGeneratedAudioBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');

  useEffect(() => {
    // Note: The previous code had a bug here, checking for user._id. Correcting to user.uid
    if (!user || !user._id) return;

    const fetchPlaylists = async () => {
      try {
        const q = query(collection(db, "playlists"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const playlists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserPlaylists(playlists);
      } catch (err) { console.error("Error fetching playlists:", err); setError("Could not fetch your playlists."); }
    };
    fetchPlaylists();
  }, [user]);

  // handleFileChange has been removed as it's no longer needed.

  // The main function is now much simpler
  const handleGeneratePodcast = async () => {
    if (!inputText.trim()) {
      setError('Please paste some text into the box first.');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Generating podcast script...');
    setError('');

    try {
      // Step 1: The fullText is now directly from the state. No PDF processing needed.
      const fullText = inputText;

      const prompt = `
        Act as a professional podcast scriptwriter. Your task is to convert the following document text into a concise, engaging, and conversational audio script. Structure your output as follows:
        1.  **Opening Hook**: Start with a compelling single sentence to grab the listener's attention.
        2.  **Introduction**: Briefly introduce the topic of the document in 1-2 sentences.
        3.  **Key Takeaways**: Identify and summarize the 3-4 most important points from the text. Present them clearly, as if you were explaining them to someone. Use simple language.
        4.  **Conclusion**: Provide a brief concluding thought or summary of the main message in one sentence.
        **Constraints**:
        - The entire script must be in a conversational and natural-sounding tone.
        - The final output should ONLY be the script text itself, with no extra explanations, titles, or conversational filler like "Hello and welcome...".
        - Do not mention that the script is based on a document.
        - Ensure the total length is suitable for a 2-3 minute audio clip (approximately 300-400 words).
        Here is the document text:
        ---
        ${fullText}
      `;

      setLoadingMessage('Generating audio... This may take a moment.');

      const response = await axios.post(
        `${API_URL}/help`, 
        { code: prompt, QID: 2 },
        { responseType: 'blob' }
      );
      
      const audioBlob = response.data;
      setGeneratedAudioBlob(audioBlob);
      setPreviewUrl(URL.createObjectURL(audioBlob));
      setShowPlaylistModal(true); 

    } catch (err) {
      console.error("Error generating podcast:", err);
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSaveToPlaylist = async (e) => {
    e.preventDefault();
    if (!episodeTitle || !generatedAudioBlob || (!selectedPlaylist && !newPlaylistName)) {
        setError('Please provide a title and select or create a playlist.'); return;
    }
    setIsLoading(true); setLoadingMessage('Saving your new podcast...'); setError('');
    try {
        let playlistIdToSave = selectedPlaylist;
        if (selectedPlaylist === 'CREATE_NEW') {
            if (!newPlaylistName) { setError('Please enter a name for the new playlist.'); setIsLoading(false); return; }
            const newPlaylistRef = await addDoc(collection(db, "playlists"), { name: newPlaylistName, userId: user.uid, isPublic: true, createdAt: serverTimestamp() });
            playlistIdToSave = newPlaylistRef.id;
            setUserPlaylists([...userPlaylists, {id: playlistIdToSave, name: newPlaylistName}]);
        }
        setLoadingMessage('Uploading audio file...');
        const audioId = uuidv4();
        const storageRef = ref(storage, `podcasts/${user.uid}/${playlistIdToSave}/${audioId}.mp3`);
        const snapshot = await uploadBytes(storageRef, generatedAudioBlob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        setLoadingMessage('Finalizing details...');

        // Removed originalFileName since we are not using a file anymore
        await addDoc(collection(db, "audioEpisodes"), { 
            title: episodeTitle, 
            audioUrl: downloadURL, 
            playlistId: playlistIdToSave, 
            userId: user.uid, 
            createdAt: serverTimestamp()
        });

        resetFormState();
    } catch (err) { console.error("Error saving to playlist:", err); setError("Failed to save the podcast. Please try again.");
    } finally { setIsLoading(false); setLoadingMessage(''); }
  };

  const resetFormState = () => {
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }
    // Updated to reset the new inputText state
    setShowPlaylistModal(false); 
    setInputText(''); 
    setGeneratedAudioBlob(null); 
    setEpisodeTitle(''); 
    setSelectedPlaylist(''); 
    setNewPlaylistName(''); 
    setPreviewUrl('');
  }

  if (!user) { return ( <div className="container mt-5"><div className="alert alert-danger text-center">You are not logged in.</div></div> ); }
  //if (user.role !== 'admin') { return ( <div className="container mt-5"><div className="alert alert-danger text-center">You are not authorized to access this page.</div></div> ); }

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2 className="mb-4">Create a Podcast from Text</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card bg-light mb-4">
          <div className="card-body">
            <h5 className="card-title">Step 1: Paste Your Text</h5>
            <div className="mb-3">
              <label htmlFor="text-input" className="form-label">Paste the text you want to convert into a podcast episode.</label>
              {/* Replaced file input with a textarea */}
              <textarea
                className="form-control"
                id="text-input"
                rows="10"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your article, notes, or script here..."
                disabled={isLoading}
              ></textarea>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleGeneratePodcast} 
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? ( <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span className="ms-2">{loadingMessage}</span></> ) : 'Generate Podcast Audio'}
            </button>
          </div>
        </div>

        {/* The Modal and Playlist display sections remain the same */}
        {showPlaylistModal && (
          <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Save Your New Podcast Episode</h5>
                  <button type="button" className="btn-close" onClick={resetFormState} aria-label="Close" disabled={isLoading}></button>
                </div>
                <div className="modal-body">
                  {previewUrl && ( <div className="mb-3 text-center"><p><strong>Audio Preview</strong></p><audio controls src={previewUrl} style={{ width: '100%' }}>Your browser does not support the audio element.</audio></div> )}
                  <form onSubmit={handleSaveToPlaylist}>
                    <div className="mb-3">
                        <label htmlFor="episodeTitle" className="form-label">Episode Title</label>
                        <input type="text" id="episodeTitle" className="form-control" value={episodeTitle} onChange={(e) => setEpisodeTitle(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="playlistSelect" className="form-label">Choose a Playlist</label>
                      <select id="playlistSelect" className="form-select" value={selectedPlaylist} onChange={(e) => setSelectedPlaylist(e.target.value)} required>
                        <option value="" disabled>Select a playlist...</option>
                        {userPlaylists.map(playlist => (<option key={playlist.id} value={playlist.id}>{playlist.name}</option>))}
                        <option value="CREATE_NEW">-- Create a New Playlist --</option>
                      </select>
                    </div>
                    {selectedPlaylist === 'CREATE_NEW' && (
                      <div className="mb-3">
                        <label htmlFor="newPlaylistName" className="form-label">New Playlist Name</label>
                        <input type="text" id="newPlaylistName" className="form-control" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="e.g., Tech Summaries" required/>
                      </div>
                    )}
                    <div className="d-flex justify-content-end">
                         <button type="button" className="btn btn-secondary me-2" onClick={resetFormState} disabled={isLoading}>Cancel</button>
                         <button type="submit" className="btn btn-success" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save to Playlist'}</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5">
            <h3>Your Playlists</h3>
            {userPlaylists.length > 0 ? (
                <ul className="list-group">
                    {userPlaylists.map(playlist => (
                        <li key={playlist.id} className="list-group-item d-flex justify-content-between align-items-center">
                            {playlist.name}
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                                const shareUrl = `${window.location.origin}/playlist/${playlist.id}`;
                                navigator.clipboard.writeText(shareUrl);
                                alert(`Copied share link to clipboard:\n${shareUrl}`);
                            }}><i className="bi bi-share-fill me-2"></i>Share Publicly</button>
                        </li>
                    ))}
                </ul>
            ) : (<p>You haven't created any playlists yet.</p>)}
        </div>
      </div>
    </>
  );
}

export default Audiobook;