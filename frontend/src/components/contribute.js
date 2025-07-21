import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './navbar';

export const Contribute = () => {
  const API_URL = process.env.REACT_APP_SERVER_API;
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

    try {
      const res = await axios.post(`${API_URL}/login`, form, {
        withCredentials: true,
      });

      setUser(res.data.user);
      navigate('/admindashboard');
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
            <p className="fs-5 ">

              <ul className="mt-3 ">
                <li><strong>🌟 Fast and Secure Login</strong></li>
                <li><strong>⚙️ Full Admin Control</strong> — Post, Edit, and Delete Questions Easily</li>
                <li>🧪 <strong>Advanced Testcase Management</strong> — Manage each question’s testcases <strong>independently</strong> for high flexibility</li>
                <li>🔁 <strong>Update or Delete Testcases</strong> without changing the original question</li>
                <li>📂 <strong>Bulk Upload Support</strong> — Add <strong>30+ input/output testcases</strong> in a single click</li>
                <li>🚫 Say goodbye to <strong>dummy testcases</strong> — Every question is <strong>stress-tested</strong> for reliability</li>
                <li>🎨 Beautiful UI with <strong>Seamless Dark Mode</strong></li>

              </ul>
            </p>

          </div>

          <div className="col-md-6 d-flex justify-content-center">
            <div
              className="p-5 rounded-4 shadow-lg text-center w-100"
              style={{
                maxWidth: '500px',

                backdropFilter: 'blur(10px)',
              }}
            >
              <form onSubmit={handleSubmit} className="p-4 border rounded shadow" style={{ width: '100%', maxWidth: '400px' }}>
                <h2
                  className="mb-4 text-center"
                  style={{
                    background: 'linear-gradient(to right, #FFA000, #FFC107)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                  }}
                >
                  ADMIN
                </h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">

                  <input
                    type="email"
                    className="form-control"
                    placeholder=" Admin Email"
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
                      placeholder="Admin Password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-light border-opacity-50 "
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                  </div>
                </div>

                <button type="submit" className="btn btn-warning  w-100" disabled={loading}>
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
              </form>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Contribute;