import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from './navbar';

const UploadTestCase = () => {
  const { user } = useAuth();
  const [QID, setQID] = useState('');
  const [inputFile, setInputFile] = useState(null);
  const [outputFile, setOutputFile] = useState(null);
  const [response, setResponse] = useState('');
  const [qid, setID] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteType, setDeleteType] = useState('');

  const handleDelete = async (qid) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the test cases for QID: ${qid}?`);
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`http://localhost:5000/test/${qid}`);
      setDeleteMessage(res.data.message || `✅ QID ${qid} deleted.`);
      setDeleteType('success');
    } catch (error) {
      setDeleteMessage('❌ Error deleting the test case.');
      setDeleteType('danger');
      console.error(error);
    }

    setTimeout(() => {
      setDeleteMessage('');
      setDeleteType('');
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('QID', QID);
    formData.append('inputFile', inputFile);
    formData.append('outputFile', outputFile);

    try {
      const res = await axios.post('http://localhost:5000/test', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      setResponse(res.data.message || '✅ Upload successful');
    } catch (err) {
      console.error(err);
      setResponse(err.response?.data?.message || '❌ Upload failed. Check server logs.');
    }

    setTimeout(() => {
      setResponse('');
    }, 5000);
  };

  if (!user)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">You are not logged in.</div>
      </div>
    );

  if (user.role !== 'admin')
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">Only admins can upload test cases.</div>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="row justify-content-center g-4">
          {/* Upload Form */}
          <div className="col-md-6">
            <div className="card shadow border-0">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <i className="bi bi-beaker fs-4 text-primary me-2"></i>
                  <h4 className="mb-0">Upload Test Case</h4>
                </div>

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="mb-3">
                    <label htmlFor="qid" className="form-label fw-semibold">Question ID (QID)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="qid"
                      placeholder="Enter unique QID"
                      value={QID}
                      onChange={(e) => setQID(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Input Test Case (.txt)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".txt"
                      onChange={(e) => setInputFile(e.target.files[0])}
                      required
                    />
                    <small className="text-muted">Upload plain text file only</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Expected Output File (.txt)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".txt"
                      onChange={(e) => setOutputFile(e.target.files[0])}
                      required
                    />
                    <small className="text-muted">Ensure it matches expected program output</small>
                  </div>

                  <button type="submit" className="btn w-100 text-white" style={{ backgroundColor: '#1D1F23' }}>
                    <i className="bi bi-upload me-2"></i> Upload Test Case
                  </button>
                </form>

                {response && (
                  <div className="alert alert-info text-center mt-4 mb-0">
                    {response}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delete Form */}
          <div className="col-md-6">
            <div className="card shadow border-0">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-trash3 fs-5 text-danger me-2"></i>
                  <h5 className="mb-0">Delete Test Case</h5>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleDelete(qid);
                  }}
                >
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter QID"
                      value={qid}
                      onChange={(e) => setID(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 text-white"
                    style={{ backgroundColor: '#1D1F23' }}
                  >
                    <i className="bi bi-x-circle me-2"></i> Delete Test Case
                  </button>
                </form>

                {deleteMessage && (
                  <div
                    className={`alert mt-4 mb-0 text-center alert-${deleteType}`}
                    style={{
                      backgroundColor:
                        deleteType === 'success' ? '#d1e7dd' : '#f8d7da',
                    }}
                  >
                    <i
                      className={`bi me-2 ${deleteType === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`}
                    ></i>
                    {deleteMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadTestCase;
