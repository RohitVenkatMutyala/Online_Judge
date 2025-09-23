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
        const emailjsPublicKey = '3WEPhBvkjCwXVYBJ-'; // Replace with your EmailJS Public Key
        const serviceID = 'service_6ar5bgj'; // Replace with your EmailJS Service ID
        const templateID = 'template_w4ydq8a'; // Replace with your EmailJS Template ID
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
            allowedEmails = [...new Set([...allowedEmails, ...invitedEmails])]; // Use Set to avoid duplicates
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
                lastRunOutput: '',
                lastRunVerdicts: [],
                lastRunTime: null,
                lastRunStatus: '',
                codeInput: '',
                muteStatus: {}, // Initializes the mute status map for the session
            });
            if (accessType === 'private') {
                await sendInvitationEmails(newSessionId, description, invitedEmails);
                toast.success("Private session created and invitations sent!");
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
        // ... (The renderStep function with all its cases remains unchanged)
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                {/* Your JSX for the create session card and steps */}
                <div className="card create-session-card text-center shadow-lg border-0 position-relative">
                    {renderStep()}
                </div>
            </div>
            <RecentSessions />
        </>
    );
}

export default CreateSession;