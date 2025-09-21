import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './navbar';

const Theory = () => {
    const API_URL = process.env.REACT_APP_SERVER_API;
    const { user } = useAuth();
    const [problems, setProblems] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [filterTag, setFilterTag] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const handleViewClick = (qid) => navigate(`/usertheory/${qid}`);

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
            case 'easy':
                return 'difficulty-badge easy';
            case 'medium':
                return 'difficulty-badge medium';
            case 'hard':
                return 'difficulty-badge hard';
            case 'basic':
                return 'difficulty-badge basic';
            default:
                return 'difficulty-badge default';
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
            
            {/* Custom Styles */}
            <style jsx>{`
                .theory-hero {
                    
                    position: relative;
                    overflow: hidden;
                    min-height: 200px;
                }
                
                .theory-hero::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.05);
                }
                
                .theory-hero-content {
                    position: relative;
                    z-index: 2;
                }
                
                .search-container {
                   
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 2rem;
                    
                }
                
                .search-input {
                    background: rgba(255, 255, 255, 0.9);
                    border: 2px solid transparent;
                    border-radius: 50px;
                    padding: 1rem 1.5rem;
                    font-size: 1.1rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }
                
                .search-input:focus {
                    outline: none;
                    border-color: #38ef7d;
                    box-shadow: 0 0 0 4px rgba(56, 239, 125, 0.2);
                    transform: translateY(-2px);
                }
                
                .theory-card {
                    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
                    border: none;
                    border-radius: 24px;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                
                .theory-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 6px;
                    background: linear-gradient(90deg, #ff416c, #ff4b2b, #11998e, #38ef7d);
                    background-size: 400% 400%;
                    animation: gradientShift 3s ease infinite;
                }
                
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                .theory-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                }
                
                .theory-card:hover::before {
                    height: 8px;
                }
                
                .card-content {
                    padding: 2rem;
                }
                
                .qid-badge {
                    background: linear-gradient(135deg, #ff416c, #ff4b2b);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .theory-title {
                    background: linear-gradient(135deg, #11998e, #38ef7d);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 700;
                    font-size: 1.4rem;
                    line-height: 1.3;
                    margin: 0.5rem 0 1.5rem 0;
                }
                
                .tag-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin: 1rem 0;
                }
                
                .tag-pill {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 0.4rem 1rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    border: none;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .tag-pill:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }
                
                .difficulty-badge {
                    padding: 0.5rem 1.2rem;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border: 2px solid;
                    background: transparent;
                    transition: all 0.3s ease;
                }
                
                .difficulty-badge.easy {
                    color: #38a169;
                    border-color: #38a169;
                    background: rgba(56, 161, 105, 0.1);
                }
                
                .difficulty-badge.medium {
                    color: #d69e2e;
                    border-color: #d69e2e;
                    background: rgba(214, 158, 46, 0.1);
                }
                
                .difficulty-badge.hard {
                    color: #e53e3e;
                    border-color: #e53e3e;
                    background: rgba(229, 62, 62, 0.1);
                }
                
                .difficulty-badge.basic {
                    color: #718096;
                    border-color: #718096;
                    background: rgba(113, 128, 150, 0.1);
                }
                
                .action-buttons {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    margin-top: 1.5rem;
                }
                
                .btn-view {
                    background: linear-gradient(135deg, #11998e, #38ef7d);
                    border: none;
                    color: white;
                    padding: 0.7rem 2rem;
                    border-radius: 50px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-size: 0.85rem;
                    box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);
                }
                
                .btn-view:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(17, 153, 142, 0.4);
                    color: white;
                }
                
                .btn-solve {
                    background: linear-gradient(135deg, #ff416c, #ff4b2b);
                    border: none;
                    color: white;
                    padding: 0.7rem 2rem;
                    border-radius: 50px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-size: 0.85rem;
                    box-shadow: 0 4px 15px rgba(255, 65, 108, 0.3);
                }
                
                .btn-solve:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(255, 65, 108, 0.4);
                    color: white;
                }
                
                .loading-spinner {
                    width: 4rem;
                    height: 4rem;
                    border: 0.4em solid rgba(17, 153, 142, 0.2);
                    border-top: 0.4em solid #11998e;
                    animation: spin 1s linear infinite;
                    border-radius: 50%;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .no-problems {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1));
                    border-radius: 24px;
                    border: 2px dashed rgba(17, 153, 142, 0.3);
                }
                
                .no-problems-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }
                
                .no-problems h3 {
                    background: linear-gradient(135deg, #11998e, #38ef7d);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 1rem;
                }
                
                .problems-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 2rem;
                    margin-top: 2rem;
                }
                
                .stats-badge {
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 1rem 1.5rem;
                    color: white;
                    font-weight: 600;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                
                /* Dark theme styles */
                [data-bs-theme="dark"] .theory-card {
                    background: linear-gradient(145deg, rgba(26, 32, 44, 0.95), rgba(45, 55, 72, 0.9));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                [data-bs-theme="dark"] .search-input {
                    background: rgba(26, 32, 44, 0.9);
                    color: white;
                    border-color: rgba(255, 255, 255, 0.2);
                }
                
                [data-bs-theme="dark"] .search-input::placeholder {
                    color: rgba(255, 255, 255, 0.6);
                }
                
                [data-bs-theme="dark"] .no-problems {
                    background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1));
                    border-color: rgba(17, 153, 142, 0.3);
                }
            `}</style>

            {/* Hero Section */}
            <div className="theory-hero d-flex align-items-center">
                <div className="container theory-hero-content">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                           
                            
                            <div className="search-container">
                                <input
                                    type="text"
                                    className="form-control search-input"
                                    placeholder="🔍 Search by tags  "
                                    value={filterTag}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container my-5">
                {error && (
                    <div className="alert alert-danger border-0 rounded-4 shadow-sm mb-4">
                        <div className="d-flex align-items-center">
                            <span className="me-3 fs-4">⚠️</span>
                            <div>
                                <h6 className="mb-1">Error Loading Content</h6>
                                <small>{error}</small>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-5">
                        <div className="loading-spinner mx-auto mb-3"></div>
                        <p className="text-muted fs-5">Loading theory content...</p>
                    </div>
                )}

                {/* No Problems Found */}
                {!loading && pyqProblems.length === 0 && (
                    <div className="no-problems">
                        <div className="no-problems-icon">🔍</div>
                        <h3>No Theory Content Found</h3>
                        <p className="text-muted mb-0">
                            {filterTag ? 
                                `No content matches your search "${filterTag}". Try different keywords.` :
                                'No theory content available at the moment.'
                            }
                        </p>
                    </div>
                )}

                {/* Problems Grid */}
                {!loading && pyqProblems.length > 0 && (
                    <div className="problems-grid">
                        {pyqProblems.map((q, index) => (
                            <div key={index} className="theory-card">
                                <div className="card-content">
                                    {!q.tag?.includes("PYQ") && (
                                        <div className="qid-badge mb-2">
                                            QID #{q.QID}
                                        </div>
                                    )}
                                    
                                    <h2 className="theory-title">
                                        {q.name}
                                    </h2>
                                    <br></br>

                                  

                                    <div className="d-flex justify-content-between align-items-center action-buttons">
                                        <div className="d-flex gap-2">
                                            {!q.tag?.includes("PYQ") && (
                                                <span className={getDifficultyBadge(q.difficulty)}>
                                                    {q.difficulty?.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="d-flex gap-2">
                                            <button 
                                                className="btn-view" 
                                                onClick={() => handleViewClick(q.QID)}
                                            >
                                                📖 View Theory
                                            </button>
                                            {!q.tag?.includes("PYQ") && (
                                                <button
                                                    onClick={() => handleSolveClick(q.QID)}
                                                    className="btn-solve"
                                                >
                                                    🚀 Practice
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Theory;