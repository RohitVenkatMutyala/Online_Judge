import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './navbar';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || user.role === 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">You are not logged in.</div>
      </div>
    );
  }

  // Mock data for demonstration
  const stats = {
    problemsSolved: 47,
    totalProblems: 150,
    currentStreak: 5,
    longestStreak: 12,
    accuracy: 78,
    ranking: 1247
  };

  const recentActivity = [
    { problem: "Two Sum", difficulty: "Easy", status: "Solved", time: "2 hours ago" },
    { problem: "Binary Tree Traversal", difficulty: "Medium", status: "Attempted", time: "1 day ago" },
    { problem: "Merge Sort", difficulty: "Medium", status: "Solved", time: "2 days ago" },
    { problem: "Dynamic Programming", difficulty: "Hard", status: "In Progress", time: "3 days ago" }
  ];

  const upcomingDeadlines = [
    { title: "Week 4 Assignment", due: "In 2 days", priority: "high" },
    { title: "Mock Interview", due: "In 5 days", priority: "medium" },
    { title: "System Design Project", due: "In 1 week", priority: "low" }
  ];

  return (
    <>
      <Navbar />
      <div 
        className="min-vh-100"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container-fluid py-4">
          {/* Header Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div 
                className="p-4 rounded-3 text-white"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h1 className="display-6 fw-bold mb-2">
                      Welcome back, {user.firstname}! 👋
                    </h1>
                    <p className="mb-0 fs-5 opacity-90">
                      Continue your journey to master Data Structures & Algorithms
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="d-flex justify-content-md-end gap-2">
                      <button
                        onClick={() => navigate('/problems')}
                        className="btn btn-light fw-semibold px-4"
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          color: '#667eea'
                        }}
                      >
                        🚀 Start Coding
                      </button>
                      <button
                        onClick={async () => { await logout(); navigate('/'); }}
                        className="btn btn-outline-light fw-semibold px-4"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6 mb-3">
              <div 
                className="card h-100 border-0 shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="card-body text-center">
                  <div className="display-4 mb-2">📊</div>
                  <h5 className="card-title fw-bold text-primary">Problems Solved</h5>
                  <h2 className="display-6 fw-bold text-success">{stats.problemsSolved}</h2>
                  <small className="text-muted">out of {stats.totalProblems} total</small>
                  <div className="progress mt-2" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-success"
                      style={{ width: `${(stats.problemsSolved / stats.totalProblems) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-3">
              <div 
                className="card h-100 border-0 shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="card-body text-center">
                  <div className="display-4 mb-2">🔥</div>
                  <h5 className="card-title fw-bold text-primary">Current Streak</h5>
                  <h2 className="display-6 fw-bold text-warning">{stats.currentStreak}</h2>
                  <small className="text-muted">days • Best: {stats.longestStreak} days</small>
                  <div className="mt-2">
                    <span className="badge bg-warning text-dark px-3 py-2">Keep it up! 🚀</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-3">
              <div 
                className="card h-100 border-0 shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="card-body text-center">
                  <div className="display-4 mb-2">🎯</div>
                  <h5 className="card-title fw-bold text-primary">Accuracy</h5>
                  <h2 className="display-6 fw-bold text-info">{stats.accuracy}%</h2>
                  <small className="text-muted">submission accuracy</small>
                  <div className="progress mt-2" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-info"
                      style={{ width: `${stats.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-3">
              <div 
                className="card h-100 border-0 shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="card-body text-center">
                  <div className="display-4 mb-2">🏆</div>
                  <h5 className="card-title fw-bold text-primary">Global Ranking</h5>
                  <h2 className="display-6 fw-bold text-danger">#{stats.ranking}</h2>
                  <small className="text-muted">out of 50,000+ users</small>
                  <div className="mt-2">
                    <span className="badge bg-primary px-3 py-2">Rising Star ⭐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="row">
            {/* Left Column */}
            <div className="col-lg-8 mb-4">
              {/* Navigation Tabs */}
              <div 
                className="card border-0 shadow-sm mb-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="card-header bg-transparent border-0 pb-0">
                  <ul className="nav nav-pills" id="dashboard-tabs">
                    {[
                      { id: 'overview', label: '📊 Overview', icon: '📊' },
                      { id: 'progress', label: '📈 Progress', icon: '📈' },
                      { id: 'activity', label: '🔄 Recent Activity', icon: '🔄' }
                    ].map(tab => (
                      <li key={tab.id} className="nav-item">
                        <button
                          className={`nav-link fw-semibold ${activeTab === tab.id ? 'active' : ''}`}
                          onClick={() => setActiveTab(tab.id)}
                          style={{
                            border: 'none',
                            background: activeTab === tab.id ? '#667eea' : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#667eea'
                          }}
                        >
                          {tab.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-body">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div>
                      <h5 className="fw-bold mb-4">🎯 Your Learning Journey</h5>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded-3 mb-3">
                            <h6 className="fw-bold text-success mb-2">✅ Completed Topics</h6>
                            <ul className="list-unstyled mb-0">
                              <li className="mb-1">• Arrays & Strings</li>
                              <li className="mb-1">• Linked Lists</li>
                              <li className="mb-1">• Stacks & Queues</li>
                              <li className="mb-1">• Binary Search</li>
                            </ul>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 bg-warning bg-opacity-10 rounded-3 mb-3">
                            <h6 className="fw-bold text-warning mb-2">🔄 In Progress</h6>
                            <ul className="list-unstyled mb-0">
                              <li className="mb-1">• Binary Trees (60%)</li>
                              <li className="mb-1">• Graph Algorithms (30%)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-info bg-opacity-10 rounded-3">
                        <h6 className="fw-bold text-info mb-2">📅 Upcoming</h6>
                        <p className="mb-0">Dynamic Programming • System Design • Mock Interviews</p>
                      </div>
                    </div>
                  )}

                  {/* Progress Tab */}
                  {activeTab === 'progress' && (
                    <div>
                      <h5 className="fw-bold mb-4">📈 Progress Analytics</h5>
                      <div className="row">
                        <div className="col-md-4 text-center mb-3">
                          <div className="p-3">
                            <div 
                              className="mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                              style={{ 
                                width: '80px', 
                                height: '80px', 
                                background: 'linear-gradient(45deg, #28a745, #20c997)' 
                              }}
                            >
                              31%
                            </div>
                            <h6 className="fw-bold">Overall Progress</h6>
                            <small className="text-muted">47 of 150 problems</small>
                          </div>
                        </div>
                        <div className="col-md-8">
                          <h6 className="fw-bold mb-3">Difficulty Breakdown</h6>
                          <div className="mb-2">
                            <div className="d-flex justify-content-between">
                              <span>Easy</span>
                              <span>20/50</span>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                              <div className="progress-bar bg-success" style={{ width: '40%' }}></div>
                            </div>
                          </div>
                          <div className="mb-2">
                            <div className="d-flex justify-content-between">
                              <span>Medium</span>
                              <span>22/75</span>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                              <div className="progress-bar bg-warning" style={{ width: '29%' }}></div>
                            </div>
                          </div>
                          <div className="mb-2">
                            <div className="d-flex justify-content-between">
                              <span>Hard</span>
                              <span>5/25</span>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                              <div className="progress-bar bg-danger" style={{ width: '20%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Activity Tab */}
                  {activeTab === 'activity' && (
                    <div>
                      <h5 className="fw-bold mb-4">🔄 Recent Activity</h5>
                      <div className="list-group list-group-flush">
                        {recentActivity.map((activity, index) => (
                          <div key={index} className="list-group-item border-0 px-0">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1 fw-semibold">{activity.problem}</h6>
                                <small className="text-muted">{activity.time}</small>
                              </div>
                              <div className="text-end">
                                <span 
                                  className={`badge ${
                                    activity.difficulty === 'Easy' ? 'bg-success' :
                                    activity.difficulty === 'Medium' ? 'bg-warning' : 'bg-danger'
                                  } me-2`}
                                >
                                  {activity.difficulty}
                                </span>
                                <span 
                                  className={`badge ${
                                    activity.status === 'Solved' ? 'bg-success' :
                                    activity.status === 'Attempted' ? 'bg-warning' : 'bg-info'
                                  }`}
                                >
                                  {activity.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-lg-4">
              {/* Quick Actions */}
              <div 
                className="card border-0 shadow-sm mb-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="card-header bg-transparent border-0">
                  <h5 className="fw-bold mb-0">⚡ Quick Actions</h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary fw-semibold"
                      onClick={() => navigate('/problems')}
                      style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}
                    >
                      🎯 Practice Problems
                    </button>
                    <button className="btn btn-success fw-semibold">
                      📚 Study Notes
                    </button>
                    <button className="btn btn-info fw-semibold">
                      🎥 Watch Lectures
                    </button>
                    <button className="btn btn-warning fw-semibold">
                      🏆 Mock Interview
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div 
                className="card border-0 shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="card-header bg-transparent border-0">
                  <h5 className="fw-bold mb-0">📅 Upcoming Deadlines</h5>
                </div>
                <div className="card-body">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="mb-1 fw-semibold">{deadline.title}</h6>
                        <small className="text-muted">{deadline.due}</small>
                      </div>
                      <span 
                        className={`badge ${
                          deadline.priority === 'high' ? 'bg-danger' :
                          deadline.priority === 'medium' ? 'bg-warning' : 'bg-secondary'
                        }`}
                      >
                        {deadline.priority.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="row mt-4">
            <div className="col-12">
              <div 
                className="p-3 rounded-3 text-white text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="row">
                  <div className="col-md-3">
                    <h6 className="fw-bold">1380+ Students</h6>
                    <small>Trained & Placed</small>
                  </div>
                  <div className="col-md-3">
                    <h6 className="fw-bold">41 LPA</h6>
                    <small>Highest CTC</small>
                  </div>
                  <div className="col-md-3">
                    <h6 className="fw-bold">22 LPA</h6>
                    <small>Average CTC</small>
                  </div>
                  <div className="col-md-3">
                    <h6 className="fw-bold">110% Hike</h6>
                    <small>Average Increase</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;