import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Solve = () => {
  const { QID } = useParams();
  const {user}=useAuth();
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/problem/${QID}`);
        setProblem(res.data.problem);
      } catch (err) {
        console.error('Error loading problem');
      }
    };

    fetchProblem();
  }, [QID]);

  if (!problem) return <p>Loading...</p>;
  
  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Unauthorized</div>
      </div>
    );
  }
   if (user.role === 'admin') return ( <div className="container mt-5">
      <div className="alert alert-danger text-center">You are not logged in.</div>
    </div>);


  return (
    <div className="container mt-4">
      <h2>{problem.name}</h2>
      <p><strong>Tag:</strong> {problem.tag}</p>
      <p><strong>Difficulty:</strong> {problem.difficulty}</p>
     <div style={{ whiteSpace: 'pre-wrap', color: 'black' }}>
  {problem.description}
</div>

    </div>
  );
};

export default Solve;
