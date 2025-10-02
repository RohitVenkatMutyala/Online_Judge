import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { db, storage } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, writeBatch, doc, deleteDoc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    return parseFloat((bytes / Math.pow(k, 2)).toFixed(dm));
};

function Audiobook() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [userFolders, setUserFolders] = useState([]);
    const [filteredFolders, setFilteredFolders] = useState([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const STORAGE_LIMIT_MB = 250;
    const STORAGE_LIMIT_BYTES = STORAGE_LIMIT_MB * 1024 * 1024;
    const [storageUsed, setStorageUsed] = useState(0);

    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renamingFolder, setRenamingFolder] = useState(null);
    const [renameText, setRenameText] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || !user._id) return;
        let isMounted = true;
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const userDocRef = doc(db, "persons", user._id);
                const userDocSnap = await getDoc(userDocRef);
                if (isMounted && userDocSnap.exists()) {
                    setStorageUsed(userDocSnap.data().storageUsed || 0);
                }

                const q = query(collection(db, "playlists"), where("memberIds", "array-contains", user._id), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const folders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (isMounted) {
                    setUserFolders(folders);
                    setFilteredFolders(folders);
                }
            } catch (err) {
                if (isMounted) setError("Could not fetch your data.");
            } finally {
                if(isMounted) setIsLoading(false);
            }
        };
        fetchInitialData();
        return () => { isMounted = false; };
    }, [user]);

    useEffect(() => {
        const filtered = userFolders.filter(folder =>
            folder.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFolders(filtered);
    }, [searchTerm, userFolders]);

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!user || !user._id || !newFolderName.trim()) return;
        try {
            const docRef = await addDoc(collection(db, "playlists"), { name: newFolderName, originalOwner: user._id, memberIds: [user._id], isPublic: true, createdAt: serverTimestamp() });
            const newFolder = { id: docRef.id, name: newFolderName, originalOwner: user._id, memberIds: [user._id] };
            setUserFolders(prev => [newFolder, ...prev]);
            setNewFolderName('');
        } catch (err) { setError('Failed to create folder.'); }
    };
    
    const handleRenameFolder = async (e) => {
        e.preventDefault();
        if (!renameText.trim() || !renamingFolder) return;
        const folderRef = doc(db, "playlists", renamingFolder.id);
        try {
            await updateDoc(folderRef, { name: renameText });
            setUserFolders(prevFolders => prevFolders.map(folder => 
                folder.id === renamingFolder.id ? { ...folder, name: renameText } : folder
            ));
            setShowRenameModal(false);
            setRenamingFolder(null);
            setRenameText('');
        } catch(err) { setError("Failed to rename folder."); }
    };

    const handleDeleteFolder = async (folderToDelete) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${folderToDelete.name}" and all its files?`)) return;
        setIsLoading(true);
        try {
            const itemsQuery = query(collection(db, "playlistItems"), where("playlistId", "==", folderToDelete.id));
            const itemsSnapshot = await getDocs(itemsQuery);
            const storageUpdates = {};
            for (const itemDoc of itemsSnapshot.docs) {
                const fileData = itemDoc.data();
                if (fileData.fileUrl) {
                    const fileRef = ref(storage, fileData.fileUrl);
                    await deleteObject(fileRef);
                }
                if (fileData.userId && fileData.size > 0) {
                    if (!storageUpdates[fileData.userId]) storageUpdates[fileData.userId] = 0;
                    storageUpdates[fileData.userId] += fileData.size;
                }
            }
            for (const uid in storageUpdates) {
                const userDocRef = doc(db, "persons", uid);
                await updateDoc(userDocRef, { storageUsed: increment(-storageUpdates[uid]) });
            }
            const batch = writeBatch(db);
            itemsSnapshot.forEach(doc => batch.delete(doc.ref));
            const folderDocRef = doc(db, "playlists", folderToDelete.id);
            batch.delete(folderDocRef);
            await batch.commit();
            setUserFolders(prev => prev.filter(p => p.id !== folderToDelete.id));
        } catch (err) {
            setError("Failed to delete folder.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) { return ( <div className="container mt-5"><div className="alert alert-danger text-center">You are not logged in.</div></div> ); }

    return (
        <>
            <style>{`
                .theme-dark .dashboard-page { background-color: #12121c; color: #e0e0e0;}
                .theme-light .dashboard-page { background-color: #f8f9fa; color: #212529;}
                .dashboard-container { min-height: 85vh; }
                .theme-dark .dashboard-container { background-color: #1e1e2f; border: 1px solid #3a3a5a; }
                .theme-light .dashboard-container { background-color: #ffffff; border: 1px solid #dee2e6; }
                .theme-dark .form-control { background-color: #2c3340; color: #fff; border-color: #3a3a5a; }
                .theme-light .form-control { background-color: #fff; color: #212529; border-color: #dee2e6; }
                .theme-dark .form-control::placeholder { color: #6c757d; }
                .theme-dark .input-group-text { background-color: #2c3340; border-color: #3a3a5a; }
                .storage-bar-container { background-color: #3a3a5a; border-radius: 4px; }
                .theme-light .storage-bar-container { background-color: #e9ecef; }
                .storage-bar { background: linear-gradient(90deg, #3b82f6, #8b5cf6); transition: width 0.5s ease-in-out; }
                .folder-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1.5rem; }
                .folder-item { cursor: pointer; text-align: center; transition: transform 0.2s ease; position: relative; padding: 1rem; }
                .folder-item:hover { transform: translateY(-5px); }
                .folder-icon { font-size: 5rem; color: #ffca28; }
                .folder-name { margin-top: 0.5rem; font-size: 0.9rem; word-break: break-word; }
                .folder-actions { position: absolute; top: 8px; right: 8px; display: flex; gap: 0.5rem; opacity: 0; transition: opacity 0.2s; }
                .folder-item:hover .folder-actions { opacity: 1; }
            `}</style>
            <Navbar />
            <div className={`theme-${theme} dashboard-page py-4`}>
                
                    <div className="dashboard-container p-4 p-md-5 rounded-3 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                             <h2 className="mb-2 mb-md-0"> Folders</h2>
                             <div className="w-100 w-md-25 mt-2 mt-md-0" style={{minWidth: '200px'}}>
                                <p className="mb-1 text-end" style={{fontSize: '0.8rem'}}>{`${formatBytes(storageUsed)} MB / ${STORAGE_LIMIT_MB} MB Used`}</p>
                                <div className="progress" style={{height: '8px'}}>
                                    <div className="progress-bar storage-bar" role="progressbar" style={{width: `${(storageUsed / STORAGE_LIMIT_BYTES) * 100}%`}}></div>
                                </div>
                             </div>
                        </div>
                        <div className="row mb-4">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <form onSubmit={handleCreateFolder}>
                                    <div className="input-group">
                                        <input type="text" className="form-control" placeholder="Create a new folder..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                                        <button className="btn btn-primary" type="submit">Create</button>
                                    </div>
                                </form>
                            </div>
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                                    <input type="text" className="form-control" placeholder="Search folders by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        {error && <div className="alert alert-danger mt-3" onClick={() => setError('')}>{error}</div>}
                        <div className="folder-grid mt-4">
                            {filteredFolders.map(folder => (
                                <div key={folder.id} className="folder-item" onClick={() => navigate(`/folder/${folder.id}`)}>
                                    <i className="bi bi-folder-fill folder-icon"></i>
                                    <div className="folder-name">{folder.name}</div>
                                    {user._id === folder.originalOwner && (
                                        <div className="folder-actions">
                                            <button className="btn btn-sm btn-outline-light" style={{'--bs-btn-padding-y': '.1rem', '--bs-btn-padding-x': '.4rem', '--bs-btn-font-size': '.7rem'}} onClick={(e) => { e.stopPropagation(); setRenamingFolder(folder); setRenameText(folder.name); setShowRenameModal(true); }} title="Rename Folder">
                                                <i className="bi bi-pencil-fill"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" style={{'--bs-btn-padding-y': '.1rem', '--bs-btn-padding-x': '.4rem', '--bs-btn-font-size': '.7rem'}} onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }} title="Delete Folder">
                                                <i className="bi bi-trash-fill"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            
            {showRenameModal && (
                 <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                        <form onSubmit={handleRenameFolder}>
                            <div className="modal-header"><h5 className="modal-title">Rename Folder</h5><button type="button" className={`btn-close ${theme === 'dark' ? 'btn-close-white' : ''}`} onClick={() => setShowRenameModal(false)}></button></div>
                            <div className="modal-body"><input type="text" className="form-control" value={renameText} onChange={(e) => setRenameText(e.target.value)} required /></div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowRenameModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
                        </form>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
}

export default Audiobook;