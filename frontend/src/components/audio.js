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
import axios from 'axios'; // Import axios

// Import and configure the pdf.js library
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Define your API base URL - adjust if it's stored elsewhere (e.g., .env file)
const API_URL = process.env.REACT_APP_API_URL || ''; 

function Audiobook() {
  const { user } = useAuth();

  // (No changes to state variables)
  const [pdfFile, setPdfFile] = useState(null);
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

  // (No changes to useEffect, handleFileChange)
  useEffect(() => {
    if (!user) return;
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setEpisodeTitle(file.name.replace(/\.pdf$/i, ''));
      setError('');
    } else { setPdfFile(null); setError('Please select a valid PDF file.'); }
  };

  // --- **** MODIFIED FUNCTION STARTS HERE **** ---
  const handleGeneratePodcast = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file first.');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Reading PDF text...');
    setError('');

    try {
      // Step 1: Extract text from PDF on the client-side (no changes here)
      const reader = new FileReader();
      reader.readAsArrayBuffer(pdfFile);
      const fullText = await new Promise((resolve, reject) => {
        reader.onload = async (event) => {
          try {
            const pdf = await pdfjsLib.getDocument({ data: event.target.result }).promise;
            let extractedText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              extractedText += textContent.items.map(item => item.str).join(' ');
            }
            resolve(extractedText);
          } catch (error) { reject(new Error('Could not parse the PDF file.')); }
        };
        reader.onerror = () => reject(new Error('Failed to read the file.'));
      });

      setLoadingMessage('Generating podcast script...');

      // Step 2: Manipulate the prompt with detailed instructions for the AI
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
        - the QID mentioned in these was dummy dont include anything related to that question id 2
        Here is the document text:
        ---
        ${fullText}
      `;

      setLoadingMessage('Generating audio... This may take a moment.');

      // Step 3: Send the request to your backend using the specified configuration
      const response = await axios.post(
        `${API_URL}/help`, 
        { 
          code: prompt, // The detailed prompt
          QID: 2        // The dummy question ID
        },
        {
          responseType: 'blob' // Important: tells axios to handle the response as a file/blob
        }
      );
      
      const audioBlob = response.data; // With axios and responseType: 'blob', the data is the blob itself

      // Step 4: Handle the returned audio blob
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
  // --- **** MODIFIED FUNCTION ENDS HERE **** ---


  // (No changes to handleSaveToPlaylist or resetFormState)
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
        await addDoc(collection(db, "audioEpisodes"), { title: episodeTitle, audioUrl: downloadURL, playlistId: playlistIdToSave, userId: user.uid, createdAt: serverTimestamp(), originalFileName: pdfFile.name });
        resetFormState();
    } catch (err) { console.error("Error saving to playlist:", err); setError("Failed to save the podcast. Please try again.");
    } finally { setIsLoading(false); setLoadingMessage(''); }
  };

  const resetFormState = () => {
    setShowPlaylistModal(false); setPdfFile(null); setGeneratedAudioBlob(null); setEpisodeTitle(''); setSelectedPlaylist(''); setNewPlaylistName(''); setPreviewUrl('');
    if (document.getElementById('pdf-upload')) { document.getElementById('pdf-upload').value = null; }
  }


  // (No changes to access control or JSX)
  if (!user) { return ( <div className="container mt-5"><div className="alert alert-danger text-center">You are not logged in.</div></div> ); }
  //if (user.role !== 'admin') { return ( <div className="container mt-5"><div className="alert alert-danger text-center">You are not authorized to access this page.</div></div> ); }

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2 className="mb-4">Create a Podcast from PDF</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card bg-light mb-4">
          <div className="card-body">
            <h5 className="card-title">Step 1: Upload a Document</h5>
            <div className="mb-3">
              <label htmlFor="pdf-upload" className="form-label">Select a PDF file to convert into a podcast episode.</label>
              <input type="file" className="form-control" id="pdf-upload" accept=".pdf" onChange={handleFileChange} disabled={isLoading} />
            </div>
            <button className="btn btn-primary" onClick={handleGeneratePodcast} disabled={!pdfFile || isLoading}>
              {isLoading ? ( <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span className="ms-2">{loadingMessage}</span></> ) : 'Generate Podcast Audio'}
            </button>
          </div>
        </div>

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