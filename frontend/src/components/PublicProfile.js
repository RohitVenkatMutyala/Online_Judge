import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTheme } from '../context/ThemeContext';
import Dnav from './dnav';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import axios from 'axios';
import ReactCalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

function PublicProfile() {
    const { userId } = useParams();
    const { theme } = useTheme();
    const API_URL = process.env.REACT_APP_SERVER_API;

    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        solved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        totalEasy: 0,
        totalMedium: 0,
        totalHard: 0,
    });
    const [heatmapData, setHeatmapData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setError("No user ID provided.");
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch user info from Firestore
                const userDocRef = doc(db, 'users', userId);
                const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUser(docSnap.data());
                    } else {
                        setError("User not found.");
                        setUser(null);
                    }
                });

                // Fetch problems stats
                const problemsRes = await axios.get(`${API_URL}/problems/user/${userId}`);
                if (problemsRes.data.success) {
                    const problems = problemsRes.data.problems;
                    const solvedProblems = problems.filter(p => p.status === 'Solved');
                    setStats({
                        total: problems.length,
                        solved: solvedProblems.length,
                        easySolved: solvedProblems.filter(p => p.difficulty === 'Easy').length,
                        mediumSolved: solvedProblems.filter(p => p.difficulty === 'Medium').length,
                        hardSolved: solvedProblems.filter(p => p.difficulty === 'Hard').length,
                        totalEasy: problems.filter(p => p.difficulty === 'Easy').length,
                        totalMedium: problems.filter(p => p.difficulty === 'Medium').length,
                        totalHard: problems.filter(p => p.difficulty === 'Hard').length,
                    });
                }

                // Fetch submissions for heatmap
                const submissionsQuery = query(collection(db, "submissions"), where("id", "==", userId));
                const querySnapshot = await getDocs(submissionsQuery);
                const submissionCounts = {};
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.submittedAt) {
                        const date = new Date(data.submittedAt).toISOString().slice(0, 10);
                        submissionCounts[date] = (submissionCounts[date] || 0) + 1;
                    }
                });
                const formattedHeatmapData = Object.entries(submissionCounts).map(([date, count]) => ({ date, count }));
                setHeatmapData(formattedHeatmapData);
                
                return () => unsubscribe(); // Cleanup snapshot listener

            } catch (err) {
                console.error("Error fetching public profile data:", err);
                setError("Failed to load profile data.");
                toast.error("Could not load the profile.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId, API_URL]);

    const StatCard = ({ title, value, total, icon, color }) => (
        <div className="stat-card card h-100 p-3">
            <div className="d-flex align-items-center">
                <div className={`icon-container text-${color} bg-${color}-subtle me-3`}>
                    <i className={`bi ${icon} fs-4`}></i>
                </div>
                <div>
                    <p className="text-muted mb-0">{title}</p>
                    <h4 className="fw-bold mb-0">{value} / {total}</h4>
                </div>
            </div>
        </div>
    );
    
    const today = new Date();
    const startDate = new Date(new Date().setDate(today.getDate() - 365));

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <>
                <Dnav />
                <div className="container mt-5">
                    <div className="alert alert-danger text-center">{error || "User data could not be loaded."}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Dnav />
            <div className={`container-fluid px-lg-4 py-5 dashboard-page theme-${theme}`}>
                <div className="row g-4 justify-content-center">
                    <div className="col-12 col-xl-11">
                        <div className="dashboard-container rounded-4 overflow-hidden">
                            <div className="row g-0 h-100">
                                <div className="col-12 col-lg-4 profile-column">
                                    <div className="profile-section h-100 d-flex flex-column align-items-center justify-content-center p-4">
                                        <div className="profile-image-container rounded-circle shadow-lg overflow-hidden position-relative mb-4">
                                            <img src={user.profileImageURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstname} ${user.lastname}`} alt="Profile" className="w-100 h-100" />
                                        </div>
                                        <div className="text-center">
                                            <h2 className="mb-1 fw-bold text-light">{user.firstname} {user.lastname}</h2>
                                            <p className="mb-3 text-light opacity-75">{user.email}</p>
                                            <div className="user-badge d-inline-flex align-items-center px-3 py-1 rounded-pill"><i className="bi bi-person-check-fill me-2"></i><span className="fw-semibold">Verified User</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-8 content-column">
                                    <div className="p-4 p-lg-5">
                                        <h1 className="fw-bold mb-2">{user.firstname}'s Profile</h1>
                                        <p className="lead text-muted mb-4">A snapshot of their coding journey.</p>
                                        
                                        <div className="mb-5">
                                            <h4 className="fw-semibold mb-3">Progress Overview</h4>
                                            <div className="row g-3">
                                                <div className="col-md-6 col-xl-3"><StatCard title="Total Solved" value={stats.solved} total={stats.total} icon="bi-check-all" color="primary" /></div>
                                                <div className="col-md-6 col-xl-3"><StatCard title="Easy" value={stats.easySolved} total={stats.totalEasy} icon="bi-circle-square" color="success" /></div>
                                                <div className="col-md-6 col-xl-3"><StatCard title="Medium" value={stats.mediumSolved} total={stats.totalMedium} icon="bi-square-half" color="warning" /></div>
                                                <div className="col-md-6 col-xl-3"><StatCard title="Hard" value={stats.hardSolved} total={stats.totalHard} icon="bi-square-fill" color="danger" /></div>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-5">
                                            <h4 className="fw-semibold mb-3">Submission Activity</h4>
                                            <div className="heatmap-container card p-3">
                                                <ReactCalendarHeatmap
                                                    startDate={startDate}
                                                    endDate={today}
                                                    values={heatmapData}
                                                    classForValue={(value) => `color-github-${!value ? 0 : Math.min(4, value.count)}`}
                                                    tooltipDataAttrs={value => {
                                                        if (!value || !value.date) return { 'data-tooltip-id': null };
                                                        const dateStr = new Date(value.date).toDateString();
                                                        const countStr = `${value.count || 0} submissions`;
                                                        return { 'data-tooltip-id': 'heatmap-tooltip', 'data-tooltip-content': `${dateStr}: ${countStr}` };
                                                    }}
                                                />
                                                <ReactTooltip id="heatmap-tooltip" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .theme-dark .dashboard-page { background-color: #12121c; }
                .theme-light .dashboard-page { background-color: #f8f9fa; }
                .dashboard-container { min-height: 85vh; }
                .theme-dark .dashboard-container, .theme-dark .content-column { background-color: #1e1e2f; border: 1px solid #3a3a5a; color: #fff; }
                .theme-light .dashboard-container, .theme-light .content-column { background-color: #ffffff; border: 1px solid #dee2e6; color: #212529; }
                .profile-column { background: linear-gradient(160deg, #343a40, #1e1e2f); }
                .profile-image-container { width: 180px; height: 180px; border: 4px solid rgba(255,255,255,0.2); }
                .profile-image-container img { object-fit: cover; }
                .user-badge { background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444); color: white; }
                .theme-dark .stat-card { background-color: rgba(255,255,255,0.05); border: 1px solid #3a3a5a; }
                .theme-light .stat-card { background-color: #f8f9fa; border: 1px solid #dee2e6; }
                .icon-container { width: 50px; height: 50px; display: flex; align-items-center; justify-content: center; border-radius: 12px; }
                .theme-dark .heatmap-container { background-color: transparent; border: 1px solid #3a3a5a !important; }
                .theme-light .heatmap-container { background-color: #f8f9fa; border: 1px solid #dee2e6 !important; }
                .react-calendar-heatmap text { font-size: 10px; fill: #aaa; }
                .react-calendar-heatmap .color-empty, .react-calendar-heatmap .color-github-0 { fill: ${theme === 'dark' ? '#161b22' : '#ebedf0'}; }
                .react-calendar-heatmap .color-github-1 { fill: #0e4429; }
                .react-calendar-heatmap .color-github-2 { fill: #006d32; }
                .react-calendar-heatmap .color-github-3 { fill: #26a641; }
                .react-calendar-heatmap .color-github-4 { fill: #39d353; }
                @media (max-width: 991.98px) {
                    .profile-column { border-radius: 1rem 1rem 0 0; }
                    .content-column { border-radius: 0 0 1rem 1rem; }
                    .profile-section { padding-bottom: 2rem !important; }
                }
            `}</style>
        </>
    );
}

export default PublicProfile;

