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
        const emailjsPublicKey = '3WEPhBvkjCwXVYBJ-';
        const serviceID = 'service_6ar5bgj';
        const templateID = 'template_w4ydq8a';
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
            toast.error("You must be logged in.");
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
            toast.error("Could not create the session.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Description Step
                return (
                    <div className="card-body p-5 position-relative">
                        <h2 className="gradient-title">Session Description</h2>
                        <p className="text-muted mb-4">Give your session a clear and concise description.</p>
                        <textarea
                            className="form-control" rows="3"
                            placeholder="e.g., 'Weekly project sync for the new feature'"
                            value={description} onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(0)}>Back</button>
                            <button className="btn create-btn" onClick={() => description ? setStep(2) : toast.warn('Description cannot be empty.')}>Next</button>
                        </div>
                    </div>
                );
            case 2: // Settings Step
                return (
                    <div className="card-body p-5 position-relative">
                        <h2 className="gradient-title">Session Settings</h2>
                        <div className="text-start">
                            <strong>Access Level:</strong>
                            <div className="form-check"><input className="form-check-input" type="radio" name="accessType" id="public" value="public" checked={accessType === 'public'} onChange={(e) => setAccessType(e.target.value)} /><label className="form-check-label" htmlFor="public">Public</label></div>
                            <div className="form-check"><input className="form-check-input" type="radio" name="accessType" id="private" value="private" checked={accessType === 'private'} onChange={(e) => setAccessType(e.target.value)} /><label className="form-check-label" htmlFor="private">Private</label></div>
                            <hr />
                            <strong>Default Role for Others:</strong>
                            <div className="form-check"><input className="form-check-input" type="radio" name="defaultRole" id="viewer" value="viewer" checked={defaultRole === 'viewer'} onChange={(e) => setDefaultRole(e.target.value)} /><label className="form-check-label" htmlFor="viewer">Viewer</label></div>
                            <div className="form-check"><input className="form-check-input" type="radio" name="defaultRole" id="editor" value="editor" checked={defaultRole === 'editor'} onChange={(e) => setDefaultRole(e.target.value)} /><label className="form-check-label" htmlFor="editor">Editor</label></div>
                        </div>
                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>Back</button>
                            <button className="btn create-btn" onClick={() => accessType === 'private' ? setStep(3) : handleCreateSession()}>{accessType === 'private' ? 'Next' : (isLoading ? 'Creating...' : 'Create Session')}</button>
                        </div>
                    </div>
                );
            case 3: // Emails Step
                return (
                     <div className="card-body p-5 position-relative">
                        <h2 className="gradient-title">Invite Members</h2>
                        <p className="text-muted mb-4">Enter emails separated by commas .</p>
                        <textarea
                            className="form-control" rows="4"
                            placeholder="randoman1@gmail.com, randoman2@gmail.com"
                            value={emailsInput} onChange={(e) => setEmailsInput(e.target.value)}
                        />
                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(2)}>Back</button>
                            <button className="btn create-btn" onClick={handleCreateSession} disabled={isLoading}>{isLoading ? 'Creating...' : 'Finish & Create'}</button>
                        </div>
                    </div>
                );
            default: // Initial Screen with full UI
                return (
                    <div className="card-body p-5 position-relative">
                        <div className="icon-wrapper mx-auto">
                            <i className="bi bi-plus-circle main-icon"></i>
                        </div>
                        <h1 className="gradient-title">Start a New Collaboration</h1>
                        <p className="description-text lead mx-auto" style={{ maxWidth: '600px' }}>
                            Launch a real-time collaborative coding environment where you and your team can code together, share ideas, and build amazing projects in perfect synchronization.
                        </p>
                        <div className="mb-4">
                            <span className="feature-highlight"><i className="bi bi-lightning-charge me-1"></i>Real-time Sync</span>
                            <span className="feature-highlight"><i className="bi bi-people me-1"></i>Multi-user</span>
                            <span className="feature-highlight"><i className="bi bi-code-square me-1"></i>Live Coding</span>
                            <span className="feature-highlight"><i className="bi bi-shield-check me-1"></i>Secure</span>
                        </div>
                        <button className="btn create-btn position-relative" onClick={() => setStep(1)}>
                            <i className="bi bi-rocket-takeoff me-2"></i>
                            Create New Session
                            <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                        <div className="mt-4">
                            <small className="text-muted"><i className="bi bi-info-circle me-1"></i>Sessions are automatically saved</small>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <style jsx>{`
                    /* ... Your full, original CSS from before goes here ... */
                    .create-session-card { backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; position: relative; background: rgba(255, 255, 255, 0.95); }
                    .create-session-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444); opacity: 0; transition: opacity 0.3s ease; }
                    .create-session-card:hover::before { opacity: 1; }
                    .create-session-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); border-color: rgba(123, 97, 255, 0.3); }
                    .gradient-title { background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; font-size: 2rem; margin-bottom: 1.5rem; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
                    .create-btn { background: linear-gradient(135deg, #f12711, #f5af19); border: none; color: white; font-weight: 600; font-size: 1.1rem; padding: 1rem 3rem; border-radius: 50px; transition: all 0.3s ease; position: relative; overflow: hidden; box-shadow: 0 4px 15px rgba(241, 39, 17, 0.3); }
                    .create-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: left 0.5s; }
                    .create-btn:hover::before { left: 100%; }
                    .create-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 8px 25px rgba(241, 39, 17, 0.4); color: white; }
                    .create-btn:active { transform: translateY(-1px) scale(1.02); }
                    .description-text { color: var(--bs-secondary); font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; opacity: 0.8; }
                    .floating-icon { position: absolute; font-size: 1.2rem; opacity: 0.1; animation: float 6s ease-in-out infinite; }
                    .floating-icon:nth-child(1) { top: 20%; left: 15%; animation-delay: 0s; }
                    .floating-icon:nth-child(2) { top: 30%; right: 20%; animation-delay: 2s; }
                    .floating-icon:nth-child(3) { bottom: 25%; left: 20%; animation-delay: 4s; }
                    .floating-icon:nth-child(4) { bottom: 20%; right: 15%; animation-delay: 1s; }
                    @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 33% { transform: translateY(-10px) rotate(2deg); } 66% { transform: translateY(5px) rotate(-1deg); } }
                    .feature-highlight { display: inline-flex; align-items: center; background: rgba(var(--bs-primary-rgb), 0.1); padding: 0.5rem 1rem; border-radius: 25px; margin: 0.25rem; font-size: 0.9rem; color: var(--bs-primary); font-weight: 500; transition: all 0.3s ease; }
                    .feature-highlight:hover { background: rgba(var(--bs-primary-rgb), 0.2); transform: translateY(-2px); }
                    .pulse-ring { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; height: 200px; border: 2px solid transparent; border-radius: 50%; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444); background-clip: padding-box; opacity: 0.1; animation: pulse 3s ease-in-out infinite; pointer-events: none; }
                    @keyframes pulse { 0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.1; } 50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.05; } 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.1; } }
                    [data-bs-theme="dark"] .create-session-card { background: rgba(33, 37, 41, 0.95); border-color: rgba(255, 255, 255, 0.15); }
                    [data-bs-theme="dark"] .create-session-card:hover { background: rgba(33, 37, 41, 0.98); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); }
                    [data-bs-theme="dark"] .description-text { color: var(--bs-light); opacity: 0.9; }
                    [data-bs-theme="dark"] .floating-icon { opacity: 0.15; }
                    [data-bs-theme="light"] .create-session-card, .create-session-card { background: rgba(255, 255, 255, 0.95); border-color: rgba(0, 0, 0, 0.1); }
                    [data-bs-theme="light"] .create-session-card:hover, .create-session-card:hover { background: rgba(255, 255, 255, 0.98); }
                    .icon-wrapper { display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: linear-gradient(135deg, #f12711, #f5af19); border-radius: 50%; margin-bottom: 1.5rem; box-shadow: 0 4px 15px rgba(241, 39, 17, 0.2); }
                    .main-icon { font-size: 1.5rem; color: white; }
                `}</style>
                <div className="card create-session-card text-center shadow-lg border-0 position-relative">
                    {/* These background effects are always present */}
                    <i className="floating-icon bi bi-code-slash"></i>
                    <i className="floating-icon bi bi-people"></i>
                    <i className="floating-icon bi bi-lightning"></i>
                    <i className="floating-icon bi bi-gear"></i>
                    <div className="pulse-ring"></div>
                    
                    {/* This function renders the correct content (welcome screen OR form steps) */}
                    {renderStep()}
                </div>
            </div>
            <RecentSessions />
        </>
    );
}

export default CreateSession;