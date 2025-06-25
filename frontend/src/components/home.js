import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
  const navigate = useNavigate();

  const handleAdmin = () => {
    navigate('/adminlogin');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div className="text-center border p-5 rounded shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="mb-4">Select Login Type</h2>

        <div className="d-grid gap-3">
          <button onClick={handleLogin} className="btn btn-primary">
            <i className="bi bi-person-fill me-2"></i>
            User
          </button>

          <button onClick={handleAdmin} className="btn btn-warning text-white">
            <i className="bi bi-person-gear me-2"></i>
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
