// src/components/CreateSession.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser';
import RecentSessions from './RecentSessions';
import Navbar from './navbar';

function CreateSession() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(0);
    const [description, setDescription] = useState('');
    const [accessType, setAccessType] = useState('public');
    const [defaultRole, setDefaultRole] = useState('viewer');
    const [emailsInput, setEmailsInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendInvitationEmails = async (sessionId, sessionDescription, invitedEmails) => {
        if (!invitedEmails || invitedEmails.length === 0) return;

        const emailjsPublicKey = '3WEPhBvkjCwXVYBJ-'; // ⚠️ Replace
        const serviceID = 'service_6ar5bgj'; // ⚠️ Replace
        const templateID = 'template_w4ydq8a'; // ⚠️ Replace
        const sessionLink = `${window.location.origin}/chat/${sessionId}`;

        for (const email of invitedEmails) {
            const templateParams = {
                from_name: `${user.firstname} ${user.lastname}`,
                to_email: email,
                session_description: sessionDescription,
                session_link: sessionLink,
            };
            try {
                await emailjs.send(serviceID, templateID, templateParams, emailjsPublicKey);
                console.log(`Invitation sent successfully to ${email}`);
            } catch (error) {
                console.error(`Failed to send invitation to ${email}:`, error);
                toast.error(`Could not send invite to ${email}.`);
            }
        }
    };

    const handleCreateSession = async () => {
        if (!user) {
            toast.error("You must be logged in to create a session.");
            return;
        }
        if (!description) {
            toast.warn("A description is required.");
            return;
        }
        
        setIsLoading(true);

        let allowedEmails = [user.email];
        let invitedEmails = [];

        if (accessType === 'private') {
            // ✅ FIX: Robustly split emails by comma, space, or newline
            invitedEmails = emailsInput.split(/[,\s\n]+/).map(email => email.trim()).filter(Boolean);
            allowedEmails = [...allowedEmails, ...invitedEmails];
        }

        const newSessionId = Math.random().toString(36).substring(2, 9);
        const sessionDocRef = doc(db, 'sessions', newSessionId);

        try {
            await setDoc(sessionDocRef, {
                description,
                code: `// Welcome, ${user.firstname}!\n// ${description}`,
                text: 'This is a shared notes area.',
                createdAt: serverTimestamp(),
                ownerId: user._id,
                ownerName: `${user.firstname} ${user.lastname}`,
                access: accessType,
                defaultRole,
                allowedEmails,
                permissions: { [user._id]: 'editor' },
                lastRunOutput: '',
                lastRunVerdicts: [],
                lastRunTime: null,
                lastRunStatus: '',
                codeInput: ''
            });

            if (accessType === 'private') {
                await sendInvitationEmails(newSessionId, description, invitedEmails);
                toast.success("Session created and invitations sent!");
            } else {
                toast.success("Public session created!");
            }

            navigate(`/chat/${newSessionId}`);
        } catch (error) {
            console.error("Failed to create session:", error);
            toast.error("Could not create the session. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="card-body p-5">
                        <h2 className="gradient-title">Session Description</h2>
                        <p className="text-muted mb-4">Give your session a clear and concise description.</p>
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="e.g., 'Weekly project sync for the new feature'"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(0)}>Back</button>
                            <button className="btn create-btn" onClick={() => description ? setStep(2) : toast.warn('Description cannot be empty.')}>Next</button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="card-body p-5">
                        <h2 className="gradient-title">Session Settings</h2>
                        <div className="text-start">
                            <strong>Access Level:</strong>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="accessType" id="public" value="public" checked={accessType === 'public'} onChange={(e) => setAccessType(e.target.value)} />
                                <label className="form-check-label" htmlFor="public">Public (Anyone with the link can join)</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="accessType" id="private" value="private" checked={accessType === 'private'} onChange={(e) => setAccessType(e.target.value)} />
                                <label className="form-check-label" htmlFor="private">Private (Only invited users can join)</label>
                            </div>
                            <hr />
                            <strong>Default Role for Others:</strong>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="defaultRole" id="viewer" value="viewer" checked={defaultRole === 'viewer'} onChange={(e) => setDefaultRole(e.target.value)} />
                                <label className="form-check-label" htmlFor="viewer">Viewer (Can only view code and notes)</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="defaultRole" id="editor" value="editor" checked={defaultRole === 'editor'} onChange={(e) => setDefaultRole(e.target.value)} />
                                <label className="form-check-label" htmlFor="editor">Editor (Can edit code and notes)</label>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>Back</button>
                            <button className="btn create-btn" onClick={() => accessType === 'private' ? setStep(3) : handleCreateSession()}>
                                {accessType === 'private' ? 'Next' : (isLoading ? 'Creating...' : 'Create Session')}
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                     <div className="card-body p-5">
                        <h2 className="gradient-title">Invite Members</h2>
                        <p className="text-muted mb-4">Enter emails separated by commas, spaces, or new lines.</p>
                        <textarea
                            className="form-control"
                            rows="4"
                            placeholder="friend1@example.com, colleague2@example.com"
                            value={emailsInput}
                            onChange={(e) => setEmailsInput(e.target.value)}
                        />
                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(2)}>Back</button>
                            <button className="btn create-btn" onClick={handleCreateSession} disabled={isLoading}>
                                {isLoading ? 'Creating & Sending Invites...' : 'Finish & Create'}
                            </button>
                        </div>
                    </div>
                )
            default:
                return (
                    <div className="card-body p-5 position-relative">
                        <div className="icon-wrapper mx-auto">
                            <i className="bi bi-plus-circle main-icon"></i>
                        </div>
                        <h1 className="gradient-title">Start a New Collaboration</h1>
                        <p className="description-text lead mx-auto" style={{ maxWidth: '600px' }}>
                            Launch a real-time collaborative coding environment.
                        </p>
                        <button className="btn create-btn position-relative" onClick={() => setStep(1)}>
                            <i className="bi bi-rocket-takeoff me-2"></i>
                            Create New Session
                            <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                    </div>
                );
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <style jsx>{`
                    /* ... Your full CSS from before goes here ... */
                    .create-session-card {
                        backdrop-filter: blur(15px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        overflow: hidden;
                        position: relative;
                        background: rgba(255, 255, 255, 0.95);
                    }
                    .gradient-title {
                        background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        font-weight: 700;
                    }
                    .create-btn {
                        background: linear-gradient(135deg, #f12711, #f5af19);
                        border: none;
                        color: white;
                        font-weight: 600;
                        padding: 0.8rem 2rem;
                        border-radius: 50px;
                        transition: all 0.3s ease;
                    }
                    .icon-wrapper {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 60px;
                        height: 60px;
                        background: linear-gradient(135deg, #f12711, #f5af19);
                        border-radius: 50%;
                        margin-bottom: 1.5rem;
                        box-shadow: 0 4px 15px rgba(241, 39, 17, 0.2);
                    }
                    .main-icon {
                        font-size: 1.5rem;
                        color: white;
                    }
                `}</style>
                <div className="card create-session-card text-center shadow-lg border-0 position-relative">
                    {renderStep()}
                </div>
            </div>
            <RecentSessions />
        </>
    );
}

export default CreateSession;