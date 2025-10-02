import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { db, storage } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, writeBatch, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

// Helper function to format Firestore Timestamps
const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
};

function Audiobook() {
    const { user } = useAuth();
    const { theme } = useTheme();

    const [userFolders, setUserFolders] = useState([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [folderItems, setFolderItems] = useState([]);
    const [userMap, setUserMap] = useState({});
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

    const fetchFolderItems = async (folderId) => {
        setIsLoading(true);
        setLoadingMessage('Loading files...');
        try {
            const q = query(collection(db, "playlistItems"), where("playlistId", "==", folderId), orderBy("createdAt", "asc"));
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFolderItems(items);

            const userIds = [...new Set(items.map(item => item.userId))];
            const newUsers = {};
            for (const userId of userIds) {
                if (!userMap[userId]) {
                    const userDocRef = doc(db, "persons", userId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        newUsers[userId] = `${userData.firstname || ''} ${userData.lastname || ''}`.trim() || 'Unknown User';
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
        if (!user || !user._id) { setError("User not loaded. Please try again."); return; }
        if (!newFolderName.trim()) return;
        try {
            const docRef = await addDoc(collection(db, "playlists"), {
                name: newFolderName,
                originalOwner: user._id,
                memberIds: [user._id],
                isPublic: true,
                createdAt: serverTimestamp(),
            });
            const newFolder = { id: docRef.id, name: newFolderName, originalOwner: user._id, memberIds: [user._id] };
            setUserFolders(prev => [newFolder, ...prev]);
            setNewFolderName('');
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
        e.preventDefault();
        if (!user || !user._id) { setError("User not loaded. Please try again."); return; }
        if (!fileToUpload || !fileTitle.trim()) { setError("Please provide a file and a title."); return; }
        setIsLoading(true);
        setLoadingMessage('Uploading file...');
        try {
            const personDocRef = doc(db, "persons", user._id);
            const personDocSnap = await getDoc(personDocRef);
            if (!personDocSnap.exists()) {
                await setDoc(personDocRef, {
                    firstname: user.firstname || "First",
                    lastname: user.lastname || "Last",
                    email: user.email || "no-email@example.com"
                });
            }
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
        if (!window.confirm(`Are you sure you want to delete the file "${fileToDelete.title}"?`)) return;
        setIsLoading(true);
        setLoadingMessage('Deleting file...');
        try {
            const fileRef = ref(storage, fileToDelete.fileUrl);
            await deleteObject(fileRef);
            await deleteDoc(doc(db, "playlistItems", fileToDelete.id));
            setFolderItems(prevItems => prevItems.filter(item => item.id !== fileToDelete.id));
        } catch (err) {
            console.error("Error deleting file:", err);
            setError("Failed to delete file.");
        } finally {
            setIsLoading(false); setLoadingMessage('');
        }
    };

    const handleDeleteFolder = async (folderToDelete) => {
        if (!window.confirm(`Are you sure you want to permanently delete the folder "${folderToDelete.name}" and all its files? This action cannot be undone.`)) return;
        setIsLoading(true);
        setLoadingMessage(`Deleting ${folderToDelete.name}...`);
        try {
            const itemsQuery = query(collection(db, "playlistItems"), where("playlistId", "==", folderToDelete.id));
            const itemsSnapshot = await getDocs(itemsQuery);

            for (const itemDoc of itemsSnapshot.docs) {
                const fileData = itemDoc.data();
                if (fileData.fileUrl) {
                    const fileRef = ref(storage, fileData.fileUrl);
                    await deleteObject(fileRef).catch(err => console.error("Could not delete file from storage:", err));
                }
            }

            const batch = writeBatch(db);
            itemsSnapshot.forEach(doc => batch.delete(doc.ref));
            const folderDocRef = doc(db, "playlists", folderToDelete.id);
            batch.delete(folderDocRef);
            await batch.commit();

            setUserFolders(prev => prev.filter(p => p.id !== folderToDelete.id));
            if (selectedFolder?.id === folderToDelete.id) {
                setSelectedFolder(null);
                setFolderItems([]);
            }
        } catch (err) {
            console.error("Error deleting folder:", err);
            setError("Failed to delete folder.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    if (!user) { return (<div className="container mt-5"><div className="alert alert-danger text-center">You are not logged in.</div></div>); }

    return (
        <>
            <style>{`
          .theme-dark .dashboard-page { background-color: #12121c; }
          .theme-light .dashboard-page { background-color: #f8f9fa; }
          .dashboard-container { min-height: 85vh; }
          .theme-dark .dashboard-container { background-color: #1e1e2f; border: 1px solid #3a3a5a; color: #fff; }
          .theme-light .dashboard-container { background-color: #ffffff; border: 1px solid #dee2e6; color: #212529; }
          .btn-share { background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s ease; padding: 0.25rem 0.75rem; font-size: 0.8rem; }
          .theme-light .btn-share { background: #e9ecef; color: #495057; border-color: #dee2e6; }
          .btn-share:hover { transform: translateY(-2px); background: linear-gradient(90deg, #3b82f6, #8b5cf6); color: white; border-color: transparent; }
          .folder-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1.5rem; }
          .folder-item { cursor: pointer; text-align: center; transition: transform 0.2s ease; position: relative; }
          .folder-item:hover { transform: translateY(-5px); }
          .folder-icon { font-size: 5rem; color: #ffca28; }
          .folder-name { margin-top: 0.5rem; font-size: 0.9rem; word-break: break-word; }
          .folder-item.active .folder-icon { color: #4dabf7; }
          .folder-item.active .folder-name { font-weight: bold; }
          .delete-folder-btn { position: absolute; top: -5px; right: 5px; background: rgba(0,0,0,0.3); border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
          .folder-item:hover .delete-folder-btn { opacity: 1; }
          .file-table { color: #e0e0e0; }
          .theme-light .file-table { color: #212529; }
          .file-table thead { color: #8c98a9; }
          .file-table tbody tr:hover { background-color: rgba(255, 255, 255, 0.05); }
          .theme-light .file-table tbody tr:hover { background-color: #f1f3f5; }
          .file-icon { font-size: 1.5rem; color: #8c98a9; }
          .file-title a { color: #e0e0e0; text-decoration: none; }
          .theme-light .file-title a { color: #212529; }
          .file-title a:hover { text-decoration: underline; }
          .file-meta { font-size: 0.85rem; color: #8c98a9; }
      `}</style>
            <Navbar />
            <div className={`theme-${theme} dashboard-page py-4`}>
                <div className="container">
                    <div className="dashboard-container p-4 rounded-3 shadow-sm">
                        {!selectedFolder ? (
                            <>
                                <h2 className="mb-4">Your Folders</h2>
                                <form onSubmit={handleCreateFolder} className="mb-4">
                                    <div className="input-group">
                                        <input type="text" className="form-control" placeholder="Create a new folder..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} disabled={isLoading} />
                                        <button className="btn btn-primary" type="submit" disabled={isLoading || !newFolderName.trim()}>Create</button>
                                    </div>
                                </form>
                                {error && <div className="alert alert-danger mt-3" onClick={() => setError('')}>{error}</div>}
                                <div className="folder-grid mt-4">
                                    {userFolders.map(folder => (
                                        <div key={folder.id} className={`folder-item ${selectedFolder?.id === folder.id ? 'active' : ''}`} onClick={() => handleSelectFolder(folder)}>
                                            <i className="bi bi-folder-fill folder-icon"></i>
                                            <div className="folder-name">{folder.name}</div>
                                            {user._id === folder.originalOwner && (
                                                <button className="btn btn-sm btn-danger delete-folder-btn" onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }} title="Delete Folder">
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <button className={`btn btn-link px-0 ${theme === 'dark' ? 'text-light' : ''}`} onClick={() => setSelectedFolder(null)}>
                                            <i className="bi bi-arrow-left me-2"></i>Back to Folders
                                        </button>
                                        <h3 className="mt-2">Files in "{selectedFolder.name}"</h3>
                                    </div>
                                    <div>
                                        <button className="btn btn-success me-2" onClick={() => setShowAddFileModal(true)}><i className="bi bi-plus-lg me-2"></i>Upload File</button>
                                        <button className="btn btn-share" onClick={() => {
                                            const shareUrl = `${window.location.origin}/playlist/${selectedFolder.id}`;
                                            navigator.clipboard.writeText(shareUrl);
                                            alert(`Copied share link to clipboard:\n${shareUrl}`);
                                        }}><i className="bi bi-share-fill me-2"></i>Share</button>
                                    </div>
                                </div>
                                {isLoading && loadingMessage ? <div className="text-center py-5">{loadingMessage}</div> : (
                                    <table className="table file-table align-middle">
                                        <thead>
                                            <tr>
                                                <th scope="col" style={{ width: '5%' }}></th><th scope="col">Name</th><th scope="col">Added by</th><th scope="col">Date Added</th><th scope="col" style={{ width: '5%' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {folderItems.length > 0 ? folderItems.map(item => (
                                                <tr key={item.id}>
                                                    <td><i className="bi bi-file-earmark-text file-icon"></i></td>
                                                    <td className="file-title"><a href={item.fileUrl} target="_blank" rel="noopener noreferrer">{item.title}</a></td>
                                                    <td className="file-meta">{userMap[item.userId] || '...'}</td>
                                                    <td className="file-meta">{formatTimestamp(item.createdAt)}</td>
                                                    <td>
                                                        {user._id === selectedFolder.originalOwner && (
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteFile(item)} title="Delete File"><i className="bi bi-trash-fill"></i></button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) : (<tr><td colSpan="5" className="text-center py-5">This folder is empty. Upload a file to get started.</td></tr>)}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showAddFileModal && selectedFolder && (
                <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleFileUpload}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Upload File to "{selectedFolder.name}"</h5>
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