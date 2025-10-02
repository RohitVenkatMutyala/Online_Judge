import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, arrayUnion } from 'firebase/firestore';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Helper function to format Firestore Timestamps
const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-IN');
};

function PublicPlaylist() {
    const { playlistId: folderId } = useParams(); // Rename to folderId for clarity
    const { user } = useAuth();
    const { theme } = useTheme();

    const [folder, setFolder] = useState(null);
    const [items, setItems] = useState([]);
    const [ownerName, setOwnerName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchPublicFolderData = useCallback(async () => {
        if (!folderId) return;
        setIsLoading(true);
        try {
            const folderDocRef = doc(db, 'playlists', folderId);
            const folderDocSnap = await getDoc(folderDocRef);

            if (!folderDocSnap.exists() || !folderDocSnap.data().isPublic) {
                setError("This folder could not be found or is not public.");
                return;
            }

            const folderData = { id: folderDocSnap.id, ...folderDocSnap.data() };
            setFolder(folderData);

            // Fetch owner's name
            if (folderData.originalOwner) {
                const ownerDocRef = doc(db, "persons", folderData.originalOwner);
                const ownerDocSnap = await getDoc(ownerDocRef);
                if (ownerDocSnap.exists()) {
                    const ownerData = ownerDocSnap.data();
                    setOwnerName(`${ownerData.firstname || ''} ${ownerData.lastname || ''}`.trim());
                }
            }

            const itemsQuery = query(collection(db, "playlistItems"), where("playlistId", "==", folderId), orderBy("createdAt", "asc"));
            const itemsSnapshot = await getDocs(itemsQuery);
            setItems(itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        } catch (err) {
            console.error("Error fetching public folder:", err);
            setError("Could not load the folder.");
        } finally {
            setIsLoading(false);
        }
    }, [folderId]);

    useEffect(() => {
        fetchPublicFolderData();
    }, [fetchPublicFolderData]);

    const handleJoinFolder = async () => {
        if (!user || !user._id) {
            alert("Please log in to join a folder.");
            return;
        }
        setIsSaving(true);
        try {
            const folderDocRef = doc(db, 'playlists', folderId);
            await updateDoc(folderDocRef, {
                memberIds: arrayUnion(user._id)
            });
            setFolder(prev => ({ ...prev, memberIds: [...(prev.memberIds || []), user._id] }));
        } catch (err) {
            console.error("Error joining folder:", err);
            alert("Failed to join the folder.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) { return <div className={`theme-${theme} dashboard-page d-flex justify-content-center align-items-center`} style={{ minHeight: '100vh' }}><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>; }
    if (error) { return <div className="container mt-5"><div className="alert alert-danger text-center">{error}</div></div>; }
    if (!folder) { return null; }

    const isOwner = user && user._id === folder.originalOwner;
    const isMember = user && folder.memberIds?.includes(user._id);

    return (
        <>
            <style>{`
                .theme-dark .dashboard-page { background-color: #12121c; }
                .theme-light .dashboard-page { background-color: #f8f9fa; }
                .dashboard-container { min-height: 85vh; }
                .theme-dark .dashboard-container { background-color: #1e1e2f; border: 1px solid #3a3a5a; color: #fff; }
                .theme-light .dashboard-container { background-color: #ffffff; border: 1px solid #dee2e6; color: #212529; }
                .btn-join { background: linear-gradient(90deg, #6e48aa, #9448a0); color: #ffffff; border: none; font-weight: 500; transition: all 0.3s ease; }
                .btn-join:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); }
                .file-table { color: #e0e0e0; }
                .theme-light .file-table { color: #212529; }
                .file-table thead { color: #8c98a9; }
                .file-table tbody tr:hover { background-color: rgba(255, 255, 255, 0.05); }
                .theme-light .file-table tbody tr:hover { background-color: #f1f3f5; }
                .file-icon { font-size: 1.5rem; color: #8c98a9; }
                .file-title a { color: #e0e0e0; text-decoration: none; font-weight: 500;}
                .theme-light .file-title a { color: #212529; }
                .file-meta { font-size: 0.85rem; color: #8c98a9; }
            `}</style>
            <Navbar />
            <div className={`theme-${theme} dashboard-page py-4`}>
                <div className="container">
                    <div className="dashboard-container p-4 p-md-5 rounded-3 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap">
                            <div>
                                <h2 className="mb-1">{folder.name}</h2>
                                <p className="text-muted">Shared by {ownerName || '...'}</p>
                            </div>
                            {user && (
                                <button
                                    className={`btn ${isMember ? 'btn-secondary' : 'btn-join'}`}
                                    onClick={handleJoinFolder}
                                    disabled={isMember || isSaving}
                                >
                                    {isOwner ? "You Own This Folder" : isMember ? "You are a Member" : isSaving ? "Joining..." : <><i className="bi bi-person-plus-fill me-2"></i>Join Folder</>}
                                </button>
                            )}
                        </div>
                        <p className="file-meta mb-4">Total Members: {folder.memberIds?.length || 0}</p>

                        <div className="table-responsive">
                            <table className="table file-table align-middle">
                                <thead><tr><th scope="col" style={{ width: '5%' }}></th><th scope="col">Name</th><th scope="col">Date Added</th><th scope="col" className='text-end'>Filename</th></tr></thead>
                                <tbody>
                                    {items.length > 0 ? items.map(item => (
                                        <tr key={item.id}>
                                            <td><i className="bi bi-file-earmark-text file-icon"></i></td>
                                            <td className="file-title">
                                                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">{item.title}</a>
                                            </td>
                                            <td className="file-meta">{formatTimestamp(item.createdAt)}</td>
                                            <td className='text-end'>
                                                <span className="badge bg-secondary rounded-pill fw-normal">{item.fileName}</span>
                                            </td>
                                        </tr>
                                    )) : (<tr><td colSpan="4" className="text-center py-5">This folder is empty.</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PublicPlaylist;