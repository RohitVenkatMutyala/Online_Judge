import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTheme } from '../context/ThemeContext';
import Dnav from './dnav';
import { Tooltip } from 'bootstrap';
import { db, storage } from '../firebaseConfig';
import { doc, onSnapshot, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import axios from 'axios';
import ActivityCalendar from 'react-activity-calendar';
// REMOVED: The problematic CSS import is no longer needed.

function Dashboard() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_SERVER_API;

    // State for UI and Profile
    const [profileImage, setProfileImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // State for Stats and Heatmap
    const [stats, setStats] = useState({
        total: 0,
        solved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        totalEasy: 0,
        totalMedium: 0,
        totalHard: 0,
        byTopic: {},
        topics: [],
    });
    const [heatmapData, setHeatmapData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState('All');

    // NEW: Define the heatmap theme colors explicitly
    const explicitTheme = {
        light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
        dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    };

    // Effect for fetching user profile image
    useEffect(() => {
        if (!user?._id) return;
        const userDocRef = doc(db, 'users', user._id);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            const seed = `${user.firstname} ${user.lastname}`;
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setProfileImage(userData.profileImageURL || `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`);
            } else {
                setProfileImage(`https://api.dicebear.com/7.x/initials/svg?seed=${seed}`);
            }
        });
        return () => unsubscribe();
    }, [user]);
    
    // Effect for fetching ALL data (problems for stats, submissions for heatmap)
    useEffect(() => {
        if (!user?._id) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch problems for stats
                const problemsRes = await axios.get(`${API_URL}/problems/user/${user._id}`, { withCredentials: true });
                if (problemsRes.data.success) {
                    const problems = problemsRes.data.problems;
                    const solvedProblems = problems.filter(p => p.status === 'Solved');
                    
                    const topicStats = {};
                    const allTopics = new Set();
                    
                    problems.forEach(p => {
                        (p.tag?.split(',') || []).forEach(rawTag => {
                            const tag = rawTag.trim();
                            if (!tag) return;
                            allTopics.add(tag);
                            if (!topicStats[tag]) {
                                topicStats[tag] = { total: 0, solved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, totalEasy: 0, totalMedium: 0, totalHard: 0 };
                            }
                            topicStats[tag].total++;
                            const difficulty = p.difficulty.toLowerCase();
                            if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
                                topicStats[tag][`total${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`]++;
                            }

                            if (p.status === 'Solved') {
                                topicStats[tag].solved++;
                                if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
                                    topicStats[tag][`${difficulty}Solved`]++;
                                }
                            }
                        });
                    });

                    setStats({
                        total: problems.length,
                        solved: solvedProblems.length,
                        easySolved: solvedProblems.filter(p => p.difficulty === 'Easy').length,
                        mediumSolved: solvedProblems.filter(p => p.difficulty === 'Medium').length,
                        hardSolved: solvedProblems.filter(p => p.difficulty === 'Hard').length,
                        totalEasy: problems.filter(p => p.difficulty === 'Easy').length,
                        totalMedium: problems.filter(p => p.difficulty === 'Medium').length,
                        totalHard: problems.filter(p => p.difficulty === 'Hard').length,
                        byTopic: topicStats,
                        topics: ['All', ...Array.from(allTopics).sort()],
                    });
                }

                // Fetch submissions for heatmap
                const q = query(collection(db, "submissions"), where("id", "==", user._id));
                const querySnapshot = await getDocs(q);
                const submissionCounts = {};
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.submittedAt) { // Ensure timestamp exists
                        const date = new Date(data.submittedAt).toISOString().slice(0, 10);
                        submissionCounts[date] = (submissionCounts[date] || 0) + 1;
                    }
                });

                const formattedHeatmapData = Object.entries(submissionCounts).map(([date, count]) => ({
                    date,
                    count,
                    level: Math.min(4, Math.ceil(count / 2)),
                }));
                setHeatmapData(formattedHeatmapData);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Could not load your stats.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(el => new Tooltip(el));

    }, [user, API_URL]);

    const displayedStats = useMemo(() => {
        if (selectedTopic === 'All') {
            return {
                total: stats.total,
                solved: stats.solved,
                easySolved: stats.easySolved,
                mediumSolved: stats.mediumSolved,
                hardSolved: stats.hardSolved,
                totalEasy: stats.totalEasy,
                totalMedium: stats.totalMedium,
                totalHard: stats.totalHard,
            };
        }
        return stats.byTopic[selectedTopic] || { total: 0, solved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, totalEasy: 0, totalMedium: 0, totalHard: 0 };
    }, [selectedTopic, stats]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error("Invalid file type. Please select an image.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File is too large. Please select an image under 5MB.");
            return;
        }
        if (!user?._id) {
            toast.error("Please wait a moment and try again.");
            return;
        }

        setIsUploading(true);
        toast.info("Uploading image...");
        const storageRef = ref(storage, `profile_images/${user._id}`);
        try {
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await setDoc(doc(db, 'users', user._id), { profileImageURL: downloadURL }, { merge: true });
            toast.success("Profile image updated!");
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to update profile image.");
        } finally {
            setIsUploading(false);
        }
    };
    
    if (!user || user.role === 'admin') {
        return <div className="container mt-5"><div className="alert alert-danger text-center">You are not logged in.</div></div>;
    }
    
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
                                        <label htmlFor="profileUpload" className="profile-upload-label mb-4">
                                            <div className="profile-image-container rounded-circle shadow-lg overflow-hidden position-relative">
                                                {isUploading && <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)' }}><div className="spinner-border text-light" role="status"></div></div>}
                                                {profileImage ? <img src={profileImage} alt="Profile" className="w-100 h-100" /> : <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary"><div className="spinner-border text-light" role="status"></div></div>}
                                                <div className="profile-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"><i className="bi bi-camera-fill fs-4"></i></div>
                                            </div>
                                        </label>
                                        <input type="file" id="profileUpload" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} disabled={isUploading} />
                                        <div className="text-center">
                                            <h2 className="mb-1 fw-bold text-light">{user.firstname} {user.lastname}</h2>
                                            <p className="mb-3 text-light opacity-75">{user.email}</p>
                                            <div className="user-badge d-inline-flex align-items-center px-3 py-1 rounded-pill"><i className="bi bi-person-check-fill me-2"></i><span className="fw-semibold">Verified User</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-8 content-column">
                                    <div className="p-4 p-lg-5">
                                        <h1 className="fw-bold mb-2">Welcome Back!</h1>
                                        <p className="lead text-muted mb-4">Here's a snapshot of your coding journey.</p>
                                        {isLoading ? <div className="text-center py-5"><div className="spinner-border" role="status"></div></div> : (
                                        <>
                                            <div className="mb-5">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h4 className="fw-semibold mb-0">Progress Overview</h4>
                                                    <select className="form-select form-select-sm" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} style={{ width: 'auto' }}>
                                                        {stats.topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                                                    </select>
                                                </div>
                                                <div className="row g-3">
                                                    <div className="col-md-6 col-xl-3"><StatCard title="Total Solved" value={displayedStats.solved} total={displayedStats.total} icon="bi-check-all" color="primary" /></div>
                                                    <div className="col-md-6 col-xl-3"><StatCard title="Easy" value={displayedStats.easySolved} total={displayedStats.totalEasy} icon="bi-circle-square" color="success" /></div>
                                                    <div className="col-md-6 col-xl-3"><StatCard title="Medium" value={displayedStats.mediumSolved} total={displayedStats.totalMedium} icon="bi-square-half" color="warning" /></div>
                                                    <div className="col-md-6 col-xl-3"><StatCard title="Hard" value={displayedStats.hardSolved} total={displayedStats.totalHard} icon="bi-square-fill" color="danger" /></div>
                                                </div>
                                            </div>
                                            <div className="mb-5">
                                                <h4 className="fw-semibold mb-3">Submission Activity</h4>
                                                <div className="card p-3 heatmap-container">
                                                    <ActivityCalendar 
                                                        data={heatmapData} 
                                                        theme={explicitTheme} // Use the explicit theme object
                                                        blockSize={12} 
                                                        blockMargin={4} 
                                                        fontSize={14} 
                                                        showWeekdayLabels 
                                                        labels={{ totalCount: `{{count}} submissions in the last year` }} 
                                                    />
                                                </div>
                                            </div>
                                        </>
                                        )}
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
                .theme-dark .dashboard-container, .theme-dark .content-column { background-color: #1e1e2f; border: 1px solid #3a3a5a; color: #fff; }
                .theme-light .dashboard-container, .theme-light .content-column { background-color: #ffffff; border: 1px solid #dee2e6; color: #212529; }
                .profile-column { background: linear-gradient(160deg, #343a40, #1e1e2f); }
                .profile-image-container { width: 150px; height: 150px; cursor: pointer; border: 4px solid rgba(255,255,255,0.2); }
                .profile-image-container img { object-fit: cover; }
                .profile-upload-label:hover .profile-overlay { background: rgba(0,0,0,0.5); }
                .profile-upload-label:hover .profile-overlay i { opacity: 1 !important; color: white; }
                .profile-overlay { transition: all 0.3s ease; border-radius: 50%; }
                .profile-overlay i { opacity: 0; transition: all 0.3s ease; }
                .user-badge { background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444); color: white; }
                .theme-dark .stat-card { background-color: rgba(255,255,255,0.05); border: 1px solid #3a3a5a; }
                .theme-light .stat-card { background-color: #f8f9fa; border: 1px solid #dee2e6; }
                .icon-container { width: 50px; height: 50px; display: flex; align-items-center; justify-content: center; border-radius: 12px; }
                .theme-dark .heatmap-container { background-color: transparent; border: 1px solid #3a3a5a !important; }
                .theme-light .heatmap-container { background-color: #f8f9fa; border: 1px solid #dee2e6 !important; }
                .theme-dark .form-select { background-color: #2c3340; color: #fff; border-color: #3a3a5a; }
                .theme-light .form-select { background-color: #fff; color: #212529; border-color: #dee2e6; }
                .form-select:focus { box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25); border-color: #3b82f6; }
                
                /* Specific styles for ActivityCalendar to override defaults */
                .react-activity-calendar__legend-colors { margin-top: 10px !important; }
                .theme-dark .react-activity-calendar__count, .theme-dark .react-activity-calendar__weekday { color: #a9a9b3; }
                .theme-light .react-activity-calendar__count, .theme-light .react-activity-calendar__weekday { color: #555; }

                @media (max-width: 991.98px) {
                    .profile-column { border-radius: 1rem 1rem 0 0; }
                    .content-column { border-radius: 0 0 1rem 1rem; }
                    .profile-section { padding-bottom: 2rem !important; }
                }
            `}</style>
        </>
    );
}

export default Dashboard;