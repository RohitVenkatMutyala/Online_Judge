import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "./navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function PostProblems() {
  const [form, setForm] = useState({
    QID: '',
    name: '',
    tag: '',
    description: '',
    difficulty: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('http://localhost:5000/problems', form);
      if (res.data.success) {
        setSuccess("✅ Question posted successfully!");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Posting the question failed. Please try again.');
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          You are not authorized to access this page.
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: '#1c1f26', minHeight: '100vh' }}>
        <div className="container py-5">
          <div className="card shadow p-5 mx-auto" style={{ maxWidth: '1000px', backgroundColor: '#2c2f36', color: 'white' }}>
  <h2 className="text-center mb-4 fw-bold">Post a New Problem</h2>
  <form onSubmit={handleSubmit}>
    <div className="row">
      {/* Left column inputs */}
      <div className="col-md-6">
        <div className="mb-3">
          <label htmlFor="QID" className="form-label">QID</label>
          <input type="text" className="form-control" id="QID" name="QID" value={form.QID} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Problem Name</label>
          <input type="text" className="form-control" id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="tag" className="form-label">Tag</label>
          <input type="text" className="form-control" id="tag" name="tag" value={form.tag} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="difficulty" className="form-label">Difficulty</label>
          <select className="form-select" id="difficulty" name="difficulty" value={form.difficulty} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Right column for description */}
      <div className="col-md-6">
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Problem Description</label>
          <textarea className="form-control" id="description" name="description" rows="12" value={form.description} onChange={handleChange} required></textarea>
        </div>
      </div>
    </div>

    {/* Status messages */}
    {error && <div className="alert alert-danger">{error}</div>}
    {success && <div className="alert alert-success">{success}</div>}

    {/* Buttons */}
    <div className="d-flex justify-content-end gap-3 mt-4">
      <button type="submit" className="btn btn-warning fw-bold text-dark">
        <i className="bi bi-check-circle-fill me-2"></i>Submit Problem
      </button>
      <button type="button" className="btn btn-info fw-bold text-dark" onClick={() => navigate('/admindashboard')}>
        <i className="bi bi-person-fill me-2"></i>Profile
      </button>
      <button type="button" className="btn btn-danger fw-bold" onClick={() => window.location.reload()}>
        <i className="bi bi-arrow-clockwise me-2"></i>Post Another
      </button>
    </div>
  </form>
</div>
        </div>
      </div>
    </>
  );
}

export default PostProblems;
