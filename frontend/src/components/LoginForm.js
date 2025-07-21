import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './navbar';

function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const API_URL = process.env.REACT_APP_SERVER_API;
   

    try {
      const res = await axios.post(`${API_URL}/login`, form, {
        withCredentials: true,
      });

      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-dark text-light">
           <div className="row w-100 p-4">
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
                 <ul className="mt-3">
              <li>🌟 Fast and Secure Login</li>
              <li>⚙️ Smart Admin Management</li>
              <li>🎨 Beautiful UI + Dark Mode</li>
              <li>📊 Intuitive Dashboards</li>
            </ul>
            </p>
          </div>

   
        

          {/* Right Column - Login Form */}
          <div className="col-md-6 d-flex justify-content-center">
            <div
              className="p-5 rounded-4 shadow-lg text-center w-100"
              style={{
                maxWidth: '500px',
               
                backdropFilter: 'blur(10px)',
              }}
            >
            <form onSubmit={handleSubmit}>
              <h2
                className="mb-4 text-center"
                style={{
                  background: 'linear-gradient(to right, #FFA000, #FFC107)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                }}
              >
                LOGIN
              </h2>

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
              
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
               
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 d-flex align-items-center justify-content-center"
                style={{
                  background: 'linear-gradient(to right, #f12711, #f5af19)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 'bold',
                  height: '45px',
                  transition: 'all 0.3s ease-in-out',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(241, 39, 17, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Loading...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              <div className="text-center mt-4">
                <span>Don’t have an account?</span>
                <button
                  type="button"
                  className="btn ms-2"
                  onClick={() => navigate('/register')}
                  style={{
                    background: 'linear-gradient(to right, #FF8F00, #FFCA28)',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    padding: '6px 16px',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease-in-out',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 138, 0, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Register
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
        </div>
    
    </>
  );
}

export default LoginForm;
