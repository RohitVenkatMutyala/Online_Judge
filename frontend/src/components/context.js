import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // Import Bootstrap Icons for the calendar icon
import Navbar from "./navbar";

const Contexts = () => {
    const { user } = useAuth();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * Generates a Google Calendar event link for a given contest.
     * @param {object} contest - The contest object with name, start_time, end_time, url, and site.
     * @returns {string} The generated URL for adding the event to Google Calendar.
     */
    const generateGoogleCalendarLink = (contest) => {
        // Google Calendar requires dates in 'YYYYMMDDTHHMMSSZ' format.
        // This function converts an ISO string to that format.
        const formatDate = (dateString) => {
            return new Date(dateString).toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
        };

        const startTime = formatDate(contest.start_time);
        const endTime = formatDate(contest.end_time);

        // URLSearchParams automatically handles encoding of special characters in the text and details.
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: contest.name,
            dates: `${startTime}/${endTime}`,
            details: `Get ready for the coding challenge! 🚀\n\nContest Link: ${contest.url}`,
            location: contest.site,
        });

        return `https://www.google.com/calendar/render?${params.toString()}`;
    };

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await fetch("https://codeforces.com/api/contest.list");
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();

                const upcomingContests = data.result
                    .filter(contest => contest.phase === "BEFORE") // Filter for only upcoming contests
                    .slice(0, 20) // Limit to the first 20 results
                    .map(contest => ({
                        name: contest.name,
                        site: "Codeforces",
                        start_time: new Date(contest.startTimeSeconds * 1000).toISOString(),
                        end_time: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000).toISOString(),
                        duration: contest.durationSeconds,
                        url: `https://codeforces.com/contest/${contest.id}`
                    }));

                setContests(upcomingContests.reverse()); // Show newest upcoming contests first
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch contests from Codeforces:", err.message);
                setLoading(false);
            }
        };

        fetchContests();
    }, []); // Empty dependency array ensures this effect runs only once on mount

    // Protect the route from unauthenticated users or admins
    if (!user || user.role === 'admin') {
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
                <h2
                    className="text-center mb-4 fw-bold"
                    style={{
                        background: 'linear-gradient(to right, #f12711, #f5af19)',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent'
                    }}
                >
                    🚀 Upcoming Coding Contests
                </h2>

                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border text-warning" role="status" />
                    </div>
                ) : contests.length === 0 ? (
                    <p className="text-center text-muted">No upcoming contests available.</p>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {contests.map((contest, index) => (
                            <div className="col" key={index}>
                                <div className="card h-100 shadow border-0 border-start border-5 border-warning">
                                    <div className="card-body d-flex flex-column">
                                        <h5
                                            className="card-title fw-semibold"
                                            style={{
                                                background: 'linear-gradient(to right, #f12711, #f5af19)',
                                                WebkitBackgroundClip: 'text',
                                                color: 'transparent'
                                            }}
                                        >
                                            {contest.name}
                                        </h5>
                                        <span className="badge bg-warning text-dark mb-2 align-self-start">
                                            {contest.site}
                                        </span>

                                        <ul className="list-unstyled small mt-2">
                                            <li><strong>Start:</strong> {new Date(contest.start_time).toLocaleString()}</li>
                                            <li><strong>End:</strong> {new Date(contest.end_time).toLocaleString()}</li>
                                            <li><strong>Duration:</strong> {(contest.duration / 3600).toFixed(2)} hours</li>
                                        </ul>

                                        <div className="mt-auto d-flex gap-2">
                                            <a
                                                href={generateGoogleCalendarLink(contest)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline-info flex-grow-1 d-flex align-items-center justify-content-center"
                                            >
                                                <i className="bi bi-calendar-plus me-2"></i>Calendar
                                            </a>
                                            <a
                                                href={contest.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline-warning flex-grow-1"
                                            >
                                                Visit
                                            </a>
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

export default Contexts;