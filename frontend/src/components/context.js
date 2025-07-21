import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./navbar";

const Contexts = () => {
    const {user} =useAuth();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await fetch("https://codeforces.com/api/contest.list");
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();

                const upcomingContests = data.result
                    .filter(contest => contest.phase === "BEFORE")
                    .slice(0, 20) // Show only first 20 upcoming contests
                    .map(contest => ({
                        name: contest.name,
                        site: "Codeforces",
                        start_time: new Date(contest.startTimeSeconds * 1000).toISOString(),
                        end_time: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000).toISOString(),
                        duration: contest.durationSeconds,
                        url: `https://codeforces.com/contest/${contest.id}`
                    }));

                setContests(upcomingContests);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch contests from Codeforces:", err.message);
                setLoading(false);
            }
        };

        fetchContests();
    }, []);

if (!user || user.role === 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">You are not logged in.</div>
      </div>
    );
  }
    return (
        <>
        <Navbar/>
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
                                    <span
                                        className="badge bg-warning text-dark mb-2"
                                        style={{ paddingTop: "0.6rem", paddingBottom: "0.6rem", fontSize: "0.95rem" }}
                                    >
                                        {contest.site}
                                    </span>

                                    <ul className="list-unstyled small">
                                        <li><strong>Start:</strong> {new Date(contest.start_time).toLocaleString()}</li>
                                        <li><strong>End:</strong> {new Date(contest.end_time).toLocaleString()}</li>
                                        <li><strong>Duration:</strong> {(contest.duration / 3600).toFixed(2)} hours</li>
                                    </ul>
                                    <a
                                        href={contest.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-warning mt-auto"
                                    >
                                        🔗 Visit Contest
                                    </a>
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
