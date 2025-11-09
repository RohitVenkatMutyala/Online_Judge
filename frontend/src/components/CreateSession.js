import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import {
    doc, onSnapshot, updateDoc, collection, addDoc, query,
    orderBy, serverTimestamp, arrayUnion, arrayRemove, deleteDoc, deleteField
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import Peer from 'simple-peer';
import axios from 'axios';
import emailjs from '@emailjs/browser'; // --- NEW: Added emailjs import ---

import Navbar from './navbar';
import SharingComponent from './SharingComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


const API_COM = process.env.REACT_APP_COMPILER_API || 'http://localhost:5000';

function Chat() {
    const { user } = useAuth();
    const { sessionId } = useParams();

    // --- State Variables ---
    const heartbeatIntervalRef = useRef(null);
    const [code, setCode] = useState('');
    const [activeTab, setActiveTab] = useState('input');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [accessDenied, setAccessDenied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [input, setInput] = useState('');
    const [sessionAccess, setSessionAccess] = useState('public');
    const [activeUsers, setActiveUsers] = useState([]);
    const [codeLanguage, setCodeLanguage] = useState('javascript');
    const [verdicts, setVerdicts] = useState([]);
    const [TotalTime, setTime] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [sessionOwnerId, setSessionOwnerId] = useState(null);
    
    // --- NEW: State for session data and invite modal ---
    const [sessionData, setSessionData] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmails, setInviteEmails] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    // --- Voice Chat State ---
    const [stream, setStream] = useState(null);
    const [muteStatus, setMuteStatus] = useState({});
    const peersRef = useRef({});
    const audioContainerRef = useRef(null);
    const chatMessagesEndRef = useRef(null);

    // ---
    // --- FIX 1 (Part 1): Ref to hold current users for comparison ---
    // ---
    const activeUsersRef = useRef(activeUsers);
    useEffect(() => {
        activeUsersRef.current = activeUsers;
    }, [activeUsers]);
    // --- END FIX 1 (Part 1) ---

    // --- NEW: Ref to prevent mic request race condition ---
    const micRequestRef = useRef(false);

    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Main useEffect to handle session data and user presence
    useEffect(() => {
        if (!sessionId || !user) {
            setLoading(!sessionId);
            return;
        }

        const sessionDocRef = doc(db, 'sessions', sessionId);

        // Setup the heartbeat to run every 30 seconds
        const updatePresence = () => {
            updateDoc(sessionDocRef, {
                [`activeParticipants.${user._id}`]: { // Use a map with user ID as key
                    name: `${user.firstname} ${user.lastname}`,
                    lastSeen: serverTimestamp()
                }
            }).catch(console.error);
        };
        updatePresence(); // Call it once immediately
        heartbeatIntervalRef.current = setInterval(updatePresence, 30000);

        const unsubscribeSession = onSnapshot(sessionDocRef, (docSnap) => {
            if (!docSnap.exists()) {
                setAccessDenied(true);
                setLoading(false);
                return;
            }

            const data = docSnap.data();
            setSessionData(data); // --- NEW: Store all session data ---
            setSessionOwnerId(data.ownerId);

            const isOwner = user && data.ownerId === user._id;
            const hasAccess = data.access === 'public' || (user && data.allowedEmails?.includes(user.email)) || isOwner;

            if (!hasAccess) {
                setAccessDenied(true);
                setLoading(false);
                return;
            }

            // --- 
            // --- FIX 1 (Part 2): PREVENT USER LIST FLICKER ---
            // ---
            const participantsMap = data.activeParticipants || {};
            const oneMinuteAgo = Date.now() - 60000; // 1 minute in milliseconds

            const currentUsers = Object.entries(participantsMap)
                .filter(([_, userData]) => userData.lastSeen && userData.lastSeen.toDate().getTime() > oneMinuteAgo)
                .map(([userId, userData]) => ({
                    id: userId,
                    name: userData.name,
                }));
            
            // --- Create sorted ID strings to compare ---
            const newUsersID = JSON.stringify(currentUsers.map(u => u.id).sort());
            // --- Use the REF for the "old" list to prevent stale state ---
            const oldUsersID = JSON.stringify(activeUsersRef.current.map(u => u.id).sort());

            // --- Only update state if the user list has *actually* changed ---
            if (newUsersID !== oldUsersID) {
                setActiveUsers(currentUsers);
            }
            // --- END FIX 1 (Part 2) ---
            

            const role = isOwner ? 'editor' : (data.defaultRole || 'viewer');
            setUserRole(role);
            setCode(data.code || '');
            setInput(data.codeInput || '');
            setSessionAccess(data.access || 'public');
            setCodeLanguage(data.language || 'javascript');
            setMuteStatus(data.muteStatus || {});
            setVerdicts(data.lastRunVerdicts || []);
            setOutput(data.lastRunOutput || '');
            setTime(data.lastRunTime || null);

            // --- 
            // --- FIX 5: PREVENT MIC REQUEST RACE CONDITION ---
            // ---
            if (data.access === 'private' && !stream && !micRequestRef.current) {
                // --- SET FLAG ---
                micRequestRef.current = true; 
                
                navigator.mediaDevices.getUserMedia({ video: false, audio: true })
                    .then(userStream => {
                        setStream(userStream);
                        toast.info("You are muted by default. The owner can unmute you.");
                        // --- UNSET FLAG ---
                        micRequestRef.current = false; 
                    })
                    .catch(err => {
                        console.error("Mic access error:", err);
                        toast.error("Could not access microphone. Voice chat disabled.");
                        // --- UNSET FLAG ---
                        micRequestRef.current = false; 
                    });
            }
            // --- END FIX 5 ---

            setLoading(false);
        }, (error) => {
            console.error("Error in onSnapshot listener:", error);
            setAccessDenied(true);
            setLoading(false);
        });

        const messagesQuery = query(collection(db, 'sessions', sessionId, 'messages'), orderBy('timestamp'));
        const unsubscribeMessages = onSnapshot(messagesQuery, qSnap => setMessages(qSnap.docs.map(d => ({ id: d.id, ...d.data() }))));

        // This is the cleanup function that runs when the user leaves
        return () => {
            clearInterval(heartbeatIntervalRef.current); // Stop the heartbeat
            if (user) {
                // Remove the user's entry from the map using deleteField
                updateDoc(doc(db, 'sessions', sessionId), {
                    [`activeParticipants.${user._id}`]: deleteField()
                }).catch(console.error);
            }
            if (stream) { stream.getTracks().forEach(track => track.stop()); }
            Object.values(peersRef.current).forEach(peer => peer.destroy());
            unsubscribeSession();
            unsubscribeMessages();
        };
    }, [sessionId, user]); // --- REMOVED 'stream' from dependency array to prevent re-runs ---

    // ---
    // --- FIX 2: ROBUST WEBRTC MESH & SIGNALING ---
    // ---
    const activeUserIDs = JSON.stringify(activeUsers.map(p => p.id).sort()); // Stable dependency

    useEffect(() => {
        if (!stream || sessionAccess !== 'private' || !user) return;

        const signalingColRef = collection(db, 'sessions', sessionId, 'signaling');

        // ---
        // --- FIX 4 (Part 1): BROWSER AUTOPLAY FIX ---
        // ---
        // --- Helper to add audio element ---
        const addAudioElement = (userId, stream) => {
            if (audioContainerRef.current) {
                let audio = document.getElementById(`audio-${userId}`);
                if (!audio) {
                    audio = document.createElement('audio');
                    audio.id = `audio-${userId}`;
                    // audio.autoplay = true; // This is unreliable
                    audioContainerRef.current.appendChild(audio);
                }
                audio.srcObject = stream;
                // Attempt to play immediately
                audio.play().catch(e => {
                    console.warn(`Autoplay blocked for ${userId}, user must click.`);
                    // The document click listener (FIX 4 Part 2) will handle this
                });
            }
        };
        // --- END FIX 4 (Part 1) ---

        // --- Helper to remove audio element ---
        const removeAudioElement = (userId) => {
            const audioElem = document.getElementById(`audio-${userId}`);
            if (audioElem) {
                audioElem.remove();
            }
        };

        const createPeer = (recipientId, senderId, stream) => {
            console.log(`Creating peer for ${recipientId}`);
            const peer = new Peer({ initiator: true, trickle: false, stream });

            peer.on('signal', signal => addDoc(signalingColRef, { recipientId, senderId, signal }));
            peer.on('stream', remoteStream => {
                console.log(`Received stream from ${recipientId}`);
                addAudioElement(recipientId, remoteStream);
            });
            peer.on('close', () => { 
                console.log(`Connection closed with ${recipientId}`);
                removeAudioElement(recipientId);
                delete peersRef.current[recipientId];
            });
            peer.on('error', (err) => {
                console.error(`Peer error (to ${recipientId}):`, err);
                removeAudioElement(recipientId);
                delete peersRef.current[recipientId];
            });
            
            peersRef.current[recipientId] = peer;
        };

        const addPeer = (incoming, recipientId, stream) => {
            console.log(`Accepting peer from ${incoming.senderId}`);
            const peer = new Peer({ initiator: false, trickle: false, stream });

            peer.on('signal', signal => addDoc(signalingColRef, { recipientId: incoming.senderId, senderId: recipientId, signal }));
            peer.on('stream', remoteStream => {
                console.log(`Received stream from ${incoming.senderId}`);
                addAudioElement(incoming.senderId, remoteStream);
            });
            peer.on('close', () => { 
                console.log(`Connection closed with ${incoming.senderId}`);
                removeAudioElement(incoming.senderId);
                delete peersRef.current[incoming.senderId];
            });
            peer.on('error', (err) => {
                console.error(`Peer error (from ${incoming.senderId}):`, err);
                removeAudioElement(incoming.senderId);
                delete peersRef.current[incoming.senderId];
            });

            peer.signal(incoming.signal);
            peersRef.current[incoming.senderId] = peer;
        };

        // Create peers for new users
        activeUsers.forEach(p => { 
            if (p.id !== user._id && !peersRef.current[p.id]) { 
                createPeer(p.id, user._id, stream); 
            } 
        });

        // Destroy peers for users who left
        Object.keys(peersRef.current).forEach(peerId => { 
            if (!activeUsers.find(p => p.id === peerId)) { 
                console.log(`Destroying peer for ${peerId}`);
                if(peersRef.current[peerId]) {
                    peersRef.current[peerId].destroy(); 
                }
                delete peersRef.current[peerId]; 
                removeAudioElement(peerId); // Clean up audio element
            } 
        });

        // --- Signaling listener with REFRESH FIX ---
        const unsubscribeSignaling = onSnapshot(query(signalingColRef), snapshot => {
            snapshot.docChanges().forEach(change => {
                const data = change.doc.data();
                if (change.type === "added" && data.recipientId === user._id) {
                    const existingPeer = peersRef.current[data.senderId];

                    if (data.signal.type === 'offer') {
                        // New offer from a refresh
                        if (existingPeer) {
                            console.log(`(RECONNECT) Destroying stale peer for ${data.senderId}`);
                            existingPeer.removeAllListeners(); // Prevent stale 'close'
                            existingPeer.destroy();
                            delete peersRef.current[data.senderId];
                            removeAudioElement(data.senderId);
                        }

                        // Only add peer if they are in the official activeUsers list
                        if (activeUsers.find(p => p.id === data.senderId)) {
                            console.log(`(RECONNECT) Accepting new offer from ${data.senderId}`);
                            addPeer(data, user._id, stream);
                        }
                    
                    } else if (existingPeer && data.signal.type === 'answer') {
                        // This is an answer to our offer
                        console.log(`Got signal answer from ${data.senderId}`);
                        existingPeer.signal(data.signal);
                    
                    } else if (existingPeer) {
                        // Other signal (like ICE candidate, though trickle=false)
                        existingPeer.signal(data.signal);
                    }
                    
                    deleteDoc(change.doc.ref); // Signal consumed
                }
            });
        });

        return () => {
             unsubscribeSignaling();
        };
    }, [stream, activeUserIDs, sessionId, user, sessionAccess]); // Use stable activeUserIDs
    // --- END FIX 2 ---


    // ---
    // --- FIX 3: SIMPLIFIED MUTE EFFECT ---
    // ---
    useEffect(() => {
        if (!stream || !user || stream.getAudioTracks().length === 0) { return; }
        const isMuted = muteStatus[user._id] ?? true; // Default to muted if not specified
        const audioTrack = stream.getAudioTracks()[0];
        
        // This is all that's needed to mute/unmute your outgoing audio
        audioTrack.enabled = !isMuted;

    }, [muteStatus, stream, user]);
    // --- END FIX 3 ---

    // ---
    // --- FIX 4 (Part 2): BROWSER AUTOPLAY FIX (Robust) ---
    // ---
    useEffect(() => {
        // This effect runs once to add a global click listener
        const unlockAudio = () => {
            let unlocked = false;
            if (audioContainerRef.current) {
                const audioElements = audioContainerRef.current.querySelectorAll('audio');
                audioElements.forEach(audio => {
                    // Try to play each audio element that is currently paused
                    if (audio.paused) {
                        audio.play().then(() => {
                            unlocked = true; // Mark that we successfully unlocked at least one
                            console.log(`Successfully played audio for ${audio.id}`);
                        }).catch(e => {
                            // This is expected if it's still blocked
                        });
                    }
                });
            }
            // --- Only remove the listener if we successfully unlocked audio ---
            if (unlocked) {
                console.log("Audio context unlocked. Removing click listener.");
                document.removeEventListener('click', unlockAudio);
            }
        };

        document.addEventListener('click', unlockAudio);

        return () => {
            document.removeEventListener('click', unlockAudio);
        };
    }, []); // Empty dependency array, run only once on mount
    // --- END FIX 4 (Part 2) ---

    // ---
    // --- MUTE LOGIC (Already Correct) ---
    // ---
    const handleToggleMute = async (targetUserId) => {
        // Check against the true owner's ID, not the user's role
        const isTrueOwner = user && user._id === sessionOwnerId;
        const isSelf = targetUserId === user._id;

        // Rule 1: The true owner can mute or unmute anyone.
        if (isTrueOwner) {
            const currentMuteState = muteStatus[targetUserId] ?? true;
            const newMuteState = !currentMuteState;
            await updateDoc(doc(db, 'sessions', sessionId), { [`muteStatus.${targetUserId}`]: newMuteState });
            return;
        }

        // Rule 2: A participant (not the owner) can ONLY mute themselves.
        if (isSelf) {
            const isCurrentlyMuted = muteStatus[targetUserId] ?? true;

            // If they are already muted (by owner), they cannot unmute.
            if (isCurrentlyMuted) {
                toast.error("Only the session owner can unmute you.");
                return;
            }

            // If they are unmuted, allow them to mute themselves.
            await updateDoc(doc(db, 'sessions', sessionId), { [`muteStatus.${targetUserId}`]: true });
        } else {
            // Safeguard: A participant cannot mute another participant.
            toast.error("You do not have permission to mute other participants.");
        }
    };
    // --- END MUTE LOGIC ---


    // ---
    // --- NEW: INVITE PEOPLE LOGIC ---
    // ---
    const handleSendInvites = async (e) => {
        e.preventDefault();
        if (!inviteEmails) {
            toast.warn("Please enter at least one email.");
            return;
        }
        setIsInviting(true);
        
        const emails = inviteEmails.split(/[,\s\n]+/).map(email => email.trim()).filter(Boolean);
        if (emails.length === 0) {
            toast.warn("No valid emails found.");
            setIsInviting(false);
            return;
        }
        
        // Credentials from CreateSession.js
        const emailjsPublicKey = '3WEPhBvkjCwXVYBJ-';
        const serviceID = 'service_6ar5bgj';
        const templateID = 'template_w4ydq8a';
        const sessionLink = `${window.location.origin}/chat/${sessionId}`;

        try {
            // 1. Update permissions in Firestore
            const sessionDocRef = doc(db, 'sessions', sessionId);
            await updateDoc(sessionDocRef, {
                allowedEmails: arrayUnion(...emails)
            });

            // 2. Send email to each new user
            let successCount = 0;
            for (const email of emails) {
                const templateParams = {
                    from_name: `${user.firstname} ${user.lastname}`,
                    to_email: email,
                    session_description: sessionData?.description || "a coding session", // Use session data
                    session_link: sessionLink,
                };
                try {
                    await emailjs.send(serviceID, templateID, templateParams, emailjsPublicKey);
                    successCount++;
                } catch (err) {
                    console.error(`Failed to send invite to ${email}:`, err);
                }
            }
            
            toast.success(`Sent ${successCount} invite(s)!`);
            setIsInviteModalOpen(false);
            setInviteEmails('');

        } catch (error) {
            console.error("Error sending invites:", error);
            toast.error("Could not update session permissions.");
        } finally {
            setIsInviting(false);
        }
    };
    // --- END INVITE LOGIC ---


    const handleCodeChange = (newCode) => { if (userRole === 'editor') updateDoc(doc(db, 'sessions', sessionId), { code: newCode }); };
    const handleInputChange = (e) => { const newInput = e.target.value; setInput(newInput); if (userRole === 'editor') updateDoc(doc(db, 'sessions', sessionId), { codeInput: newInput }); };
    const formatTimestamp = (timestamp) => !timestamp ? '' : timestamp.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!user || newMessage.trim() === '') return;
        await addDoc(collection(db, 'sessions', sessionId, 'messages'), { text: newMessage, senderName: `${user.firstname} ${user.lastname}`, senderId: user._id, timestamp: serverTimestamp() });
        setNewMessage('');
    };
    const handleRun = async () => {
        setIsRunning(true); setActiveTab('output');
        const apiLanguage = codeLanguage === 'python' ? 'py' : codeLanguage;
        try {
            const res = await axios.post(`${API_COM}/run`, { language: apiLanguage, code, input });
            const dataToUpdate = { lastRunOutput: res.data.output || 'Execution finished.', lastRunVerdicts: res.data.verdicts || [], lastRunTime: res.data.totalTime || null, lastRunTimestamp: serverTimestamp() };
            await updateDoc(doc(db, 'sessions', sessionId), dataToUpdate);
        } catch (error) { setOutput(error.message || 'An unexpected error occurred.'); }
        finally { setIsRunning(false); }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4>Loading Session...</h4>
                    <p className="text-muted">Please wait while we connect you.</p>
                </div>
            </div>
        );
    }

    if (accessDenied) { return <div className="container mt-5"><div className="alert alert-danger"><b>Access Denied.</b></div></div>; }
    return (
        <>
            <Navbar />
            <div className="chat-page-container">
                <style jsx>{`
                    /* --- 1. General Page & Layout Styles --- */

:root {
  --dark-bg-primary: #12121c;   /* Main page background */
  --dark-bg-secondary: #1e1e2f; /* Card and container background */
  --border-color: #3a3a5a;       /* Borders and dividers */
  --text-primary: #e0e0e0;       /* Main text color */
  --text-secondary: #a9a9b3;     /* Muted text for timestamps/subtitles */
  --accent-blue: #4a69bd;       /* Accent for user's own message bubble & active elements */
}

body {
  background-color: var(--dark-bg-primary); /* Ensure body background is dark */
}

.chat-page-container {
  background-color: var(--dark-bg-primary);
  color: var(--text-primary);
  min-height: calc(100vh - 56px);
  padding: 1.5rem 0;
}

/* --- 2. Card Component Overrides --- */

.card {
  background-color: var(--dark-bg-secondary);
  border: 1px solid var(--border-color);
}

.card-header, .card-footer {
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-primary);
}

.card-footer {
  border-top: 1px solid var(--border-color);
  border-bottom: none;
}

.list-group-item {
  background-color: transparent;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.list-group-item:last-child {
  border-bottom: none;
}

/* --- 3. I/O Tabs and Content Area (NEW) --- */

.nav-tabs {
  border-bottom: 1px solid var(--border-color);
}

.nav-tabs .nav-link {
  background-color: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  color: var(--text-primary);
}

.nav-tabs .nav-link.active {
  background-color: var(--dark-bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  border-color: var(--border-color);
  border-bottom-color: var(--dark-bg-secondary); 
}

.tab-content {
  background-color: var(--dark-bg-secondary);
  border: 1px solid var(--border-color);
  border-top: none;
  padding: 1rem;
  color: var(--text-primary);
}

.tab-content pre {
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
}

/* --- 4. Chat-Specific Styles --- */

.chat-card .card-body {
  padding: 0.5rem 1rem;
}

.chat-messages-container {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 40vh;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; /* Ensure it's on top of other content */
}

.modal-content {
  background-color: var(--dark-bg-secondary, #1e1e2f); /* Using your theme color */
  color: var(--text-primary, #e0e0e0);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color, #3a3a5a);
  width: 90%;
  max-width: 450px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
}

.modal-header {
  border-bottom: 1px solid var(--border-color, #3a3a5a);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  overflow-y: auto; /* This makes the user list scrollable */
}

/* Make Bootstrap's close button visible on dark backgrounds */
.btn-close-white {
    filter: invert(1) grayscale(100%) brightness(200%);
}
.chat-message {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.3rem;
}

.message-sender {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.message-timestamp {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.message-bubble {
  padding: 0.6rem 1.1rem;
  border-radius: 18px;
  max-width: 85%;
  word-wrap: break-word;
  line-height: 1.4;
}

.own-message {
  align-items: flex-end;
}
.own-message .message-bubble {
  background-color: var(--accent-blue);
  color: #ffffff;
  border-top-right-radius: 4px;
}
.own-message .message-header {
    justify-content: flex-end;
}

.other-message {
  align-items: flex-start;
}
.other-message .message-bubble {
  background-color: #313147;
  color: var(--text-primary);
  border-top-left-radius: 4px;
}

/* --- 5. Form & Input Styles (Updated) --- */

/* General style for all textareas/inputs */
.form-control {
  background-color: var(--dark-bg-primary) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.form-control:focus {
  border-color: var(--accent-blue) !important;
  box-shadow: 0 0 0 0.2rem rgba(74, 105, 189, 0.25) !important;
}

.form-control::placeholder {
  color: var(--text-secondary) !important;
}

/* Specific style for chat input field */
.chat-input {
  border-radius: 20px;
  padding: 0.5rem 1rem;
}

.send-button {
  background: var(--accent-blue);
  border: none;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  transition: background-color 0.2s ease;
}

.send-button:hover {
  background-color: #5a7ccb;
}

.send-button:disabled {
  background-color: #313147;
  cursor: not-allowed;
}
                `}</style>
                <div className="row g-3 h-100">

                    {/* Left Column: Editor and I/O */}
                    <div className="col-lg-8 d-flex flex-column">
                        <div className="card shadow-sm rounded-3 mb-3">
                            <div className="card-header p-2"> {/* UI FIX: Reduced header padding */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 d-flex align-items-center fs-6">
                                        <i className="bi bi-code-slash me-2"></i>
                                        Collaborative Editor
                                        {sessionAccess === 'private' && (
                                            <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill ms-2">
                                                <i className="bi bi-lock-fill me-1"></i> Private
                                            </span>
                                        )}
                                    </h5>
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ width: 'auto' }}
                                        value={codeLanguage}
                                        onChange={(e) => userRole === 'editor' && updateDoc(doc(db, 'sessions', sessionId), { language: e.target.value })}
                                    >
                                        <option value="python">Python</option>
                                        <option value="cpp">C++</option>
                                        <option value="java">Java</option>
                                        <option value="javascript">JavaScript</option>
                                    </select>
                                </div>
                            </div>
                            <div className="card-body p-0" style={{ height: '65vh' }}>
                                <Editor
                                    height="100%"
                                    language={codeLanguage}
                                    theme="vs-dark"
                                    value={code}
                                    onChange={handleCodeChange}
                                    options={{ readOnly: userRole !== 'editor', minimap: { enabled: false } }}
                                />
                            </div>
                        </div>

                        <div className="flex-grow-1 d-flex flex-column">
                            <ul className="nav nav-tabs">
                                <li className="nav-item"><button className={`nav-link ${activeTab === 'input' ? 'active' : ''}`} onClick={() => setActiveTab('input')}>Input</button></li>
                                <li className="nav-item"><button className={`nav-link ${activeTab === 'output' ? 'active' : ''}`} onClick={() => setActiveTab('output')}>Output</button></li>
                                <li className="nav-item"><button className={`nav-link ${activeTab === 'verdict' ? 'active' : ''}`} onClick={() => setActiveTab('verdict')}>Verdict</button></li>
                            </ul>
                            <div className="tab-content border border-top-0 p-2 rounded-bottom bg-body flex-grow-1">
                                {activeTab === 'input' && (
                                    <div className="tab-pane fade show active h-100 d-flex flex-column">
                                        <textarea
                                            className="form-control mb-3 flex-grow-1"
                                            placeholder="Enter custom input..."
                                            value={input}
                                            onChange={handleInputChange}
                                        />
                                        {/* Find the "Run Code" button */}
                                        <button
                                            className="btn btn-primary btn-sm align-self-start d-flex align-items-center" // <-- Added flex classes
                                            onClick={handleRun}
                                            disabled={isRunning}
                                            style={{ width: '80px', justifyContent: 'center' }} // <-- Optional: fixed width for consistency
                                        >
                                            {isRunning ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Running
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-play-fill fs-6 me-1"></i>
                                                    Run
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                                {activeTab === 'output' && (<div className="tab-pane fade show active"><pre>{output || (isRunning ? 'Executing...' : 'Run code to see output.')}</pre></div>)}
                                {activeTab === 'verdict' && (<div className="tab-pane fade show active">{!verdicts || verdicts.length === 0 ? <p className="text-muted">No verdict yet.</p> : (<div><div className="mb-2">Total Time: {TotalTime}ms</div><div className="d-flex flex-wrap gap-3">{verdicts.map((v, idx) => <div key={idx} className={`border rounded p-2 text-center ${v.verdict.includes("Passed") ? "text-success" : "text-danger"}`}><strong>Test Case {v.testCase}</strong>: {v.verdict}</div>)}</div></div>)}</div>)}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Users, Share, Chat */}
                    <div className="col-lg-4 d-flex flex-column h-100">
                        <div className="card shadow-sm mb-3">
                            {/* ... inside the Active Users card ... */}
                            <div className="card-header d-flex justify-content-between">
                                <span>Active Users ({activeUsers.length})</span>
                                <i className="bi bi-broadcast text-success"></i>
                            </div>

                            <ul className="list-group list-group-flush">
                                {/* Always show the first 4 users */}
                                {activeUsers.slice(0, 4).map(p => (
                                    <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        {/* This part remains the same */}
                                        <span className="fw-bold">{p.name}</span>
                                        {p.id === user?._id && <span className="ms-2">(You)</span>}
                                        {sessionAccess === 'private' && stream && (
                                            <button
                                                className={`btn btn-sm ${muteStatus[p.id] ?? true ? 'text-danger' : 'text-success'}`}
                                                onClick={() => handleToggleMute(p.id)}
                                                // Mute logic:
                                                // 1. You are NOT the owner AND
                                                // 2. It is NOT you OR you are already muted (can't unmute self)
                                                disabled={user?._id !== sessionOwnerId && (p.id !== user?._id || (muteStatus[p.id] ?? true))}
                                                style={{ fontSize: '1.2rem' }}
                                            >
                                                <i className={`bi ${muteStatus[p.id] ?? true ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {/* This button now opens the modal */}
                            {activeUsers.length > 4 && (
                                <div className="card-footer text-center p-1">
                                    <button
                                        className="btn btn-link btn-sm text-decoration-none"
                                        onClick={() => setIsUserModalOpen(true)}
                                    >
                                        View All ({activeUsers.length}) Users...
                                    </button>
                                </div>
                            )}

                            <div ref={audioContainerRef} style={{ display: 'none' }}></div>
                        </div>

                        {userRole === 'editor' && (
                            <>
                                <div className="mb-3"><SharingComponent sessionId={sessionId} /></div>
                                {/* --- NEW: Invite People Button --- */}
                                <div className="d-grid mb-3">
                                    <button className="btn" style={{backgroundColor: 'var(--accent-blue)', color: 'white'}} onClick={() => setIsInviteModalOpen(true)}>
                                        <i className="bi bi-person-plus-fill me-2"></i>Invite People
                                    </button>
                                </div>
                            </>
                        )}


                        <div className="card shadow-sm flex-grow-1 chat-card">
                            <div className="card-header d-flex align-items-center">
                                <span 
                                    className="spinner-grow spinner-grow-sm text-success me-2" 
                                    role="status" 
                                    aria-hidden="true"
                                    style={{ width: '0.8rem', height: '0.8rem' }}
                                ></span>
                                Live Chat
                            </div>
                            <div className="card-body d-flex flex-column">
                                <div className="chat-messages-container">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`chat-message ${msg.senderId === user?._id ? 'own-message' : 'other-message'}`}>
                                            <div className="message-header">
                                                <span className="message-sender">{msg.senderName}</span>
                                                <span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span>
                                            </div>
                                            <div className="message-bubble">{msg.text}</div>
                                        </div>
                                    ))}
                                    <div ref={chatMessagesEndRef} />
                                </div>
                                <form onSubmit={handleSendMessage} className="chat-input-group">
                                    <div className="d-flex align-items-center">
                                        <input
                                            type="text"
                                            className="form-control chat-input"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <button className="send-button flex-shrink-0" type="submit" disabled={!newMessage.trim()}>
                                            <i className="bi bi-send-fill"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- User List Modal --- */}
            {isUserModalOpen && (
                <div className="modal-overlay" onClick={() => setIsUserModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">All Active Users</h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={() => setIsUserModalOpen(false)}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <ul className="list-group list-group-flush">
                                {activeUsers.map(p => (
                                    <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-secondary text-white px-0">
                                        <div>
                                            <span className="fw-bold">{p.name}</span>
                                            {p.id === user?._id && <span className="ms-2 text-muted small">(You)</span>}
                                        </div>
                                        {sessionAccess === 'private' && stream && (
                                            <button
                                                className={`btn btn-sm ${muteStatus[p.id] ?? true ? 'text-danger' : 'text-success'}`}
                                                onClick={() => handleToggleMute(p.id)}
                                                disabled={user?._id !== sessionOwnerId && (p.id !== user?._id || (muteStatus[p.id] ?? true))}
                                                style={{ fontSize: '1.2rem' }}
                                            >
                                                <i className={`bi ${muteStatus[p.id] ?? true ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NEW: Invite People Modal --- */}
            {isInviteModalOpen && (
                <div className="modal-overlay" onClick={() => setIsInviteModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">Invite People</h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={() => setIsInviteModalOpen(false)}
                            ></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSendInvites}>
                            <p className="text-secondary mb-3">
                                Add more people to this call. Enter emails separated by commas or new lines.
                            </p>
                            <div className="form-floating mb-3">
                                <textarea
                                    className="form-control"
                                    id="inviteEmails"
                                    placeholder="Enter emails"
                                    style={{ height: '150px' }}
                                    value={inviteEmails}
                                    onChange={(e) => setInviteEmails(e.target.value)}
                                />
                                <label htmlFor="inviteEmails" style={{color: 'var(--text-secondary)'}}>Emails (comma-separated)</label>
                            </div>
                            <button 
                                type="submit" 
                                className="btn w-100"
                                style={{backgroundColor: 'var(--accent-blue)', color: 'white', fontWeight: 600, padding: '0.6rem'}}
                                disabled={isInviting}
                            >
                                {isInviting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Sending Invites...
                                    </>
                                ) : (
                                    'Send Invites'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Chat;