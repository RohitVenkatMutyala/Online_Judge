// src/components/CreateCall.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser';
import RecentCalls from './RecentCalls'; // Renamed from RecentSessions
import Navbar from './navbar';

function CreateCall() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(0);
    const [description, setDescription] = useState('');
    const [recipientEmail, setRecipientEmail] = useState(''); // Changed from emailsInput
    const [isLoading, setIsLoading] = useState(false);

    // This is now hard-coded as private
    const accessType = 'private';
    // For a 1-to-1 call, the other user is always an 'editor' (speaker)
    const defaultRole = 'editor'; 

    const sendInvitationEmails = async (callId, callDescription, invitedEmails) => {
        if (!invitedEmails || invitedEmails.length === 0) return;
        
        const emailjsPublicKey = '3WEPhBvkjCwXVYBJ-';
        const serviceID = 'service_6ar5bgj';
        const templateID = 'template_w4ydq8a'; // You might want to create a new template for "calls"
        
        const callLink = `${window.location.origin}/call/${callId}`; // Updated route
        
        // This will now only loop once
        for (const email of invitedEmails) {
            const templateParams = {
                from_name: `${user.firstname} ${user.lastname}`,
                to_email: email,
                session_description: callDescription,
                session_link: callLink,
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

    const handleCreateCall = async () => {
        if (!user) {
            toast.error("You must be logged in.");
            return;
        }
        if (!description) {
            toast.warn("A description is required.");
            return;
        }
        
        const recipientEmailClean = recipientEmail.trim();
        if (!recipientEmailClean) {
            toast.warn("Recipient's email is required.");
            return;
        }

        setIsLoading(true);

        const invitedEmails = [recipientEmailClean];
        const allowedEmails = [user.email, recipientEmailClean];
        
        const newCallId = Math.random().toString(36).substring(2, 9);
        const callDocRef = doc(db, 'calls', newCallId); // New 'calls' collection

        try {
            await setDoc(callDocRef, {
                description,
                createdAt: serverTimestamp(),
                ownerId: user._id,
                ownerName: `${user.firstname} ${user.lastname}`,
                access: 'private', // Hard-coded
                defaultRole: 'editor', // Hard-coded
                allowedEmails, // Only creator and recipient
                permissions: { [user._id]: 'editor' }, // Host is 'editor'
                muteStatus: { [user._id]: false }, // Host starts un-muted
            });

            // Send email to the single recipient
            await sendInvitationEmails(newCallId, description, invitedEmails);
            toast.success("Call created and invitation sent!");
            
            navigate(`/call/${newCallId}`); // Navigate to the new call route

        } catch (error) {
            console.error("Failed to create call:", error);
            toast.error("Could not create the call.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Description Step
                return (
                    <div className="card-body p-5 position-relative">
                        <h2 className="gradient-title">Call Description</h2>
                        <p className="text-muted mb-4">Give your call a clear and concise description.</p>
                        <textarea
                            className="form-control" rows="3"
                            placeholder="e.g., 'Project check-in'"
                            value={description} onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(0)}>Back</button>
                            {/* Updated to go to step 2 (Invite) */}
                            <button className="btn create-btn" onClick={() => description ? setStep(2) : toast.warn('Description cannot be empty.')}>Next</button>
                        </div>
                    </div>
                );
            case 2: // Invite Step (Replaced Settings)
                return (
                     <div className="card-body p-5 position-relative">
                        <h2 className="gradient-title">Invite Person</h2>
                        <p className="text-muted mb-4">Enter the email address of the person you want to call.</p>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="example@gmail.com"
                            value={recipientEmail} 
                            onChange={(e) => setRecipientEmail(e.target.value)}
                        />
                        <div className="d-flex justify-content-between mt-4">
                            {/* Updated to go back to step 1 */}
                            <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>Back</button>
                            <button className="btn create-btn" onClick={handleCreateCall} disabled={isLoading}>{isLoading ? 'Creating...' : 'Finish & Create Call'}</button>
                        </div>
                    </div>
                );
            default: // Initial Screen
                return (
                    <div className="card-body p-5 position-relative">
                        <div className="icon-wrapper mx-auto">
                            <i className="bi bi-person-plus-fill main-icon"></i> {/* Changed icon */}
                        </div>
                        <h1 className="gradient-title">Start a 1-on-1 Call</h1>
                        <p className="description-text lead mx-auto" style={{ maxWidth: '600px' }}>
                            Start a real-time private conversation. Enter a description and invite the person you want to talk to.
                        </p>
                        <div className="mb-4">
                            <span className="feature-highlight"><i className="bi bi-lightning-charge me-1"></i>Real-time Audio</span>
                            <span className="feature-highlight"><i className="bi bi-people me-1"></i>1-on-1 Call</span>
                            <span className="feature-highlight"><i className="bi bi-camera-video me-1"></i>Video Chat</span>
                            <span className="feature-highlight"><i className="bi bi-shield-lock me-1"></i>Private & Secure</span>
                        </div>
                        <button className="btn create-btn position-relative" onClick={() => setStep(1)}>
                            <i className="bi bi-rocket-takeoff me-2"></i>
                            Create New Call
                            <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                        <div className="mt-4">
                            <small className="text-muted"><i className="bi bi-info-circle me-1"></i>Calls are private and invite-only</small>
                        </div>
                    </div>
                );
        }
    };

     if (!user) {
        return (
          <div className="container mt-5">
            <div className="alert alert-danger text-center">You are not logged in.</div>
          </div>
        );
     }

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <style jsx>{`
                    /* ... Your full, original CSS from before goes here ... */
                    .create-call-card { backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; position: relative; background: rgba(255, 255, 255, 0.95); }
                    .create-call-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444); opacity: 0; transition: opacity 0.3s ease; }
                    .create-call-card:hover::before { opacity: 1; }
                    .create-call-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); border-color: rgba(123, 97, 255, 0.3); }
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
                    [data-bs-theme="dark"] .create-call-card { background: rgba(33, 37, 41, 0.95); border-color: rgba(255, 255, 255, 0.15); }
                    [data-bs-theme="dark"] .create-call-card:hover { background: rgba(33, 37, 41, 0.98); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); }
                    [data-bs-theme="dark"] .description-text { color: var(--bs-light); opacity: 0.9; }
                    [data-bs-theme="dark"] .floating-icon { opacity: 0.15; }
                    [data-bs-theme="light"] .create-call-card, .create-call-card { background: rgba(255, 255, 255, 0.95); border-color: rgba(0, 0, 0, 0.1); }
                    [data-bs-theme="light"] .create-call-card:hover, .create-call-card:hover { background: rgba(255, 255, 255, 0.98); }
                    .icon-wrapper { display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: linear-gradient(135deg, #f12711, #f5af19); border-radius: 50%; margin-bottom: 1.5rem; box-shadow: 0 4px 15px rgba(241, 39, 17, 0.2); }
                    .main-icon { font-size: 1.5rem; color: white; }
                `}</style>
                <div className="card create-call-card text-center shadow-lg border-0 position-relative">
                    <i className="floating-icon bi bi-mic"></i>
                    <i className="floating-icon bi bi-person"></i>
                    <i className="floating-icon bi bi-camera-video"></i>
                    <i className="floating-icon bi bi-chat-dots"></i>
                    <div className="pulse-ring"></div>
                    
                    {renderStep()}
                </div>
            </div>
            <RecentCalls /> 
        </>
    );
}

export default CreateCall;