import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { db, storage } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, doc, deleteDoc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
};

function FolderDetailPage() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const { folderId } = useParams();
    const navigate = useNavigate();

    const [folder, setFolder] = useState(null);
    const [folderItems, setFolderItems] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [showAddFileModal, setShowAddFileModal] = useState(false);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [fileTitle, setFileTitle] = useState('');

    // Main page loading state
    const [isLoading, setIsLoading] = useState(true);
    // FIX #2: Separate loading state for the upload modal to prevent "vibrating"
    const [isUploading, setIsUploading] = useState(false);

    const [error, setError] = useState('');

    const STORAGE_LIMIT_BYTES = 250 * 1024 * 1024;

    const fetchFolderAndItems = useCallback(async () => {
        if (!folderId || !user) return;
        setIsLoading(true);
        try {
            const folderDocRef = doc(db, "playlists", folderId);
            const folderDocSnap = await getDoc(folderDocRef);

            if (!folderDocSnap.exists()) {
                setError("Folder not found.");
                setIsLoading(false);
                return;
            }
            const folderData = { id: folderDocSnap.id, ...folderDocSnap.data() };
            if (!folderData.memberIds?.includes(user._id)) {
                setError("You do not have access to this folder.");
                setIsLoading(false);
                return;
            }
            setFolder(folderData);

            const q = query(collection(db, "playlistItems"), where("playlistId", "==", folderId), orderBy("createdAt", "asc"));
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFolderItems(items);

            const userIds = [...new Set(items.map(item => item.userId))];
            if (userIds.length > 0) {
                const newUsers = {};
                for (const userId of userIds) {
                    const userDocRef = doc(db, "persons", userId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        newUsers[userId] = `${userData.firstname || ''} ${userData.lastname || ''}`.trim() || 'Unknown User';
                    } else {
                        newUsers[userId] = 'Unknown User';
                    }
                }
                setUserMap(prevMap => ({ ...prevMap, ...newUsers }));
            }
        } catch (err) {
            console.error("Failed to load folder data:", err)
            setError("Failed to load folder data.");
        } finally {
            setIsLoading(false);
        }
        // FIX #1: Removed userMap from dependency array to prevent infinite loop
    }, [folderId, user]);

    useEffect(() => {
        fetchFolderAndItems();
    }, [fetchFolderAndItems]);

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!user || !user._id || !fileToUpload || !fileTitle.trim()) return;

        // FIX #2: Use the separate loading state
        setIsUploading(true);
        const userDocRef = doc(db, "persons", user._id);
        try {
            const userDocSnap = await getDoc(userDocRef);
            const currentStorage = userDocSnap.data()?.storageUsed || 0;
            if (currentStorage + fileToUpload.size > STORAGE_LIMIT_BYTES) {
                setError(`Upload failed: You would exceed your storage limit.`);
                setShowAddFileModal(false);
                return;
            }
            const fileId = uuidv4();
            const storageRef = ref(storage, `playlistFiles/${folder.originalOwner}/${folder.id}/${fileId}-${fileToUpload.name}`);
            const snapshot = await uploadBytes(storageRef, fileToUpload);
            const downloadURL = await getDownloadURL(snapshot.ref);
            await addDoc(collection(db, "playlistItems"), {
                title: fileTitle, fileUrl: downloadURL, fileName: fileToUpload.name,
                fileType: fileToUpload.type, size: fileToUpload.size,
                playlistId: folder.id, userId: user._id,
                createdAt: serverTimestamp(),
            });
            await updateDoc(userDocRef, { storageUsed: increment(fileToUpload.size) });
            setShowAddFileModal(false); setFileToUpload(null); setFileTitle('');

            await fetchFolderAndItems();
        } catch (err) {
            setError("File upload failed.");
        } finally {
            // FIX #2: Reset the separate loading state
            setIsUploading(false);
        }
    };

    const handleDeleteFile = async (fileToDelete) => {
        if (!window.confirm(`Are you sure you want to delete "${fileToDelete.title}"?`)) return;
        const fileOwnerRef = doc(db, "persons", fileToDelete.userId);
        try {
            const fileRef = ref(storage, fileToDelete.fileUrl);
            await deleteObject(fileRef);
            await deleteDoc(doc(db, "playlistItems", fileToDelete.id));
            if (fileToDelete.size > 0) {
                await updateDoc(fileOwnerRef, { storageUsed: increment(-fileToDelete.size) });
            }
            setFolderItems(prev => prev.filter(item => item.id !== fileToDelete.id));
        } catch (err) {
            setError("Failed to delete file.");
        }
    };

    if (isLoading) { return <div className={`theme-${theme} dashboard-page d-flex justify-content-center align-items-center`} style={{ minHeight: '100vh' }}><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>; }
    if (error) { return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>; }
    if (!folder) { return <div className={`theme-${theme} dashboard-page text-center py-5`}><div className="container"><h4>Folder not found or you don't have access.</h4></div></div>; }

    return (
        <>
            <style>{`
                .theme-dark .dashboard-page { background-color: #12121c; }
                .theme-light .dashboard-page { background-color: #f8f9fa; }
                .dashboard-container { min-height: 85vh; }
                .theme-dark .dashboard-container { background-color: #1e1e2f; border: 1px solid #3a3a5a; color: #fff; }
                .theme-light .dashboard-container { background-color: #ffffff; border: 1px solid #dee2e6; color: #212529; }
                .btn-share { background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s ease; }
                .theme-light .btn-share { background: #e9ecef; color: #495057; border-color: #dee2e6; }
                .btn-share:hover { transform: translateY(-2px); }
                .file-table { color: #e0e0e0; }
                .theme-light .file-table { color: #212529; }
                .file-table thead { color: #8c98a9; }
                .file-table tbody tr:hover { background-color: rgba(255, 255, 255, 0.05); }
                .theme-light .file-table tbody tr:hover { background-color: #f1f3f5; }
                .file-icon { font-size: 1.5rem; color: #8c98a9; }
                .file-title a { color: #e0e0e0; text-decoration: none; font-weight: 500;}
                .theme-light .file-title a { color: #212529; }
                .file-title a:hover { text-decoration: underline; }
                .file-meta { font-size: 0.85rem; color: #8c98a9; }
                .btn-back {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.75rem;
    border-radius: 50rem; /* Creates the pill shape */
    font-weight: 500;
    text-decoration: none;
    transition: background-color 0.2s ease-in-out;
}

/* Dark Theme Styles */
.theme-dark .btn-back {
    background-color: rgba(255, 255, 255, 0.05);
    color: #adb5bd;
}

.theme-dark .btn-back:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
}

/* Light Theme Styles */
.theme-light .btn-back {
    background-color: #e9ecef;
    color: #495057;
}

.theme-light .btn-back:hover {
    background-color: #dee2e6;
    color: #212529;
}
            `}</style>
            <Navbar />
            <div className={`theme-${theme} dashboard-page py-4`}>
                <div className="container">
                    <div className="dashboard-container p-4 p-md-5 rounded-3 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                            <div className='mb-2 mb-md-0'>
                                <button className="btn btn-back" onClick={() => navigate('/folders')}>
                                    <i className="bi bi-arrow-left me-2"></i>Back to Folders
                                </button>
                                <h3 className="mt-2">Files in "{folder.name}"</h3>
                            </div>
                            <div>
                                <button className="btn btn-success me-2" onClick={() => setShowAddFileModal(true)}><i className="bi bi-plus-lg me-2"></i>Upload File</button>
                                <button className="btn btn-share" onClick={() => {
                                    const shareUrl = `${window.location.origin}/playlist/${folder.id}`;
                                    navigator.clipboard.writeText(shareUrl);
                                    alert(`Copied share link to clipboard:\n${shareUrl}`);
                                }}><i className="bi bi-share-fill me-2"></i>Share</button>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table file-table align-middle">
                                <thead><tr><th scope="col" style={{ width: '5%' }}></th><th scope="col">Name</th><th scope="col">Added by</th><th scope="col">Date Added</th><th scope="col" style={{ width: '5%' }}></th></tr></thead>
                                <tbody>
                                    {folderItems.length > 0 ? folderItems.map(item => (
                                        <tr key={item.id}>
                                            <td><i className="bi bi-file-earmark-text file-icon"></i></td>
                                            <td className="file-title"><a href={item.fileUrl} target="_blank" rel="noopener noreferrer">{item.title}</a></td>
                                            <td className="file-meta">{userMap[item.userId] || '...'}</td>
                                            <td className="file-meta">{formatTimestamp(item.createdAt)}</td>
                                            <td>
                                                {user._id === folder.originalOwner && (
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteFile(item)} title="Delete File"><i className="bi bi-trash-fill"></i></button>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (<tr><td colSpan="5" className="text-center py-5">This folder is empty. Upload a file to get started.</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {showAddFileModal && (
                <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                            <form onSubmit={handleFileUpload}>
                                <div className="modal-header"><h5 className="modal-title">Upload File to "{folder.name}"</h5><button type="button" className={`btn-close ${theme === 'dark' ? 'btn-close-white' : ''}`} onClick={() => setShowAddFileModal(false)}></button></div>
                                <div className="modal-body">
                                    <div className="mb-3"><label htmlFor="fileTitle" className="form-label">File Title</label><input type="text" id="fileTitle" className="form-control" value={fileTitle} onChange={(e) => setFileTitle(e.target.value)} required /></div>
                                    <div className="mb-3"><label htmlFor="fileUpload" className="form-label">Select File</label><input type="file" id="fileUpload" className="form-control" onChange={(e) => setFileToUpload(e.target.files[0])} required /></div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddFileModal(false)} disabled={isUploading}>Cancel</button>
                                    {/* FIX #2: Use the separate isUploading state here */}
                                    <button type="submit" className="btn btn-primary" disabled={isUploading}>
                                        {isUploading ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Uploading...</> : 'Upload'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default FolderDetailPage;