// src/components/CreateSession.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import RecentSessions from './RecentSessions';
import Navbar from './navbar';
function CreateSession() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const createAndNavigate = async () => {
        if (!user) {
            toast.error("You must be logged in to create a session.");
            return;
        }
        const description = window.prompt("Please enter a short description for this session:");
        if (!description) {
            toast.warn("A description is required to create a session.");
            return; // Stop if the user cancels or enters nothing
        }

        // 1. Get session type
        const accessType = window.prompt("Session access: 'public' or 'private'?", 'public')?.toLowerCase() || 'public';

        // 2. Get the role for all other users
        const defaultRole = window.prompt("What permission should other users have? ('editor' or 'viewer')", 'viewer')?.toLowerCase() || 'viewer';

        // 3. Initialize the list of allowed emails with the creator's email
        let allowedEmails = [user.email];

        // 4. If private, add the invited emails to the list
        if (accessType === 'private') {
            const emailsInput = window.prompt("Enter emails to invite (comma-separated):");
            if (emailsInput) {
                const invitedEmails = emailsInput.split(',').map(email => email.trim()).filter(Boolean);
                allowedEmails = [...allowedEmails, ...invitedEmails];
            }
        }

        const newSessionId = Math.random().toString(36).substring(2, 9);
        const sessionDocRef = doc(db, 'sessions', newSessionId);

        try {
            await setDoc(sessionDocRef, {
                description: description,
                code: `// Welcome, ${user.firstname}!\n// ${description}`,
                text: 'This is a shared notes area.',
                createdAt: serverTimestamp(),
                ownerId: user._id, // Still need owner ID for the 'editor' override
                ownerName: `${user.firstname} ${user.lastname}`,
                access: accessType,
                defaultRole: defaultRole,
                allowedEmails: allowedEmails // Save the array of emails
            });

            navigate(`/chat/${newSessionId}`);
        } catch (error) {
            console.error("Failed to create session:", error);
            toast.error("Could not create the session. Please try again.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <style jsx>{`
        .create-session-card {
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            position: relative;
            background: rgba(255, 255, 255, 0.95);
        }
        
        .create-session-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .create-session-card:hover::before {
            opacity: 1;
        }
        
        .create-session-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            border-color: rgba(123, 97, 255, 0.3);
        }
        
        .gradient-title {
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
            font-size: 2rem;
            margin-bottom: 1.5rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .create-btn {
            background: linear-gradient(135deg, #f12711, #f5af19);
            border: none;
            color: white;
            font-weight: 600;
            font-size: 1.1rem;
            padding: 1rem 3rem;
            border-radius: 50px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(241, 39, 17, 0.3);
        }
        
        .create-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .create-btn:hover::before {
            left: 100%;
        }
        
        .create-btn:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 8px 25px rgba(241, 39, 17, 0.4);
            color: white;
        }
        
        .create-btn:active {
            transform: translateY(-1px) scale(1.02);
        }
        
        .description-text {
            color: var(--bs-secondary);
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            opacity: 0.8;
        }
        
        .floating-icon {
            position: absolute;
            font-size: 1.2rem;
            opacity: 0.1;
            animation: float 6s ease-in-out infinite;
        }
        
        .floating-icon:nth-child(1) {
            top: 20%;
            left: 15%;
            animation-delay: 0s;
        }
        
        .floating-icon:nth-child(2) {
            top: 30%;
            right: 20%;
            animation-delay: 2s;
        }
        
        .floating-icon:nth-child(3) {
            bottom: 25%;
            left: 20%;
            animation-delay: 4s;
        }
        
        .floating-icon:nth-child(4) {
            bottom: 20%;
            right: 15%;
            animation-delay: 1s;
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0px) rotate(0deg);
            }
            33% {
                transform: translateY(-10px) rotate(2deg);
            }
            66% {
                transform: translateY(5px) rotate(-1deg);
            }
        }
        
        .feature-highlight {
            display: inline-flex;
            align-items: center;
            background: rgba(var(--bs-primary-rgb), 0.1);
            padding: 0.5rem 1rem;
            border-radius: 25px;
            margin: 0.25rem;
            font-size: 0.9rem;
            color: var(--bs-primary);
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .feature-highlight:hover {
            background: rgba(var(--bs-primary-rgb), 0.2);
            transform: translateY(-2px);
        }
        
        .pulse-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 200px;
            border: 2px solid transparent;
            border-radius: 50%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);
            background-clip: padding-box;
            opacity: 0.1;
            animation: pulse 3s ease-in-out infinite;
            pointer-events: none;
        }
        
        @keyframes pulse {
            0% {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0.1;
            }
            50% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 0.05;
            }
            100% {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0.1;
            }
        }
        
        /* Dark theme adjustments */
        [data-bs-theme="dark"] .create-session-card {
            background: rgba(33, 37, 41, 0.95);
            border-color: rgba(255, 255, 255, 0.15);
        }
        
        [data-bs-theme="dark"] .create-session-card:hover {
            background: rgba(33, 37, 41, 0.98);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        [data-bs-theme="dark"] .description-text {
            color: var(--bs-light);
            opacity: 0.9;
        }
        
        [data-bs-theme="dark"] .floating-icon {
            opacity: 0.15;
        }
        
        /* Light theme adjustments */
        [data-bs-theme="light"] .create-session-card,
        .create-session-card {
            background: rgba(255, 255, 255, 0.95);
            border-color: rgba(0, 0, 0, 0.1);
        }
        
        [data-bs-theme="light"] .create-session-card:hover,
        .create-session-card:hover {
            background: rgba(255, 255, 255, 0.98);
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
                    {/* Floating background icons */}
                    <i className="floating-icon bi bi-code-slash"></i>
                    <i className="floating-icon bi bi-people"></i>
                    <i className="floating-icon bi bi-lightning"></i>
                    <i className="floating-icon bi bi-gear"></i>

                    {/* Pulse ring effect */}
                    <div className="pulse-ring"></div>

                    <div className="card-body p-5 position-relative">
                        <div className="icon-wrapper mx-auto">
                            <i className="bi bi-plus-circle main-icon"></i>
                        </div>

                        <h1 className="gradient-title">
                            Start a New Collaboration
                        </h1>

                        <p className="description-text lead mx-auto" style={{ maxWidth: '600px' }}>
                            Launch a real-time collaborative coding environment where you and your team can
                            code together, share ideas, and build amazing projects in perfect synchronization.
                        </p>

                        <div className="mb-4">
                            <span className="feature-highlight">
                                <i className="bi bi-lightning-charge me-1"></i>
                                Real-time Sync
                            </span>
                            <span className="feature-highlight">
                                <i className="bi bi-people me-1"></i>
                                Multi-user
                            </span>
                            <span className="feature-highlight">
                                <i className="bi bi-code-square me-1"></i>
                                Live Coding
                            </span>
                            <span className="feature-highlight">
                                <i className="bi bi-shield-check me-1"></i>
                                Secure
                            </span>
                        </div>

                        <button
                            className="btn create-btn position-relative"
                            onClick={createAndNavigate}
                        >
                            <i className="bi bi-rocket-takeoff me-2"></i>
                            Create New Session
                            <i className="bi bi-arrow-right ms-2"></i>
                        </button>

                        <div className="mt-4">
                            <small className="text-muted">
                                <i className="bi bi-info-circle me-1"></i>
                                Sessions are automatically saved and can be accessed anytime
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            <RecentSessions />
        </>
    );
}

export default CreateSession;