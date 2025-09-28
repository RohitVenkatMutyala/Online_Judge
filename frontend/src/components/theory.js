import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './navbar';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Theory = () => {
    const API_URL = process.env.REACT_APP_SERVER_API;
    const { user } = useAuth();
    const [problems, setProblems] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [filterTag, setFilterTag] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- State for the new AI Explanation Feature ---
    const [aiButton, setAiButton] = useState({ show: false, x: 0, y: 0, text: '' });
    const [showExplainModal, setShowExplainModal] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [originalSelection, setOriginalSelection] = useState('');
    
    const handleViewClick = (qid) => navigate(`/usertheory/${qid}`);

    // --- Event listener to show/hide the AI button on text selection ---
    useEffect(() => {
        const handleMouseUp = () => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            if (selectedText) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setAiButton({
                    show: true,
                    x: rect.left + window.scrollX,
                    y: rect.top + window.scrollY - 40, // Position above the selection
                    text: selectedText
                });
            } else {
                setAiButton({ show: false, x: 0, y: 0, text: '' });
            }
        };

        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);


    useEffect(() => {
        if (!user) return;
        const fetchProblems = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/problems/user/${user._id}`, {
                    withCredentials: true,
                });
                if (res.data.success) {
                    setProblems(res.data.problems);
                    setFiltered(res.data.problems);
                }
            } catch (err) {
                setError('Error loading problems');
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, [user, API_URL]);

    // --- Function to call the AI for an explanation ---
    const handleExplainTheory = async (selectedText) => {
        setOriginalSelection(selectedText);
        setShowExplainModal(true);
        setIsExplaining(true);
        setExplanation('Getting a detailed explanation from the AI...');

        // Manipulate the prompt to ask for a theory explanation
        const prompt = `Explain the following concept in simple terms with clear examples. Do not provide code unless it is essential for the explanation: "${selectedText}"`;

        try {
            // Using the same '/help' endpoint, but with the new theory-focused prompt
            const response = await axios.post(`${API_URL}/help`, { code: prompt, QID: 'theory-explanation' });
            setExplanation(response.data.result || "Could not get an explanation for this topic.");
        } catch (err) {
            console.error("AI Explanation error:", err);
            setExplanation("Sorry, an error occurred while getting the explanation.");
        } finally {
            setIsExplaining(false);
            // Hide the floating button after it's clicked
            setAiButton({ show: false, x: 0, y: 0, text: '' });
        }
    };

    const handleFilterChange = (e) => {
        const value = e.target.value;
        setFilterTag(value);
        const filteredList = problems.filter(q =>
            (q.tag || '').toLowerCase().includes(value.toLowerCase())
        );
        setFiltered(filteredList);
    };

    const handleSolveClick = (qid) => {
        navigate(`/problem/${qid}`);
    };

    const getDifficultyBadge = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'difficulty-badge easy';
            case 'medium': return 'difficulty-badge medium';
            case 'hard': return 'difficulty-badge hard';
            case 'basic': return 'difficulty-badge basic';
            default: return 'difficulty-badge default';
        }
    };

    if (!user) return <div className="alert alert-danger text-center mt-5">Unauthorized</div>;

    if (user.role === 'admin') return (
        <div className="container mt-5">
            <div className="alert alert-danger text-center">You are not logged in.</div>
        </div>
    );

    const pyqProblems = filtered.filter(q => q.tag?.toLowerCase().includes("pyq"));

    return (
        <>
            <Navbar />
            
            {/* Floating "Ask AI" button that appears on text selection */}
            {aiButton.show && (
                <button
                    className="btn btn-dark btn-sm shadow"
                    style={{
                        position: 'fixed',
                        top: `${aiButton.y}px`,
                        left: `${aiButton.x}px`,
                        zIndex: 1050,
                        transition: 'opacity 0.2s ease-in-out',
                    }}
                    onClick={() => handleExplainTheory(aiButton.text)}
                >
                    <i className="bi bi-robot me-2"></i> Ask Randoman AI
                </button>
            )}

            {/* Custom Styles */}
            <style jsx>{`
               /* ... existing styles ... */
            `}</style>

            {/* Hero Section */}
            <div className="theory-hero d-flex align-items-center">
                {/* ... existing hero content ... */}
            </div>

            <div className="container my-5">
                {/* ... existing loading/error/content states ... */}
            </div>
            
            {/* AI Explanation Modal */}
            {showExplainModal && (
                <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content bg-dark text-light">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-robot me-2 text-info"></i> AI Explanation
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowExplainModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {isExplaining ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-info" role="status"></div>
                                        <p className="mt-3 fw-semibold">{explanation}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-4">
                                            <p className="text-muted mb-1">EXPLAINING THE CONCEPT:</p>
                                            <h4 className="fw-bold">"{originalSelection}"</h4>
                                        </div>
                                        <hr/>
                                        <div className="markdown-content mt-4" style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                                            <ReactMarkdown
                                                children={explanation}
                                                components={{
                                                    code({ node, inline, className, children, ...props }) {
                                                        const match = /language-(\w+)/.exec(className || "");
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                                                                {String(children).replace(/\n$/, "")}
                                                            </SyntaxHighlighter>
                                                        ) : (<code className={`${className} bg-secondary-subtle p-1 rounded text-dark`} {...props}>{children}</code>);
                                                    },
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Theory;
