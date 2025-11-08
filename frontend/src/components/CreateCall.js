// src/components/CreateCall.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser';
import RecentCalls from './RecentCalls';
import Navbar from './navbar';

function CreateCall() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(0);
    const [description, setDescription] = useState('');
    
    // --- UPDATED: Added recipientName ---
    const [recipientName, setRecipientName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendInvitationEmails = async (callId, callDescription, invitedEmails) => {
        if (!invitedEmails || invitedEmails.length === 0) return;
        
        const emailjsPublicKey = '3WEPhBvkjCwXVYBJ-';
        const serviceID = 'service_6ar5bgj';
        const templateID = 'template_w4ydq8a';
        
        const callLink = `${window.location.origin}/call/${callId}`; 
        
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
        
        // --- UPDATED: Check for name and email ---
        const recipientEmailClean = recipientEmail.trim();
        const recipientNameClean = recipientName.trim();

        if (!recipientNameClean) {
            toast.warn("Recipient's name is required.");
            return;
        }
        if (!recipientEmailClean) {
            toast.warn("Recipient's email is required.");
            return;
        }
        // --- END UPDATE ---

        setIsLoading(true);

        const invitedEmails = [recipientEmailClean];
        const allowedEmails = [user.email, recipientEmailClean];
        
        const newCallId = Math.random().toString(36).substring(2, 9);
        const callDocRef = doc(db, 'calls', newCallId); 

        try {
            // --- UPDATED: Save owner and recipient details ---
            await setDoc(callDocRef, {
                description,
                createdAt: serverTimestamp(),
                ownerId: user._id,
                ownerName: `${user.firstname} ${user.lastname}`,
                ownerEmail: user.email, // <-- Added this
                
                recipientName: recipientNameClean, // <-- Added this
                recipientEmail: recipientEmailClean, // <-- Added this
                
                access: 'private',
                defaultRole: 'editor',
                allowedEmails,
                permissions: { [user._id]: 'editor' },
                muteStatus: { [user._id]: false },
            });
            // --- END UPDATE ---

            await sendInvitationEmails(newCallId, description, invitedEmails);
            toast.success("Call created and invitation sent!");
            
            navigate(`/call/${newCallId}`); 

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
                            <button className="btn create-btn" onClick={() => description ? setStep(2) : toast.warn('Description cannot be empty.')}>Next</button>
                        </div>
                    </div>
                );
            case 2: // Invite Step
                return (
                     <div className="card-body p-5 position-relative">
                        <h2 className="gradient-title">Invite Person</h2>
                        <p className="text-muted mb-4">Enter the details of the person you want to call.</p>
                        
                        {/* --- UPDATED: Added Name field --- */}
                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="recipientName"
                                placeholder="Recipient's Name"
                                value={recipientName} 
                                onChange={(e) => setRecipientName(e.target.value)}
                            />
                            <label htmlFor="recipientName">Recipient's Name</label>
                        </div>
                        <div className="form-floating">
                            <input
                                type="email"
                                className="form-control"
                                id="recipientEmail"
                                placeholder="example@gmail.com"
                                value={recipientEmail} 
                                onChange={(e) => setRecipientEmail(e.target.value)}
                            />
                            <label htmlFor="recipientEmail">Recipient's Email</label>
                        </div>
                        {/* --- END UPDATE --- */}

                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>Back</button>
                            <button className="btn create-btn" onClick={handleCreateCall} disabled={isLoading}>{isLoading ? 'Creating...' : 'Finish & Create Call'}</button>
                        </div>
                    </div>
                );
            default: // Initial Screen
                return (
                    <div className="card-body p-5 position-relative">
                        <div className="icon-wrapper mx-auto">
                            <i className="bi bi-person-plus-fill main-icon"></i>
                        </div>
                        <h1 className="gradient-title">Start a 1-on-1 Call</h1>
                        <p className="description-text lead mx-auto" style={{ maxWidth: '600px' }}>
                            Start a real-time private conversation. Enter a description and invite the person you want to talk to.
                        </p>
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
                    .create-call-card { backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; position: relative; background: rgba(255, 255, 255, 0.95); }
                    .create-call-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444); opacity: 0; transition: opacity 0.3s ease; }
                    .create-call-card:hover::before { opacity: 1; }
                    .create-call-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); border-color: rgba(123, 97, 255, 0.3); }
                    .gradient-title { background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; font-size: 2rem; margin-bottom: 1.5rem; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
                    .create-btn { background: linear-gradient(135deg, #f12711, #f5af19); border: none; color: white; font-weight: 600; font-size: 1.1rem; padding: 1rem 3rem; border-radius: 50px; transition: all 0.3s ease; position: relative; overflow: hidden; box-shadow: 0 4px 15px rgba(241, 39, 17, 0.3); }
                    .create-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 8px 25px rgba(241, 39, 17, 0.4); color: white; }
                    .description-text { color: var(--bs-secondary); font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; opacity: 0.8; }
                    .icon-wrapper { display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: linear-gradient(135deg, #f12711, #f5af19); border-radius: 50%; margin-bottom: 1.5rem; box-shadow: 0 4px 15px rgba(241, 39, 17, 0.2); }
                    .main-icon { font-size: 1.5rem; color: white; }
                    [data-bs-theme="dark"] .create-call-card { background: rgba(33, 37, 41, 0.95); border-color: rgba(255, 255, 255, 0.15); }
                    [data-bs-theme="dark"] .create-call-card:hover { background: rgba(33, 37, 41, 0.98); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); }
                    [data-bs-theme="dark"] .description-text { color: var(--bs-light); opacity: 0.9; }
                `}</style>
                <div className="card create-call-card text-center shadow-lg border-0 position-relative">
                    {renderStep()}
                </div>
            </div>
            <RecentCalls /> 
        </>
    );
}

export default CreateCall;