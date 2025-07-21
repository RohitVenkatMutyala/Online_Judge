import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
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
    <>
      <Navbar />
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-dark text-light">
        <div className="row w-100 p-4">
          {/* Left: About Randoman */}
          <div className="col-md-6 d-flex flex-column justify-content-center p-4">
            <h1
              className="display-5 fw-bold mb-4"
              style={{
                background: 'linear-gradient(to right, #8e44ad, #3498db)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome to Randoman
            </h1>
            <p className="fs-5">
              Randoman is your go-to platform for collaborative code editing, live previewing,
              and seamless developer interaction. Whether you're a beginner or a pro,
              our sleek interface helps bring ideas to life.
            </p>
          </div>

          {/* Right: Login Options */}
          <div className="col-md-6 d-flex justify-content-center">
            <div
              className="p-5 rounded-4 shadow-lg text-center w-100"
              style={{
                maxWidth: '400px',
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h2
                className="mb-4"
                style={{
                  background: 'linear-gradient(to right, #f39c12, #f1c40f)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                }}
              >
                Select Login Type
              </h2>

              <div className="d-grid gap-3">
                <button
                  onClick={handleLogin}
                  className="btn text-white py-2 fs-5"
                  style={{
                    background: 'linear-gradient(to right, #FF6F00, #FFCA28)',
                    border: 'none',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'scale(1.0)')}
                >
                  👤 User Login
                </button>

                <button
                  onClick={handleAdmin}
                  className="btn text-white py-2 fs-5"
                  style={{
                    background: 'linear-gradient(to right, #8E24AA, #BA68C8)',
                    border: 'none',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'scale(1.0)')}
                >
                  🔧 Admin Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
