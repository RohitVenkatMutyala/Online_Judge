import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
// Firebase imports from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithCustomToken, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Mocks for missing local files to resolve errors ---

// Mock Navbar component
const Navbar = () => (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
            <a className="navbar-brand" href="#">Code Solver</a>
        </div>
    </nav>
);

// Mock AuthContext
const useAuth = () => {
    // In a real app, this would come from a context provider.
    // We provide a mock user object to allow the component to function.
    const [mockUser, setMockUser] = useState({
        email: 'user@example.com',
        _id: 'mockUserId123',
        role: 'user' // Added role to pass conditional checks
    });
    return { user: mockUser };
};

// Mock ThemeContext
const useTheme = () => {
    return { theme: 'dark' }; // Default to dark theme
};

// --- End Mocks ---


const boilerplates = {
    cpp: `#include <iostream>\n\nint main() {\n    // Your code here\n    std::cout << "Hello, World!";\n    return 0;\n}`,
    py: `# Your code here\nprint("Hello, World!")`,
    java: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n        System.out.println("Hello, World!");\n    }\n}`
};

// We assume these libraries are loaded globally from a CDN
const { ToastContainer, toast } = window.ReactToastify || {
    ToastContainer: () => null,
    toast: {
        error: (msg) => console.error("Toast Error:", msg),
        warn: (msg) => console.warn("Toast Warn:", msg),
        success: (msg) => console.log("Toast Success:", msg),
        info: (msg) => console.info("Toast Info:", msg),
    }
};
const Editor = window.MonacoEditor;
const ReactMarkdown = window.ReactMarkdown;
const SyntaxHighlighter = window.ReactSyntaxHighlighter ? window.ReactSyntaxHighlighter.Prism : null;
const oneDark = window.ReactSyntaxHighlighter ? window.ReactSyntaxHighlighter.styles.prism.oneDark : {};
const axios = window.axios;


const Solve = () => {
    const API_URL = process.env.REACT_APP_SERVER_API || 'http://localhost:5000'; // Fallback for local dev
    const API_COM = process.env.REACT_APP_COMPILER_API || 'http://localhost:5001'; // Fallback for local dev
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

    // State for Firebase instances
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);


    // Initialize Firebase
    useEffect(() => {
        try {
            // Mock firebase config if not provided
            const firebaseConfig = window.__firebase_config ? JSON.parse(window.__firebase_config) : { apiKey: "mock", authDomain: "mock", projectId: "mock" };
            const app = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);
            setDb(firestoreDb);
            setAuth(firebaseAuth);

            const authenticate = async () => {
                if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
                    await signInWithCustomToken(firebaseAuth, window.__initial_auth_token);
                } else {
                    await signInAnonymously(firebaseAuth);
                }
            };
            authenticate();
        } catch (error) {
            console.error("Firebase initialization error:", error);
            if(toast) toast.error("Could not connect to services.");
        }
    }, []);


    // Load code based on user, problem, and language
    useEffect(() => {
        const fetchUserData = async () => {
            if (user && QID && language && db) {
                const docId = `${user.email}-${QID}-${language}`;
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
                    if(toast) toast.error("Could not load saved code.");
                    setCode(boilerplates[language]);
                }
            }
        };
        fetchUserData();
    }, [QID, user, language, db]);

    // Fetch problem
    useEffect(() => {
        const fetchProblem = async () => {
            if (!axios) return;
            try {
                const res = await axios.get(`${API_URL}/problem/${QID}`);
                setProblem(res.data.problem);
            } catch (err) {
                console.error('Error loading problem:', err);
            }
        };
        fetchProblem();
    }, [QID, API_URL]);

    // Save code to a language-specific document
    const saveToFirebase = async (newData) => {
        if (user && QID && language && db) {
            const docId = `${user.email}-${QID}-${language}`;
            try {
                await setDoc(doc(db, "codeSubmissions", docId), {
                    email: user.email,
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
        const newLang = e.target.value;
        setLanguage(newLang);
    };

    const handleinput = (e) => {
        const val = e.target.value;
        setInput(val);
        saveToFirebase({ input: val });
    };

    const handleAIDebug = async (codeToDebug) => {
        if (!axios) return;
        if (!codeToDebug || !codeToDebug.trim()) {
            if(toast) toast.warn("Please select code to debug, or have code in the editor.");
            return;
        }
        setIsDebugging(true);
        setDebugResponse('');
        setShowDebugModal(true);

        try {
            const response = await axios.post(`${API_URL}/debug`, {
                code: codeToDebug,
                language,
                QID,
            });
            setDebugResponse(response.data.result || "The AI could not provide a suggestion.");
        } catch (err) {
            console.error("AI Debugger API error:", err);
            setDebugResponse("A problem occurred while trying to contact the AI service. Please try again later.");
            if(toast) toast.error("AI Debugger failed.");
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
            run: function (ed) {
                const selectedText = ed.getModel().getValueInRange(ed.getSelection());
                const codeToDebug = selectedText || ed.getValue();
                handleAIDebug(codeToDebug);
            },
        });
    }

    const handleRun = async () => {
        if (!axios) return;
        setIsRunning(true);
        try {
            const res = await axios.post(`${API_COM}/run`, { language, code, input });
            setOutput(res.data.output || res.data.error || 'No output');
            setActiveTab('output');
        } catch (error) {
            console.error("Compilation/Execution error:", error);
            setOutput(error.response?.data?.error || 'Something went wrong!');
            setActiveTab('output');
        } finally {
            setIsRunning(false);
        }
    };

    const handlesubmit = async () => {
        if (!axios) return;
        setIsSubmitting(true);
        try {
            const res = await axios.get(`${API_URL}/test/${QID}`);
            if (res.data.success && res.data.test) {
                const { inputTestCase, outputTestCase } = res.data.test;
                const val = new TextDecoder('utf-8').decode(new Uint8Array(inputTestCase.data.data));
                const outval = new TextDecoder('utf-8').decode(new Uint8Array(outputTestCase.data.data));

                const compilerresponse = await axios.post(`${API_COM}/submit`, {
                    language, code, input: val, expectedOutput: outval, id: user._id, QID,
                });

                const data = compilerresponse.data;
                setTime(data.totalTimeMs);
                setVerdicts(data.verdicts);
                setActiveTab('verdict');

                if (data.passed === data.total) {
                    const solvedStatus = "Solved";
                    setSolved(solvedStatus);
                    await axios.post(`${API_URL}/rd`, { status: solvedStatus, QID, id: user._id });
                }
            } else {
                setOutput("Test case data missing.");
                setActiveTab('output');
            }
        } catch (error) {
            console.error("Submit error:", error);
            setOutput(error.response?.data?.error || "Something went wrong!");
            setActiveTab('output');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDifficultyBadge = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'badge bg-success-subtle border border-success-subtle text-success-emphasis px-4 py-2 rounded-pill fw-semibold fs-6';
            case 'medium': return 'badge bg-warning-subtle border border-warning-subtle text-warning-emphasis px-4 py-2 rounded-pill fw-semibold fs-6';
            case 'hard': return 'badge bg-danger-subtle border border-danger-subtle text-danger-emphasis px-4 py-2 rounded-pill fw-semibold fs-6';
            case 'basic': return 'badge bg-secondary-subtle border border-secondary-subtle text-secondary-emphasis px-4 py-2 rounded-pill fw-semibold fs-6';
            default: return 'badge bg-light px-4 py-2 rounded-pill fw-semibold fs-6';
        }
    };

    const getTagBadge = (tag) => 'badge text-light px-3 py-2 rounded-pill fw-medium me-2 mb-2';

    if (!problem) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning text-center d-flex align-items-center justify-content-center gap-2">
                    <div className="spinner-border text-warning" role="status" style={{ width: "1.5rem", height: "1.5rem" }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <span>Loading Problem...</span>
                </div>
            </div>
        );
    }

    if (!user || user.role === 'admin') {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center">
                    {user ? 'Admins cannot solve problems.' : 'Unauthorized'}
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            {ToastContainer && <ToastContainer theme={theme} position="bottom-right" />}

            <style>{`
                .problem-card { border: none; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); border-radius: 20px; overflow: hidden; position: relative; }
                .problem-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: linear-gradient(to right, #ff416c, #ff4b2b); }
                .btn-gradient { background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444); color: #fff; border: none; }
                .btn-gradient:hover { opacity: 0.9; color: #fff; }
                .gradient-text-primary { background: linear-gradient(to right, #ff416c, #ff4b2b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                .gradient-text-secondary { background: linear-gradient(to right, #11998e, #38ef7d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                .tag-badge { background: linear-gradient(135deg, #667eea, #764ba2); transition: transform 0.2s ease; }
                .tag-badge:hover { transform: scale(1.05); }
                .markdown-content { line-height: 1.8; }
                .markdown-content h1, .markdown-content h2, .markdown-content h3 { font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; }
                .markdown-content p { margin-bottom: 1.5rem; }
                .markdown-content code { padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.9em; color: #e53e3e; }
                .markdown-content pre { background: linear-gradient(135deg, #2d3748, #4a5568); color: #e2e8f0; padding: 1.5rem; border-radius: 12px; overflow-x: auto; margin: 1.5rem 0; border-left: 4px solid #ff416c; }
                .markdown-content pre code { background: transparent; color: inherit; border: none; padding: 0; }
                .markdown-content blockquote { border-left: 4px solid #11998e; padding: 1rem 1.5rem; margin: 1.5rem 0; border-radius: 8px; }
                [data-bs-theme="light"] .problem-card .card-header, [data-bs-theme="light"] .problem-card .card-body { background-color: var(--bs-card-bg, white) !important; }
                [data-bs-theme="light"] .markdown-content h1, [data-bs-theme="light"] .markdown-content h2, [data-bs-theme="light"] .markdown-content h3 { color: #2d3748; }
                [data-bs-theme="light"] .markdown-content p { color: #4a5568; }
                [data-bs-theme="light"] .markdown-content code { background: linear-gradient(135deg, #f7fafc, #edf2f7); border: 1px solid #e2e8f0; }
                [data-bs-theme="light"] .markdown-content blockquote { background: linear-gradient(135deg, #f0fff4, #e6fffa); color: #2d3748; }
                [data-bs-theme="light"] .info-section { background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05)); border: 1px solid rgba(102, 126, 234, 0.1); }
                [data-bs-theme="dark"] .problem-card, [data-bs-theme="dark"] .problem-card .card-header, [data-bs-theme="dark"] .problem-card .card-body { background: #1a202c !important; }
                [data-bs-theme="dark"] .markdown-content h1, [data-bs-theme="dark"] .markdown-content h2, [data-bs-theme="dark"] .markdown-content h3 { color: #e2e8f0; }
                [data-bs-theme="dark"] .markdown-content p { color: #a0aec0; }
                [data-bs-theme="dark"] .markdown-content code { background: linear-gradient(135deg, #2d3748, #4a5568); border: 1px solid #4a5568; color: #fbb6ce; }
                [data-bs-theme="dark"] .markdown-content blockquote { background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1)); color: #e2e8f0; }
                [data-bs-theme="dark"] .info-section { background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border: 1px solid rgba(102, 126, 234, 0.2); }
            `}</style>

            <div className="container-fluid px-4 mt-4">
                <div className="row g-4">
                    {/* Problem Description Section */}
                    <div className="col-lg-6">
                        <div className="problem-card" style={{ height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                            <div className="card-header border-0 p-4 pb-0">
                                <h4 className="gradient-text-secondary fw-bold mb-4">{problem.name}</h4>
                                <div className="info-section rounded-3 p-4 mb-4">
                                    <div className="row align-items-center">
                                        <div className="col-md-6 mb-3 mb-md-0"><div className="d-flex align-items-center"><span className="text-muted fw-medium me-3">Difficulty:</span><span className={getDifficultyBadge(problem.difficulty)}>{problem.difficulty?.toUpperCase() || 'UNKNOWN'}</span></div></div>
                                        <div className="col-md-6">{problem.tag && (<div className="d-flex align-items-center flex-wrap"><span className="text-muted fw-medium me-3">Tags:</span><div className="d-flex flex-wrap">{problem.tag.split(',').map((tag, idx) => (<span key={idx} className={`${getTagBadge(tag.trim())} tag-badge`}>{tag.trim()}</span>))}</div></div>)}</div>
                                        <div className="col-md-6 mb-3 mb-md-0"><div className="d-flex align-items-center"><span className="text-muted fw-medium me-3">QID:</span><span className="badge bg-info-subtle border border-info-subtle text-info-emphasis rounded-pill px-3">{problem.QID}</span></div></div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-4"><div className="markdown-content">{ReactMarkdown && <ReactMarkdown>{problem.description}</ReactMarkdown>}</div></div>
                        </div>
                    </div>

                    {/* Editor and Tabs Section */}
                    <div className="col-lg-6">
                        <div className="card shadow-sm mb-3">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="card-title mb-0 fw-bold"><i className="bi bi-code-slash me-2"></i>Select Language:</h6>
                                    <div className="btn-group" role="group">
                                        <button type="button" className={`btn btn-sm d-flex align-items-center gap-2 ${language === 'cpp' ? 'btn-gradient' : 'btn-outline-secondary'}`} onClick={() => handleLanguageChange({ target: { value: 'cpp' } })}><i className="bi bi-motherboard-fill"></i> C++</button>
                                        <button type="button" className={`btn btn-sm d-flex align-items-center gap-2 ${language === 'py' ? 'btn-gradient' : 'btn-outline-secondary'}`} onClick={() => handleLanguageChange({ target: { value: 'py' } })}><i className="bi bi-braces"></i> Python</button>
                                        <button type="button" className={`btn btn-sm d-flex align-items-center gap-2 ${language === 'java' ? 'btn-gradient' : 'btn-outline-secondary'}`} onClick={() => handleLanguageChange({ target: { value: 'java' } })}><i className="bi bi-cup-hot-fill"></i> Java</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card shadow border-0 mb-3">
                            <div className="card-header bg-dark text-white fw-semibold rounded-top">Code Editor</div>
                            <div className="card-body p-0">
                                {Editor ? <Editor
                                    height="470px"
                                    language={language === 'py' ? 'python' : language}
                                    value={code}
                                    theme="vs-dark"
                                    onChange={handleCodeChange}
                                    onMount={handleEditorDidMount}
                                    options={{ fontSize: 14, minimap: { enabled: false }, tabSize: 2, automaticLayout: true, contextmenu: true }}
                                /> : <div className="p-3">Loading Editor...</div>}
                            </div>
                        </div>
                        
                        <ul className="nav nav-tabs rounded-top">
                            <li className="nav-item"><button className={`nav-link ${activeTab === 'input' ? 'active' : ''}`} onClick={() => setActiveTab('input')}>Input</button></li>
                            <li className="nav-item"><button className={`nav-link ${activeTab === 'output' ? 'active' : ''}`} onClick={() => setActiveTab('output')}>Output</button></li>
                            <li className="nav-item"><button className={`nav-link ${activeTab === 'verdict' ? 'active' : ''}`} onClick={() => setActiveTab('verdict')}>Verdict</button></li>
                        </ul>
                        <div className={`tab-content border border-top-0 p-3 rounded-bottom bg-${theme === 'dark' ? 'dark' : 'light'} text-${theme === 'dark' ? 'light' : 'dark'}`} style={{ minHeight: '180px' }}>
                            {activeTab === 'input' && (
                                <div className="tab-pane fade show active">
                                    <label htmlFor="inputArea" className="form-label fw-semibold" style={{ background: 'linear-gradient(to right, #f12711, #f5af19)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Custom Input:</label>
                                    <textarea id="inputArea" className="form-control mb-3 text-body bg-body border border-secondary" style={{ resize: 'vertical', minHeight: '120px' }} rows="4" placeholder="Enter custom input (if required)..." value={input || ''} onChange={handleinput} />
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-outline-primary w-50 d-flex align-items-center justify-content-center gap-1" onClick={handleRun} disabled={isRunning}>{isRunning ? <><div className="spinner-border spinner-border-sm text-primary" role="status"></div> Running...</> : <><i className="bi bi-play-fill"></i> Run Code</>}</button>
                                        <button className="btn btn-outline-success w-50 d-flex align-items-center justify-content-center gap-1" onClick={handlesubmit} disabled={isSubmitting}>{isSubmitting ? <><div className="spinner-border spinner-border-sm text-success" role="status"></div> Submitting...</> : <><i className="bi bi-rocket-takeoff-fill"></i> Submit Code</>}</button>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'output' && (
                                <div className="tab-pane fade show active">{output ? (<div className={`card shadow-sm border-0 bg-${theme === 'dark' ? 'dark' : 'white'} text-${theme === 'dark' ? 'light' : 'dark'}`}><div className="card-header text-center fw-bold" style={{ background: 'linear-gradient(to right, #f12711, #f5af19)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.25rem' }}>Output</div><div className="card-body"><pre className="mb-0">{output}</pre></div></div>) : (<p className="text-muted">Run code to see output.</p>)}</div>
                            )}
                            {activeTab === 'verdict' && (
                                <div className="tab-pane fade show active"><div className="card shadow-sm border-0"><div className="card-header text-center fw-bold" style={{ background: 'linear-gradient(to right, #f12711, #f5af19)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.25rem' }}>Verdict</div><div className="card-body">{verdicts.length === 0 ? (<p className="text-muted">Verdict will appear here.</p>) : (<><div className="mb-3"><div className="alert alert-secondary d-inline-block fw-semibold">⏱️ Total Time Taken:{" "}<span className="badge bg-dark">{typeof TotalTime === "number" ? `${TotalTime}ms` : "N/A"}</span></div><div className="mt-2 fw-medium text-warning">{(() => { if (typeof TotalTime !== "number") return "⏰ Looks like something went wrong."; if (TotalTime <= 1000 && Solved === "Solved") return "🧠 Beats 100% of submissions. Genius alert!"; if (TotalTime <= 2000 && Solved === "Solved") return "🚀 Solid run! You've outperformed most developers."; if (TotalTime <= 4000 && Solved === "Solved") return "🛠️ Good job! There's still room for optimization."; return null; })()}</div></div><div className="d-flex flex-wrap gap-3">{verdicts.map((v, idx) => (<div key={idx} className="border rounded p-2 bg-light text-center" style={{ minWidth: '130px' }}><strong style={{ color: 'yellowgreen' }}>Test Case {v.testCase}</strong><div className={v.verdict.includes("Passed") ? "text-success" : "text-danger fw-bold"}>{v.verdict}</div>{!v.verdict.includes("Passed") && (<div className="mt-2 text-start small"><div><strong style={{ color: 'black' }}>Expected:</strong> <pre style={{ color: 'black' }}>{v.expected}</pre></div><div><strong style={{ color: 'black' }}>Actual:</strong> <pre style={{ color: 'black' }}>{v.actual}</pre></div></div>)}</div>))}</div></>)}</div></div></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Debugger Modal */}
            {showDebugModal && (
                <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold"><i className="bi bi-robot me-2" style={{ color: '#ff4b2b' }}></i> AI Debugger</h5>
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
                                        {ReactMarkdown && SyntaxHighlighter ? <ReactMarkdown
                                            children={debugResponse}
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || "");
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                                                            {String(children).replace(/\n$/, "")}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className={`${className || ''} bg-secondary-subtle p-1 rounded`} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                            }}
                                        /> : <pre>{debugResponse}</pre>}
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