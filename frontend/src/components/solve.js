import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
} from "firebase/firestore";

// Assuming these are loaded globally or have been mocked
const { db } = window.firebaseConfig || {}; 
const { useAuth } = window.AuthContext || { useAuth: () => ({ user: { _id: 'mockUser', email: 'user@example.com', role: 'user' } }) };
const Navbar = () => <nav className="navbar navbar-dark bg-dark"><div className="container-fluid"><a className="navbar-brand" href="#">Code Solver</a></div></nav>;
const { useTheme } = window.ThemeContext || { useTheme: () => ({ theme: 'dark' }) };
const Editor = window.MonacoEditor;
const ReactMarkdown = window.ReactMarkdown;
const axios = window.axios;
const { ToastContainer, toast } = window.ReactToastify || { ToastContainer: () => null, toast: () => {} };

const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
};

const boilerplates = {
    cpp: `#include <iostream>\n\nint main() {\n    // Your code here\n    std::cout << "Hello, World!";\n    return 0;\n}`,
    py: `# Your code here\nprint("Hello, World!")`,
    java: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n        System.out.println("Hello, World!");\n    }\n}`
};

const Solve = () => {
    const API_URL = process.env.REACT_APP_SERVER_API || 'http://localhost:5000';
    const API_COM = process.env.REACT_APP_COMPILER_API || 'http://localhost:5001';
    const { QID } = useParams();
    const { user } = useAuth();
    const [problem, setProblem] = useState(null);
    const [Solved, setSolved] = useState('');
    const [input, setInput] = useState('');
    const { theme } = useTheme();

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [output, setOutput] = useState('');
    const [verdicts, setVerdicts] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('input');
    const [TotalTime, setTime] = useState();

    const editorRef = useRef(null);
    const [isDebugging, setIsDebugging] = useState(false);
    const [debugResponse, setDebugResponse] = useState('');
    const [showDebugModal, setShowDebugModal] = useState(false);
    const [helpCount, setHelpCount] = useState(0);
    
    const today = getTodayDate();

    // Fetch daily help count from Firestore
    useEffect(() => {
        const fetchHelpCount = async () => {
            if (!user?._id || !db) return;
            const helpDocRef = doc(db, "helpCounts", `${user._id}_${today}`);
            try {
                const docSnap = await getDoc(helpDocRef);
                if (docSnap.exists()) {
                    setHelpCount(docSnap.data().count || 0);
                } else {
                    await setDoc(helpDocRef, {
                        userId: user._id,
                        date: today,
                        count: 0,
                    });
                    setHelpCount(0);
                }
            } catch (err) {
                console.error("Error fetching help count:", err);
            }
        };
        fetchHelpCount();
    }, [user, db, today]);

    // Update help count in Firestore
    const updateHelpCount = async () => {
        if (!user?._id || !db) return;
        const helpDocRef = doc(db, "helpCounts", `${user._id}_${today}`);
        try {
            const newCount = helpCount + 1;
            await updateDoc(helpDocRef, { count: newCount });
            setHelpCount(newCount);
        } catch (err) {
            console.error("Error updating help count:", err);
        }
    };

    // Load code based on user, problem, and language
    useEffect(() => {
        const fetchUserData = async () => {
            if (user && QID && language && db) {
                const docId = `${user._id}-${QID}-${language}`;
                try {
                    const docRef = doc(db, "codeSubmissions", docId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setCode(data.code || boilerplates[language]);
                        setInput(data.input || '');
                    } else {
                        setCode(boilerplates[language]);
                        setInput('');
                    }
                } catch (err) {
                    console.error("Error fetching data from Firestore:", err);
                    setCode(boilerplates[language]);
                }
            }
        };
        fetchUserData();
    }, [QID, user, language, db]);

    // Fetch problem data
    useEffect(() => {
        const fetchProblem = async () => {
            if (!axios) return;
            try {
                const res = await axios.get(`${API_URL}/problem/${QID}`);
                setProblem(res.data.problem);
            } catch (err) {
                console.error('Error loading problem:', err);
                if(toast) toast.error("Failed to load the problem.");
            }
        };
        fetchProblem();
    }, [QID, API_URL]);

    // Save code to a language-specific document
    const saveToFirebase = async (newData) => {
        if (user && QID && language && db) {
            const docId = `${user._id}-${QID}-${language}`;
            try {
                await setDoc(doc(db, "codeSubmissions", docId), {
                    userId: user._id,
                    QID,
                    language,
                    code,
                    input,
                    ...newData,
                }, { merge: true });
            } catch (err) {
                console.error("Error saving to Firestore:", err);
            }
        }
    };

    const handleCodeChange = (newValue) => {
        setCode(newValue);
        saveToFirebase({ code: newValue });
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const handleinput = (e) => {
        const val = e.target.value;
        setInput(val);
        saveToFirebase({ input: val });
    };

    const handleAIDebug = async (codeToDebug) => {
        if (helpCount >= 20) {
            if(toast) toast.warn("Daily AI help limit of 20 reached!");
            return;
        }

        setIsDebugging(true);
        setShowDebugModal(true);
        setDebugResponse('');
        
        try {
            const helpResponsesRef = collection(db, "helpResponses");
            const helpId = `${user._id}-${QID}-${language}`; // Unique ID for this specific help request
            const helpDocRef = doc(helpResponsesRef, helpId);
            const helpDoc = await getDoc(helpDocRef);

            if (helpDoc.exists()) {
                setDebugResponse(helpDoc.data().response);
            } else {
                const response = await axios.post(`${API_URL}/help`, { code: codeToDebug, QID });
                const result = response.data.result || "No suggestion was returned from the AI.";

                await setDoc(helpDocRef, {
                    userId: user._id,
                    QID,
                    language,
                    response: result,
                    timestamp: new Date().toISOString()
                });

                setDebugResponse(result);
                await updateHelpCount();
            }
        } catch (err) {
            console.error("AI Debug error:", err);
            setDebugResponse("⚠️ An error occurred while retrieving help from the AI.");
            if(toast) toast.error("AI request failed.");
        } finally {
            setIsDebugging(false);
        }
    };

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        editor.addAction({
            id: 'ai-debug-action',
            label: 'Debug using AI',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: (ed) => {
                const codeToDebug = ed.getModel().getValueInRange(ed.getSelection()) || ed.getValue();
                handleAIDebug(codeToDebug);
            },
        });
    }

    const handleRun = async () => { /* ... existing handleRun code ... */ };
    const handlesubmit = async () => { /* ... existing handlesubmit code ... */ };
    const getDifficultyBadge = (difficulty) => { /* ... existing getDifficultyBadge code ... */ };
    const getTagBadge = (tag) => 'badge text-light px-3 py-2 rounded-pill fw-medium me-2 mb-2';

    if (!problem || !user) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    
    // ... rest of your JSX code ...

    return (
        <>
            <Navbar />
            {ToastContainer && <ToastContainer theme={theme} position="bottom-right" />}
            
            {/* ... Your entire JSX structure ... */}
            
            {/* AI Debugger Modal */}
            {showDebugModal && (
                <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-robot me-2" style={{ color: '#ff4b2b' }}></i> AI Debugger
                                    <span className="badge bg-secondary ms-2">{helpCount}/20 Used</span>
                                </h5>
                                <button type="button" className={`btn-close ${theme === 'dark' ? 'btn-close-white' : ''}`} onClick={() => setShowDebugModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {isDebugging ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-warning" role="status"></div>
                                        <p className="mt-3 fw-semibold">AI is analyzing your code...</p>
                                    </div>
                                ) : (
                                    <div className="markdown-content">
                                        <ReactMarkdown
                                            children={debugResponse}
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || "");
                                                    return !inline && match && SyntaxHighlighter ? (
                                                        <SyntaxHighlighter
                                                            style={oneDark}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, "")}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className={`${className || ''} bg-secondary-subtle p-1 rounded`} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Solve;