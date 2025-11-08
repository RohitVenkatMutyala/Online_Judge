// src/components/RecentCalls.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, limit, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser'; // Import emailjs

function RecentCalls() {
    const { user } = useAuth();
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCalling, setIsCalling] = useState(null); // Tracks which call is being initiated
    const navigate = useNavigate();

    // --- COPIED FROM CreateCall.js ---
    // This function is needed to send the email when re-calling
    const sendInvitationEmails = async (callId, callDescription, invitedEmail) => {
        if (!invitedEmail) return;
        
        const emailjsPublicKey = '3WEPhBvkjCwXVYBJ-';
        const serviceID = 'service_6ar5bgj';
        const templateID = 'template_w4ydq8a';
        
        const callLink = `${window.location.origin}/call/${callId}`; 
        
        const templateParams = {
            from_name: `${user.firstname} ${user.lastname}`,
            to_email: invitedEmail,
            session_description: callDescription,
            session_link: callLink,
        };
        try {
            await emailjs.send(serviceID, templateID, templateParams, emailjsPublicKey);
            console.log(`Invitation sent successfully to ${invitedEmail}`);
        } catch (error) {
            console.error(`Failed to send invitation to ${invitedEmail}:`, error);
            toast.error(`Could not send invite to ${invitedEmail}.`);
        }
    };
    // --- END COPY ---

    // --- NEW "SPEED DIAL" FUNCTION ---
    // This creates a NEW call with a past participant
    const handleReCall = async (callId, recipientName, recipientEmail, description) => {
        if (!user) {
            toast.error("You must be logged in to make a call.");
            return;
        }
        
        setIsCalling(callId); // Show loading spinner on the specific call button
        
        const newCallId = Math.random().toString(36).substring(2, 9);
        const callDocRef = doc(db, 'calls', newCallId);

        try {
            // Create a new call document, with the current user as owner
            await setDoc(callDocRef, {
                description,
                createdAt: serverTimestamp(),
                ownerId: user._id,
                ownerName: `${user.firstname} ${user.lastname}`,
                ownerEmail: user.email,
                
                recipientName: recipientName,
                recipientEmail: recipientEmail,
                
                access: 'private',
                defaultRole: 'editor',
                allowedEmails: [user.email, recipientEmail],
                permissions: { [user._id]: 'editor' },
                muteStatus: { [user._id]: false },
            });

            // Send email to the recipient
            await sendInvitationEmails(newCallId, description, recipientEmail);
            toast.success(`Calling ${recipientName}...`);
            
            // Navigate the CALLER (you) to the new call page
            navigate(`/call/${newCallId}`);

        } catch (error) {
            console.error("Failed to create call:", error);
            toast.error("Could not create the call.");
            setIsCalling(null);
        }
        // No finally block, because we navigate away on success
    };


    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Query for calls where the user is EITHER the owner OR the recipient
        const callsQuery = query(
            collection(db, 'calls'),
            where('allowedEmails', 'array-contains', user.email), // User is part of the call
            orderBy('createdAt', 'desc'),
            limit(10) 
        );

        const unsubscribe = onSnapshot(callsQuery, (snapshot) => {
            const callsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCalls(callsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching recent calls:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]); // Re-run when user logs in

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'No date';
        return timestamp.toDate().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Helper to get a color for the avatar
    const getAvatarColor = (name) => {
        const colors = ['#fd7e14', '#6f42c1', '#d63384', '#198754', '#0d6efd'];
        const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[charCodeSum % colors.length];
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <style jsx>{`
                .recent-calls-list {
                    background-color: var(--bs-body-bg);
                    border-radius: 0.5rem;
                    overflow: hidden;
                    border: 1px solid var(--bs-border-color);
                }
                .call-item {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid var(--bs-border-color);
                    transition: background-color 0.2s ease;
                }
                .call-item:last-child {
                    border-bottom: none;
                }
                .call-item:hover {
                    background-color: var(--bs-tertiary-bg);
                }
                .call-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: white;
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }
                .call-info {
                    margin-left: 1rem;
                    flex-grow: 1;
                    min-width: 0; /* Prevents text overflow issues */
                }
                .call-name {
                    font-weight: 600;
                    font-size: 1rem;
                    color: var(--bs-body-color);
                    margin-bottom: 0.1rem;
                }
                .call-details {
                    font-size: 0.85rem;
                    color: var(--bs-secondary-color);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .call-action {
                    margin-left: 1rem;
                    flex-shrink: 0;
                }
                .call-button {
                    background: none;
                    border: none;
                    color: var(--bs-primary);
                    font-size: 1.5rem;
                    padding: 0.5rem;
                    border-radius: 50%;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s ease;
                }
                .call-button:hover {
                    background-color: var(--bs-secondary-bg);
                }
                .call-button:disabled {
                    color: var(--bs-secondary-color);
                    cursor: not-allowed;
                }
            `}</style>
            
            <h2 className="mb-4">Recent Calls</h2>

            <div className="recent-calls-list shadow-sm">
                {calls.length === 0 && !loading && (
                    <div className="call-item">
                        <p className="text-muted mb-0">You have no recent calls.</p>
                    </div>
                )}

                {calls.map(call => {
                    // Determine who the *other* person in the call was
                    const isCurrentUserOwner = call.ownerId === user._id;
                    const displayName = isCurrentUserOwner ? call.recipientName : call.ownerName;
                    const displayEmail = isCurrentUserOwner ? call.recipientEmail : call.ownerEmail;
                    
                    if (!displayName) return null; // Don't render if name is missing

                    return (
                        <div key={call.id} className="call-item">
                            <div 
                                className="call-avatar" 
                                style={{ backgroundColor: getAvatarColor(displayName) }}
                            >
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="call-info">
                                <div className="call-name">{displayName}</div>
                                <div className="call-details">
                                    <i className="bi bi-envelope-fill me-2"></i>
                                    {displayEmail} • {formatTimestamp(call.createdAt)}
                                </div>
                            </div>
                            <div className="call-action">
                                <button 
                                    className="call-button" 
                                    title={`Call ${displayName}`}
                                    onClick={() => handleReCall(call.id, displayName, displayEmail, call.description)}
                                    disabled={isCalling === call.id}
                                >
                                    {isCalling === call.id ? (
                                        <div className="spinner-border spinner-border-sm" role="status">
                                            <span className="visually-hidden">Calling...</span>
                                        </div>
                                    ) : (
                                        <i className="bi bi-telephone-fill"></i>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default RecentCalls;