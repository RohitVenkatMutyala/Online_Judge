import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { db, storage } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, writeBatch, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

// Helper function to format Firestore Timestamps
const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

function Audiobook() {
    const { user } = useAuth();
    const theme = 'dark';

    const [userFolders, setUserFolders] = useState([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [folderItems, setFolderItems] = useState([]);
    const [userMap, setUserMap] = useState({}); // To store user names {userId: 'DisplayName'}

    const [showAddFileModal, setShowAddFileModal] = useState(false);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [fileTitle, setFileTitle] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        const fetchFolders = async () => {
            if (!user || !user._id) return;
            try {
                const q = query(collection(db, "playlists"), where("memberIds", "array-contains", user._id), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const folders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (isMounted) setUserFolders(folders);
            } catch (err) {
                console.error("Error fetching folders:", err);
                if (isMounted) setError("Could not fetch your folders.");
            }
        };
        fetchFolders();
        return () => { isMounted = false; };
    }, [user]);

    // --- UPDATED: This function now also fetches user names ---
    const fetchFolderItems = async (folderId) => {
        setIsLoading(true);
        setLoadingMessage('Loading files...');
        try {
            const q = query(collection(db, "playlistItems"), where("playlistId", "==", folderId), orderBy("createdAt", "asc"));
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFolderItems(items);

            // Fetch user data for the 'Added by' column
            const userIds = [...new Set(items.map(item => item.userId))]; // Get unique user IDs
            const newUsers = {};
            for (const userId of userIds) {
                if (!userMap[userId]) { // Only fetch if we don't have the user's name already
                    const userDocRef = doc(db, "users", userId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        newUsers[userId] = userDocSnap.data().displayName || 'Unknown User';
                    } else {
                        newUsers[userId] = 'Unknown User';
                    }
                }
            }
            setUserMap(prevMap => ({ ...prevMap, ...newUsers }));

        } catch (err) {
            console.error("Error fetching folder items:", err);
            setError("Could not load files for this folder.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!user || !user._id) { setError("User not loaded."); return; }
        if (!newFolderName.trim()) return;
        try {
            await addDoc(collection(db, "playlists"), {
                name: newFolderName,
                originalOwner: user._id,
                memberIds: [user._id],
                isPublic: true,
                createdAt: serverTimestamp(),
            });
            setNewFolderName('');
            const q = query(collection(db, "playlists"), where("memberIds", "array-contains", user._id), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            setUserFolders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error("Error creating folder:", err);
            setError('Failed to create folder.');
        }
    };

    const handleSelectFolder = (folder) => {
        setSelectedFolder(folder);
        setFolderItems([]);
        fetchFolderItems(folder.id);
    };

    const handleFileUpload = async (e) => {
        // ... (This function's logic remains the same, just variable names updated)
        e.preventDefault();
        if (!user || !user._id) { setError("User not loaded."); return; }
        if (!fileToUpload || !fileTitle.trim()) { setError("Please provide a file and a title."); return; }
        setIsLoading(true);
        setLoadingMessage('Uploading file...');
        try {
            const fileId = uuidv4();
            const storageRef = ref(storage, `playlistFiles/${selectedFolder.originalOwner}/${selectedFolder.id}/${fileId}-${fileToUpload.name}`);
            const snapshot = await uploadBytes(storageRef, fileToUpload);
            const downloadURL = await getDownloadURL(snapshot.ref);
            await addDoc(collection(db, "playlistItems"), {
                title: fileTitle, fileUrl: downloadURL, fileName: fileToUpload.name,
                fileType: fileToUpload.type, playlistId: selectedFolder.id, userId: user._id,
                createdAt: serverTimestamp(),
            });
            setShowAddFileModal(false); setFileToUpload(null); setFileTitle('');
            fetchFolderItems(selectedFolder.id);
        } catch (err) {
            console.error("Error uploading file:", err);
            setError("File upload failed.");
        } finally {
            setIsLoading(false); setLoadingMessage('');
        }
    };

    const handleDeleteFile = async (fileToDelete) => {
        // ... (This function's logic remains the same)
    };

    const handleDeleteFolder = async (folderToDelete) => {
        // ... (This function's logic remains the same)
    };

    if (!user) { return (<div className="container mt-5"><div className="alert alert-danger text-center">You are not logged in.</div></div>); }

    return (
        <>
            <style>{`
        .theme-dark .dashboard-page { background-color: #12121c; color: #e0e0e0; }
        .dashboard-container { min-height: 85vh; background-color: #1e1e2f; border: 1px solid #3a3a5a; }
        
        /* New Folder Grid Styles */
        .folder-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1.5rem; }
        .folder-item { cursor: pointer; text-align: center; transition: transform 0.2s ease; }
        .folder-item:hover { transform: translateY(-5px); }
        .folder-icon { font-size: 5rem; color: #ffca28; }
        .folder-name { margin-top: 0.5rem; font-size: 0.9rem; word-break: break-word; }
        .folder-item.active .folder-icon { color: #4dabf7; }
        .folder-item.active .folder-name { font-weight: bold; }
        
        /* New File Table Styles */
        .file-table { color: #e0e0e0; }
        .file-table thead { color: #8c98a9; }
        .file-table tbody tr:hover { background-color: rgba(255, 255, 255, 0.05); }
        .file-icon { font-size: 1.5rem; color: #8c98a9; }
        .file-title a { color: #e0e0e0; text-decoration: none; }
        .file-title a:hover { text-decoration: underline; }
        .file-meta { font-size: 0.85rem; color: #8c98a9; }
        .btn-share { background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); }
      `}</style>
            <Navbar />
            <div className={`theme-${theme} dashboard-page py-4`}>
                <div className="container">
                    <div className="dashboard-container p-4 rounded-3 shadow-sm">
                        {!selectedFolder ? (
                            <>
                                <h2 className="mb-4">Your Folders</h2>
                                <div className="folder-grid">
                                    {userFolders.map(folder => (
                                        <div key={folder.id} className={`folder-item ${selectedFolder?.id === folder.id ? 'active' : ''}`} onClick={() => handleSelectFolder(folder)}>
                                            <i className="bi bi-folder-fill folder-icon"></i>
                                            <div className="folder-name">{folder.name}</div>
                                        </div>
                                    ))}
                                    {/* Add New Folder UI */}
                                    <div className="folder-item" onClick={() => { /* logic to show create folder modal */ }}>
                                        <form onSubmit={handleCreateFolder}>
                                            <div className="input-group">
                                                <input type="text" className="form-control" placeholder="New Folder" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} disabled={isLoading} />
                                                <button className="btn btn-primary" type="submit" disabled={isLoading || !newFolderName.trim()}>+</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <button className="btn btn-link text-light px-0" onClick={() => setSelectedFolder(null)}>
                                            <i className="bi bi-arrow-left me-2"></i>Back to Folders
                                        </button>
                                        <h3 className="mt-2">Files in "{selectedFolder.name}"</h3>
                                    </div>
                                    <div>
                                        <button className="btn btn-success me-2" onClick={() => setShowAddFileModal(true)}><i className="bi bi-plus-lg me-2"></i>Upload File</button>
                                        <button className="btn btn-share" onClick={() => {/* ... share logic ... */ }}><i className="bi bi-share-fill me-2"></i>Share</button>
                                    </div>
                                </div>
                                {isLoading && loadingMessage ? <p>{loadingMessage}</p> : (
                                    <table className="table file-table align-middle">
                                        <thead>
                                            <tr>
                                                <th scope="col" style={{ width: '5%' }}></th>
                                                <th scope="col">Name</th>
                                                <th scope="col">Added by</th>
                                                <th scope="col">Date Added</th>
                                                <th scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {folderItems.length > 0 ? folderItems.map(item => (
                                                <tr key={item.id}>
                                                    <td><i className="bi bi-file-earmark-text file-icon"></i></td>
                                                    <td className="file-title">
                                                        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">{item.title}</a>
                                                    </td>
                                                    <td className="file-meta">{userMap[item.userId] || 'Loading...'}</td>
                                                    <td className="file-meta">{formatTimestamp(item.createdAt)}</td>
                                                    <td>
                                                        {user._id === selectedFolder.originalOwner && (
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteFile(item)} title="Delete File">
                                                                <i className="bi bi-trash-fill"></i>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5">This folder is empty.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
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