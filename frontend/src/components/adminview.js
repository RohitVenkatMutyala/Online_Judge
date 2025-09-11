import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from './navbar';
import ReactMarkdown from "react-markdown";

const Adminview = () => {
   const API_URL = process.env.REACT_APP_SERVER_API;
  const { QID } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`${API_URL}/problem/${QID}`);
        setProblem(res.data.problem);
      } catch (err) {
        console.error('Error loading problem');
      }
    };

    fetchProblem();
  }, [QID,API_URL]);

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'badge bg-success-subtle border border-success text-success px-3 py-2 rounded-pill';
      case 'medium':
        return 'badge bg-warning-subtle border border-warning text-warning px-3 py-2 rounded-pill';
      case 'hard':
        return 'badge bg-danger-subtle border border-danger text-danger px-3 py-2 rounded-pill';
      case 'basic':
        return 'badge bg-secondary-subtle border border-secondary text-secondary px-3 py-2 rounded-pill';
      default:
        return 'badge bg-light';
    }
  };

 
  const getTagBadge = () => 'badge bg-warning text-dark px-2 py-1 rounded-pill';

  if (!problem) return <div className="container mt-5"><div className="alert alert-warning text-center">Loading...</div></div>;

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Unauthorized</div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">You are not logged in.</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="card-title fw-bold mb-3">{problem.name}</h3>

            <div className="mb-3">
              <span className="me-3">
                <strong>Tag:</strong>{' '}
                <span className={getTagBadge(problem.tag)}>{problem.tag}</span>
              </span>

              <span>
                <strong>Difficulty:</strong>{' '}
                <span className={getDifficultyBadge(problem.difficulty)}>
                  {problem.difficulty}
                </span>
              </span>
            </div>

            <hr />
                 <div className="fs-6 text-body" style={{ whiteSpace: 'pre-wrap' }}>
                  <ReactMarkdown>
                                    {problem.description}
                                  </ReactMarkdown>
                </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Adminview;
