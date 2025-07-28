import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

function RegisterForm() {
  const { user } = useAuth();
  const API_URL = process.env.REACT_APP_SERVER_API;
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: '',
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/register`, form, {
        withCredentials: true,
      });

      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        setLoading(false);
      } else {
        setError('Registration failed. Please try again.');
        setLoading(false);
      }
    }
  };
  if (user ) {
    return (
      navigate('/dashboard')
    );
  }


  return (
    <>
      <Navbar />
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-dark text-light">



        <div className="col-md-6 d-flex justify-content-center">
          <div
            className="p-5 rounded-4 shadow-lg text-center w-100"
            style={{
              maxWidth: '500px',

              backdropFilter: 'blur(10px)',
            }}
          >
            <form
              onSubmit={handleSubmit}
              className="p-4 border rounded shadow"
              style={{ width: '100%', maxWidth: '450px' }}
            >
              <h2
                className="mb-4 text-center"
                style={{
                  background: 'linear-gradient(to right, #FFA000, #FFC107)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                }}
              >
                Register
              </h2>

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">

                <input
                  type="text"
                  className="form-control"
                  placeholder="First Name"
                  value={form.firstname}
                  onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                  required
                />
                <div>
                  <small className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">No of Characters should be more then 10</small>
                </div></div>

              <div className="mb-3">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Last Name"
                  value={form.lastname}
                  onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                  required
                />
                <div>
                  <small className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">No of Characters should be more then 10</small>
                </div></div>

              <div className="mb-3">

                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <div>
                  <small className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Please Follow these format .......@gmail.com</small>
                </div></div>

              <div className="mb-4">

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
                  <small className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                    Try To Make your Credentials Unique than Others
                  </small>

                </div>
              </div>
              <div className="mb-3" style={{ display: 'none' }}>
                <label className="form-label">Role</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}

                />
              </div>

              <button
                type="submit"

                className="btn text-white w-100"
                style={{
                  background: 'linear-gradient(to right, #FF8F00, #FFCA28)',
                  border: 'none',
                  transition: 'background 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 114, 255, 0.4)';
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
                  'Register'
                )}
              </button>

            </form>
          </div>
        </div>
      </div>

    </>
  );
}

export default RegisterForm;
