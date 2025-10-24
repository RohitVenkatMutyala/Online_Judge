import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTheme } from '../context/ThemeContext';
import Dnav from './dnav';
import { Tooltip as BootstrapTooltip } from 'bootstrap';
import { db, storage } from '../firebaseConfig';
import { doc, onSnapshot, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import axios from 'axios';
import ReactCalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import ReactMarkdown from "react-markdown";
import CircularProgressChart from './CircularProgressChart';
// --- ADD THIS NEW BLOCK: Badge Definitions ---
const STREAK_BADGES = [
    { days: 7, name: 'Weekly Warrior', icon: 'bi-calendar-week-fill', color: 'success' },
    { days: 21, name: 'Consistent Coder', icon: 'bi-moon-stars-fill', color: 'info' },
    { days: 49, name: 'Habitual Hacker', icon: 'bi-shield-check', color: 'primary' },
    { days: 75, name: 'Elite Engineer', icon: 'bi-trophy-fill', color: 'warning' },
    { days: 81, name: 'Legendary Loremaster', icon: 'bi-gem', color: 'danger' },
];
// --- END OF NEW BLOCK ---

function Dashboard() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_SERVER_API;

    // State for UI and Profile
    const [profileImage, setProfileImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [githubLink, setGithubLink] = useState('');
    const [linkedinLink, setLinkedinLink] = useState('');
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [tempGithub, setTempGithub] = useState('');
    const [tempLinkedin, setTempLinkedin] = useState('');

    // State for Stats and Heatmap
    const [stats, setStats] = useState({ /* ... */ });
    const [heatmapData, setHeatmapData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState('All');

    // --- ADD THIS NEW BLOCK: State for Streaks and Badges ---
    const [streakInfo, setStreakInfo] = useState({ current: 0, longest: 0 });
    const [awardedBadges, setAwardedBadges] = useState([]);
    // --- END OF NEW BLOCK ---

    // State for AI Resume Reviewer
    const [resumeText, setResumeText] = useState('');
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [reviewFeedback, setReviewFeedback] = useState('');
    const [latestReview, setLatestReview] = useState(null);
    const [viewingHistory, setViewingHistory] = useState(false);

    // Effect for fetching latest resume review
    useEffect(() => {
        if (!user?._id) return;
        const fetchLatestReview = async () => {
            const reviewDocRef = doc(db, 'resumeReviews', user._id);
            const docSnap = await getDoc(reviewDocRef);
            if (docSnap.exists()) {
                setLatestReview(docSnap.data());
            }
        };
        fetchLatestReview();
    }, [user]);

    // Effect for fetching user profile data
    useEffect(() => {
        if (!user?._id) return;
        const userDocRef = doc(db, 'users', user._id);
        const userUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
            const seed = `${user.firstname} ${user.lastname}`;
            if (docSnap.exists()) {
                setProfileImage(docSnap.data().profileImageURL || `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`);
            } else {
                setProfileImage(`https://api.dicebear.com/7.x/initials/svg?seed=${seed}`);
            }
        });

        const publicProfileDocRef = doc(db, 'publicProfiles', user._id);
        const publicProfileUnsubscribe = onSnapshot(publicProfileDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const publicData = docSnap.data();
                setGithubLink(publicData.githubLink || '');
                setLinkedinLink(publicData.linkedinLink || '');
                setTempGithub(publicData.githubLink || '');
                setTempLinkedin(publicData.linkedinLink || '');
            } else {
                setGithubLink(''); setLinkedinLink(''); setTempGithub(''); setTempLinkedin('');
            }
        });

        return () => { userUnsubscribe(); publicProfileUnsubscribe(); };
    }, [user]);

    // --- ADD THIS NEW BLOCK: Streak Calculation Logic ---
    const calculateStreaks = (submissionDates) => {
        if (submissionDates.length === 0) {
            return { current: 0, longest: 0 };
        }

        const uniqueDates = [...new Set(submissionDates)].sort();
        if (uniqueDates.length === 0) {
            return { current: 0, longest: 0 };
        }

        let longestStreak = 0;
        let currentStreak = 0;

        // Calculate longest streak
        for (let i = 0; i < uniqueDates.length; i++) {
            if (i === 0) {
                currentStreak = 1;
            } else {
                const currentDate = new Date(uniqueDates[i]);
                const prevDate = new Date(uniqueDates[i - 1]);
                const diffTime = currentDate - prevDate;
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, currentStreak);
                    currentStreak = 1;
                }
            }
        }
        longestStreak = Math.max(longestStreak, currentStreak);

        // Calculate current streak
        let activeCurrentStreak = 0;
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const todayStr = today.toISOString().slice(0, 10);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        const lastSubmissionDateStr = uniqueDates[uniqueDates.length - 1];

        if (lastSubmissionDateStr === todayStr || lastSubmissionDateStr === yesterdayStr) {
            activeCurrentStreak = currentStreak;
        }

        return { current: activeCurrentStreak, longest: longestStreak };
    };
    // --- END OF NEW BLOCK ---

    // Effect for fetching stats and heatmap data
    useEffect(() => {
        if (!user?._id) return;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch problems and calculate stats (existing logic)
                const problemsRes = await axios.get(`${API_URL}/problems/user/${user._id}`, { withCredentials: true });
                if (problemsRes.data.success) {
                    // ... (your existing stats calculation logic remains here)
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
                            const difficulty = p.difficulty?.toLowerCase();
                            if (['easy', 'medium', 'hard'].includes(difficulty)) {
                                topicStats[tag][`total${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`]++;
                            }

                            if (p.status === 'Solved') {
                                topicStats[tag].solved++;
                                if (['easy', 'medium', 'hard'].includes(difficulty)) {
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
                const submissionsQuery = query(collection(db, "submissions"), where("id", "==", user._id));
                const querySnapshot = await getDocs(submissionsQuery);
                const submissionCounts = {};
                const submissionDates = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.submittedAt) {
                        const date = new Date(data.submittedAt).toISOString().slice(0, 10);
                        submissionCounts[date] = (submissionCounts[date] || 0) + 1;
                        submissionDates.push(date);
                    }
                });
                const formattedHeatmapData = Object.entries(submissionCounts).map(([date, count]) => ({ date, count }));
                setHeatmapData(formattedHeatmapData);

                // --- ADD THIS NEW BLOCK: Calculate and set streaks/badges ---
                const calculatedStreaks = calculateStreaks(submissionDates);
                setStreakInfo(calculatedStreaks);
                setAwardedBadges(STREAK_BADGES.filter(badge => calculatedStreaks.longest >= badge.days));
                // --- END OF NEW BLOCK ---

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Could not load your stats.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(el => new BootstrapTooltip(el));
    }, [user, API_URL]);

    // All your other functions (displayedStats, handleImageChange, handleShare, handleUpdateLinks, handleResumeReview, etc.) remain unchanged.
    // ...
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
            await setDoc(doc(db, 'publicProfiles', user._id), { profileImageURL: downloadURL }, { merge: true });
            toast.success("Profile image updated!");
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to update profile image.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleShare = async () => {
        if (!user?._id) return;
        try {
            const publicProfileRef = doc(db, 'publicProfiles', user._id);
            await setDoc(publicProfileRef, {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                profileImageURL: profileImage,
                githubLink: githubLink,
                linkedinLink: linkedinLink
            }, { merge: true });
            const shareUrl = `${window.location.origin}/profile/${user._id}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                toast.success("Public profile URL copied to clipboard!");
            }).catch(err => {
                toast.error("Failed to copy URL.");
            });
        } catch (error) {
            toast.error("Could not create shareable link.");
        }
    };

    const handleUpdateLinks = async () => {
        if (!user?._id) {
            toast.error("User not found. Please try again.");
            return;
        }
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if ((tempGithub && !urlPattern.test(tempGithub)) || (tempLinkedin && !urlPattern.test(tempLinkedin))) {
            toast.warn("Please enter valid URLs.");
            return;
        }

        const toastId = toast.loading("Updating links...");
        const publicProfileDocRef = doc(db, 'publicProfiles', user._id);
        try {
            await setDoc(publicProfileDocRef, {
                githubLink: tempGithub,
                linkedinLink: tempLinkedin
            }, { merge: true });
            toast.update(toastId, { render: "Links updated successfully!", type: "success", isLoading: false, autoClose: 3000 });
            setShowLinkModal(false);
        } catch (error) {
            console.error("Error updating links:", error);
            toast.update(toastId, { render: "Failed to update links.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleResumeReview = async () => {
        if (!resumeText.trim()) {
            toast.warn("Please paste your resume text into the box first.");
            return;
        }
        setIsReviewing(true);
        setReviewFeedback("Connecting to AI Reviewer...");

        const shortenedPrompt = `
    Act as an expert technical recruiter for a software engineering role or any other related position based on the resume not only the software engineering role. 
    Provide a structured review of the following resume. 
    Include sections for: Overall Impression, Strengths, Areas for Improvement (with specific examples), an estimated ATS Score out of 100, and finally, provide the fully revised resume in LaTeX code.
    And dont include anything related to the QID that was given as the dummy question to the AI dont include it in the review.
    Resume to review:
    ---
    ${resumeText}`;

        try {
            // The request still goes to the same backend endpoint
            const response = await axios.post(`${API_URL}/help`, { code: shortenedPrompt, QID: 2 });

            const result = response.data.result || "The AI could not provide a review at this time.";
            setReviewFeedback(result);

            const reviewDocRef = doc(db, 'resumeReviews', user._id);
            const newReview = {
                feedback: result,
                reviewedAt: new Date().toISOString(),
                userId: user._id
            };
            await setDoc(reviewDocRef, newReview);
            setLatestReview(newReview);

        } catch (error) {
            console.error("AI Resume Review error:", error);
            setReviewFeedback("An error occurred while contacting the AI service. Please try again or try later.");
            toast.error("Failed to get resume review.");
        } finally {
            setIsReviewing(false);
        }
    };

    const resetAndCloseResumeModal = () => {
        setShowResumeModal(false);
        setResumeText('');
        setReviewFeedback('');
        setViewingHistory(false);
    };
    // ...

    if (!user || user.role === 'admin') {
        return <div className="container mt-5"><div className="alert alert-danger text-center">You are not logged in.</div></div>;
        navigate('/login');
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

    const NavCard = ({ title, description, icon, path }) => (
        <div className="nav-card" onClick={() => navigate(path)}>
            <div className="d-flex align-items-center p-4 rounded-3 h-100">
                <div className="nav-icon me-4"><i className={`bi ${icon}`}></i></div>
                <div className="flex-grow-1">
                    <h5 className="mb-1 fw-bold">{title}</h5>
                    <p className="mb-0 small text-muted">{description}</p>
                </div>
                <div className="nav-arrow"><i className="bi bi-arrow-right-circle-fill"></i></div>
            </div>
        </div>
    );

    const today = new Date();
    const startDate = new Date(new Date().setDate(today.getDate() - 365));

    return (
        <>
            <Dnav />
            <div className={`container-fluid px-lg-4 py-5 dashboard-page theme-${theme}`}>
                <div className="row g-4 justify-content-center">
                    <div className="col-12 col-xl-11">
                        <div className="dashboard-container rounded-4 overflow-hidden">
                            <div className="content-column p-4 p-lg-5">
                                <div className="row g-4 align-items-center mb-5">
                                    <div className="col-12 col-md-auto">
                                        <label htmlFor="profileUpload" className="profile-upload-label">
                                            <div className="profile-image-container rounded-circle shadow-lg overflow-hidden position-relative mx-auto">
                                                {isUploading && <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)' }}><div className="spinner-border text-light" role="status"></div></div>}
                                                {profileImage ? <img src={profileImage} alt="Profile" className="w-100 h-100" /> : <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary"><div className="spinner-border text-light" role="status"></div></div>}
                                                <div className="profile-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"><i className="bi bi-camera-fill fs-4"></i></div>
                                            </div>
                                        </label>
                                        <input type="file" id="profileUpload" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} disabled={isUploading} />
                                    </div>

                                    <div className="col-12 col-md">
                                        <h1 className="fw-bold mb-1">Hello 👋, {user.firstname}!</h1>
                                        <p className="lead text-muted mb-2">{user.email}</p>
                                        <div className="d-flex align-items-center flex-wrap gap-2">
                                            <div className="user-badge d-inline-flex align-items-center px-3 py-1 rounded-pill">
                                                <i className="bi bi-person-check-fill me-2"></i>
                                                <span className="fw-semibold small">Verified User</span>
                                            </div>
                                            <button className="btn btn-share rounded-pill" onClick={handleShare}>
                                                <i className="bi bi-share-fill me-1"></i> Share
                                            </button>
                                            <div className="vr d-none d-sm-block mx-2"></div>
                                            {githubLink && (
                                                <a href={githubLink} target="_blank" rel="noopener noreferrer" className="social-link" data-bs-toggle="tooltip" title="View GitHub Profile">
                                                    <i className="bi bi-github fs-4"></i>
                                                </a>
                                            )}
                                            {linkedinLink && (
                                                <a href={linkedinLink} target="_blank" rel="noopener noreferrer" className="social-link" data-bs-toggle="tooltip" title="View LinkedIn Profile">
                                                    <i className="bi bi-linkedin fs-4"></i>
                                                </a>
                                            )}
                                            <button className="btn btn-edit-profile rounded-pill ms-sm-auto" onClick={() => setShowLinkModal(true)}>
                                                <i className="bi bi-pencil-square me-1"></i> Edit Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {isLoading ? <div className="text-center py-5"><div className="spinner-border" role="status"></div></div> : (
                                    <>
                                        {/* Existing Progress Overview */}
                                        <div className="mb-5">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h4 className="fw-semibold mb-0">Progress Overview</h4>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={selectedTopic}
                                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                                    style={{ width: 'auto' }}
                                                >
                                                    {stats.topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                                                </select>
                                            </div>

                                            {/* The old row of StatCards is now replaced by this single component */}
                                            <CircularProgressChart
                                                solved={displayedStats.solved}
                                                total={displayedStats.total}
                                                easySolved={displayedStats.easySolved}
                                                totalEasy={displayedStats.totalEasy}
                                                mediumSolved={displayedStats.mediumSolved}
                                                totalMedium={displayedStats.totalMedium}
                                                hardSolved={displayedStats.hardSolved}
                                                totalHard={displayedStats.totalHard}
                                            />
                                        </div>

                                        {/* --- ADD THIS NEW BLOCK: Achievements & Streaks Section --- */}
                                        <div className="mb-5">
                                            <h4 className="fw-semibold mb-3">Achievements & Streaks</h4>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <div className="streak-card card h-100 p-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="icon-container text-danger bg-danger-subtle me-3">
                                                                <i className="bi bi-fire fs-4"></i>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted mb-0">Current Streak</p>
                                                                <h4 className="fw-bold mb-0">{streakInfo.current} Days</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="streak-card card h-100 p-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="icon-container text-warning bg-warning-subtle me-3">
                                                                <i className="bi bi-trophy-fill fs-4"></i>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted mb-0">Longest Streak</p>
                                                                <h4 className="fw-bold mb-0">{streakInfo.longest} Days</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {awardedBadges.length > 0 && (
                                                <div className="mt-4">
                                                    <h5 className="fw-semibold mb-3">Badges Earned</h5>
                                                    <div className="d-flex flex-wrap gap-3">
                                                        {awardedBadges.map(badge => (
                                                            <div key={badge.name} className={`badge-card text-center p-3 rounded-3 bg-${badge.color}-subtle`} data-bs-toggle="tooltip" title={`${badge.name} - ${badge.days} Day Streak`}>
                                                                <i className={`${badge.icon} fs-2 text-${badge.color}`}></i>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* --- END OF NEW BLOCK --- */}


                                        {/* Existing Submission Activity */}
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

                                        {/* Existing Explore Section */}
                                        <div>
                                            <h4 className="fw-semibold mb-3">Explore</h4>
                                            <div className="row g-3">
                                                <div className="col-12"><NavCard title="Live Sessions" description="Collaborative coding with integrated chat" icon="bi-broadcast-pin" path="/new-chat" /></div>
                                                <div className="col-12"><NavCard title="Solve Problems" description="Practice coding with our curated problem sets" icon="bi-puzzle-fill" path="/problems" /></div>
                                                <div className="col-12"><NavCard title="Fundamentals" description="Master the core concepts and principles" icon="bi-book-half" path="/funda" /></div>
                                                <div className="col-12"><NavCard
                                                    title="Folders"
                                                    description="Create, manage, and share your collaborative folders and files."
                                                    icon="bi-collection-fill"
                                                    path="/folders"
                                                />
                                                </div>
                                                <div className="col-12"><NavCard title="Contests" description="Explore real-world examples and use cases" icon="bi-collection-fill" path="/contexts" /></div>
                                                <div className="col-12"><NavCard title="Submissions" description="Review your previous solutions and progress" icon="bi-check2-square" path="/sub" /></div>

                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                className="btn btn-primary rounded-circle shadow-lg floating-ai-btn"
                onClick={() => setShowResumeModal(true)}
                data-bs-toggle="tooltip"
                data-bs-placement="left"
                title="CodeHub AI Resume Reviewer" >
                <i className="bi bi-robot fs-4"></i>
            </button>

            {/* --- ADD THIS NEW BLOCK: CSS Styles for Badges and Streaks --- */}
            <style>{`
                /* ... Existing styles ... */
                .theme-dark .dashboard-page { background-color: #12121c; }
                .theme-light .dashboard-page { background-color: #f8f9fa; }
                .dashboard-container { min-height: 85vh; }
                .theme-dark .dashboard-container { background-color: #1e1e2f; border: 1px solid #3a3a5a; color: #fff; }
                .theme-light .dashboard-container { background-color: #ffffff; border: 1px solid #dee2e6; color: #212529; }
                .profile-image-container { width: 120px; height: 120px; cursor: pointer; border: 4px solid rgba(255,255,255,0.2); }
                .theme-light .profile-image-container { border-color: #dee2e6; }
                .profile-image-container img { object-fit: cover; }
                .profile-upload-label:hover .profile-overlay { background: rgba(0,0,0,0.5); }
                .profile-upload-label:hover .profile-overlay i { opacity: 1 !important; color: white; }
                .profile-overlay { transition: all 0.3s ease; border-radius: 50%; }
                .profile-overlay i { opacity: 0; transition: all 0.3s ease; }
                .user-badge { background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444); color: white; }
                .btn-share { background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s ease; padding: 0.25rem 0.75rem; font-size: 0.8rem; }
                .theme-light .btn-share { background: #e9ecef; color: #495057; border-color: #dee2e6; }
                .btn-share:hover { transform: translateY(-2px); background: linear-gradient(90deg, #3b82f6, #8b5cf6); color: white; border-color: transparent; }
                .theme-dark .stat-card { background-color: rgba(255,255,255,0.05); border: 1px solid #3a3a5a; }
                .theme-light .stat-card { background-color: #f8f9fa; border: 1px solid #dee2e6; }
                .icon-container { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
                .theme-dark .form-select { background-color: #2c3340; color: #fff; border-color: #3a3a5a; }
                .theme-light .form-select { background-color: #fff; color: #212529; border-color: #dee2e6; }
                .form-select:focus { box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25); border-color: #3b82f6; }
                .nav-card { cursor: pointer; transition: all 0.2s ease-in-out; border-radius: 0.5rem; }
                .theme-dark .nav-card { background-color: rgba(255,255,255,0.05); }
                .theme-light .nav-card { background-color: #f8f9fa; }
                .theme-dark .nav-card:hover { background-color: rgba(255,255,255,0.1); transform: translateY(-3px); }
                .theme-light .nav-card:hover { background-color: #e9ecef; transform: translateY(-3px); }
                .nav-icon { font-size: 1.5rem; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
                .theme-dark .nav-icon { background-color: rgba(255,255,255,0.1); color: #fff; }
                .theme-light .nav-icon { background-color: #e9ecef; color: #495057; }
                .nav-arrow { font-size: 1.5rem; transition: transform 0.2s ease-in-out; }
                .theme-dark .nav-arrow { color: #6c757d; }
                .theme-light .nav-arrow { color: #adb5bd; }
                .nav-card:hover .nav-arrow { transform: translateX(5px); }
                .theme-dark .heatmap-container { background-color: transparent; border: 1px solid #3a3a5a !important; }
                .theme-light .heatmap-container { background-color: #f8f9fa; border: 1px solid #dee2e6 !important; }
                .react-calendar-heatmap text { font-size: 10px; fill: #aaa; }
                .react-calendar-heatmap .color-empty, .react-calendar-heatmap .color-github-0 { fill: ${theme === 'dark' ? '#161b22' : '#ebedf0'}; }
                .react-calendar-heatmap .color-github-1 { fill: #0e4429; }
                .react-calendar-heatmap .color-github-2 { fill: #006d32; }
                .react-calendar-heatmap .color-github-3 { fill: #26a641; }
                .react-calendar-heatmap .color-github-4 { fill: #39d353; }
                .social-link { color: #adb5bd; transition: all 0.2s ease-in-out; }
                .social-link:hover { color: #fff; transform: scale(1.1); }
                .theme-light .social-link { color: #6c757d; }
                .theme-light .social-link:hover { color: #000; }
                .btn-edit-profile { background-color: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
                .theme-light .btn-edit-profile { background: #e9ecef; color: #495057; border-color: #dee2e6; }
                .btn-edit-profile:hover { background: linear-gradient(90deg, #3b82f6, #8b5cf6); color: white; border-color: transparent; transform: translateY(-2px); }
                .markdown-content { white-space: pre-wrap; word-wrap: break-word; }
                .floating-ai-btn { position: fixed; bottom: 2rem; right: 2rem; width: 60px; height: 60px; z-index: 1050; display: flex; align-items: center; justify-content: center; }
                .theme-dark .resume-textarea { background-color: #161b22; color: #fff; border-color: #3a3a5a; }
                .theme-light .resume-textarea { background-color: #fff; color: #212529; border-color: #dee2e6; }
                .resume-textarea:focus { box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25); border-color: #3b82f6; }

                .theme-dark .streak-card { background-color: rgba(255,255,255,0.05); border: 1px solid #3a3a5a; }
                .theme-light .streak-card { background-color: #f8f9fa; border: 1px solid #dee2e6; }
                
                .badge-card {
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    transition: transform 0.2s ease-in-out;
                    cursor: pointer;
                }
                .badge-card:hover {
                    transform: scale(1.1);
                }
                    .btn-CodeHub-ai {
  background: linear-gradient(90deg, #6e48aa, #9448a0); /* A nice purple gradient */
  color: #ffffff;
  border: none;
  font-weight: 500;
  border-radius: 8px; /* Slightly more rounded corners */
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-CodeHub-ai:hover {
  transform: translateY(-2px); /* Subtle lift effect on hover */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}
  .floating-ai-btn {
  /* Positioning */
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 1050; /* Make sure it's above other content */

  /* Sizing */
  width: 60px;
  height: 60px;

  /* Custom "CodeHub AI" Theme */
  background: linear-gradient(45deg, #6e48aa, #9448a0) !important; /* Gradient background */
  border: none !important; /* Override Bootstrap's default border */

  /* Ensure icon is centered */
  display: flex;
  justify-content: center;
  align-items: center;

  /* Smooth transitions for hover effects */
  transition: all 0.3s ease;
}

/* Enhanced hover effect */
.floating-ai-btn:hover {
  transform: translateY(-3px); /* Lifts the button slightly */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25) !important; /* Enhance shadow on hover */
}
  .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .markdown-content p {
          margin-bottom: 1.5rem;
        }
        
        .markdown-content code {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.9em;
          color: #e53e3e;
        }
        
        .markdown-content pre {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 12px;
          overflow-x: auto;
          margin: 1.5rem 0;
          border-left: 4px solid #ff416c;
        }
        
        .markdown-content pre code {
          background: transparent;
          color: inherit;
          border: none;
          padding: 0;
        }
        
        .markdown-content ul,
        .markdown-content ol {
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }
        
        .markdown-content li {
          margin-bottom: 0.5rem;
        }
        
        .markdown-content blockquote {
          border-left: 4px solid #11998e;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          border-radius: 8px;
        }
        
        /* Light theme styles */
        [data-bs-theme="light"] .markdown-content h1,
        [data-bs-theme="light"] .markdown-content h2,
        [data-bs-theme="light"] .markdown-content h3,
        [data-bs-theme="light"] .markdown-content h4,
        [data-bs-theme="light"] .markdown-content h5,
        [data-bs-theme="light"] .markdown-content h6 {
          color: #2d3748;
        }
        
        [data-bs-theme="light"] .markdown-content p,
        [data-bs-theme="light"] .markdown-content li {
          color: #4a5568;
        }
        
        [data-bs-theme="light"] .markdown-content code {
          background: linear-gradient(135deg, #f7fafc, #edf2f7);
          border: 1px solid #e2e8f0;
        }
        
        [data-bs-theme="light"] .markdown-content blockquote {
          background: linear-gradient(135deg, #f0fff4, #e6fffa);
          color: #2d3748;
        }
        
        [data-bs-theme="light"] .info-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        /* Dark theme styles */
        [data-bs-theme="dark"] .markdown-content h1,
        [data-bs-theme="dark"] .markdown-content h2,
        [data-bs-theme="dark"] .markdown-content h3,
        [data-bs-theme="dark"] .markdown-content h4,
        [data-bs-theme="dark"] .markdown-content h5,
        [data-bs-theme="dark"] .markdown-content h6 {
          color: #e2e8f0;
        }
        
        [data-bs-theme="dark"] .markdown-content p,
        [data-bs-theme="dark"] .markdown-content li {
          color: #a0aec0;
        }
        
        [data-bs-theme="dark"] .markdown-content code {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          border: 1px solid #4a5568;
          color: #fbb6ce;
        }
        
        [data-bs-theme="dark"] .markdown-content blockquote {
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1));
          color: #e2e8f0;
        }
             [data-bs-theme="dark"] .info-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          border: 1px solid rgba(102, 126, 234, 0.2);
        }
        
        [data-bs-theme="dark"] .problem-card {
          background: #1a202c;
        }
        
        [data-bs-theme="dark"] .card-header,
        [data-bs-theme="dark"] .card-footer {
          background: #1a202c !important;
        }
        
        .info-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
          /* Styling for the new Circular Progress Chart */

.progress-container.card {
    background-color: #2D2D2D !important; /* Slightly lighter dark background from image */
    border: 1px solid #444; /* Darker border for contrast */
    border-radius: 10px; /* Slightly more rounded corners */
    padding: 20px 30px; /* Adjusted padding */
}

/* Styles for the text in the center of the chart */
.center-text {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    line-height: 1.2; /* Adjusted line height */
    text-align: center;
}

.center-text .solved-count {
    font-size: 2.5rem; /* Larger font size for solved count */
    font-weight: 600; /* Slightly less bold */
    color: #E0E0E0; /* Lighter white for the number */
}

.center-text .total-count {
    font-size: 1.1rem; /* Slightly larger total count */
    color: #999; /* Softer gray */
    margin-top: 5px; /* More space between solved and total */
}

.center-text .solved-label {
    font-size: 0.95rem; /* Adjusted font size */
    color: #6C757D; /* Bootstrap muted gray, consistent */
    margin-top: 8px; /* Space below total count */
    font-weight: 500;
}


/* Styles for the breakdown items (Easy, Med, Hard) on the right side */
.stat-item {
    background-color: #3C3C3C; /* Darker background for stat items */
    padding: 0.7rem 1.2rem; /* Adjusted padding */
    border-radius: 8px;
    width: 180px; /* Fixed width as in the image */
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px; /* Space between items */
    font-size: 0.95rem; /* Consistent font size */
}

/* Remove margin from the last item */
.stat-item:last-child {
    margin-bottom: 0 !important;
}

.stat-item .stat-label {
    font-weight: 500; /* Medium weight */
    margin-right: 10px; /* Space between label and value */
    color: #E0E0E0; /* Lighter color for labels */
}

.stat-item .stat-value {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* More modern font */
    font-size: 1rem;
    color: #ced4da;
    font-weight: 500;
}
            `}</style>

            {/* All Modals (Link Modal, Resume Review Modal) remain unchanged */}
            {/* ... Your existing modal JSX code ... */}
            {showResumeModal && (
                <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold d-flex align-items-center">
                                    <i className="bi bi-robot me-2"></i>
                                    {/* FIX: Removed the trailing space from "CodeHub AI " and added more context */}
                                    <span>
                                        {viewingHistory ? "Latest Review History" : "CodeHub AI Resume Reviewer"}
                                    </span>
                                </h5>
                                <button type="button" className={`btn-close ${theme === 'dark' ? 'btn-close-white' : ''}`} onClick={resetAndCloseResumeModal}></button>
                            </div>
                            <div className="modal-body">
                                {isReviewing ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <p className="mt-3 fw-semibold">{reviewFeedback}</p>
                                    </div>
                                ) : reviewFeedback ? (
                                    <>
                                        <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => { setReviewFeedback(''); setResumeText(''); }}>
                                            <i className="bi bi-arrow-left"></i> Review Another Resume
                                        </button>
                                        <div className="markdown-content"><ReactMarkdown>{reviewFeedback}</ReactMarkdown></div>
                                    </>
                                ) : viewingHistory ? (
                                    <>
                                        <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => setViewingHistory(false)}>
                                            <i className="bi bi-arrow-left"></i> Back to Reviewer
                                        </button>
                                        {latestReview ? (
                                            <div>
                                                <p className="text-muted small">Reviewed on: {new Date(latestReview.reviewedAt).toLocaleString()}</p>
                                                <hr />
                                                <div data-bs-theme={theme}>
                                                    <div className="markdown-content mt-4"><ReactMarkdown>{latestReview.feedback}</ReactMarkdown></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p>No review history found.</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <p className="mb-0 text-muted">Paste your resume text below for instant feedback.</p>
                                            {latestReview && (
                                                <button className="btn btn-link text-decoration-none btn-sm" onClick={() => setViewingHistory(true)}>
                                                    View Latest Review <i className="bi bi-clock-history"></i>
                                                </button>
                                            )}
                                        </div>
                                        <textarea
                                            className="form-control resume-textarea"
                                            rows="12"
                                            placeholder="Paste the full text of your resume here..."
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                        ></textarea>
                                        <button className="btn btn-CodeHub-ai w-100 mt-3" onClick={handleResumeReview}>
                                            <i className="bi bi-magic me-2"></i>Review with CodeHub AI
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showLinkModal && (
                <div className="modal show fade" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-link-45deg me-2"></i> Update Your Profile Links
                                </h5>
                                <button type="button" className={`btn-close ${theme === 'dark' ? 'btn-close-white' : ''}`} onClick={() => setShowLinkModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="githubLinkInput" className="form-label text-muted">GitHub Profile URL</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-github"></i></span>
                                        <input type="text" className="form-control" id="githubLinkInput" placeholder="https://github.com/username" value={tempGithub} onChange={(e) => setTempGithub(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="linkedinLinkInput" className="form-label text-muted">LinkedIn Profile URL</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-linkedin"></i></span>
                                        <input type="text" className="form-control" id="linkedinLinkInput" placeholder="https://linkedin.com/in/username" value={tempLinkedin} onChange={(e) => setTempLinkedin(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowLinkModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleUpdateLinks}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Dashboard;