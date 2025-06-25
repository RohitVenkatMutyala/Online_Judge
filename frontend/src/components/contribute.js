import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Contribute = () => {
    const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading,setLoading]= useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser} = useAuth();


  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/login', form, {
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
    <div className="container mt-5 d-flex justify-content-center">
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">ADMIN</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">Adim Email</label>
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
          <label className="form-label">Admin Password</label>
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

        <button type="submit" className="btn btn-warning  w-100" disabled={loading}>
           {loading ? 'Loading ....':'Login'}
        </button>
              </form>
      
    </div>
  );
}
export default Contribute;