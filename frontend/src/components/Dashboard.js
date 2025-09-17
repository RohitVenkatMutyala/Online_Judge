import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./sketchy.css";
import Navbar from "./navbar";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(null);

  // ✅ Load stored image
  useEffect(() => {
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) setProfileImage(storedImage);
  }, []);

  // ✅ Handle upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem("profileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user || user.role === "admin") {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          You are not logged in.
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <div className="row g-4">
          {/* Profile Card */}
          <div className="col-md-4">
            <div className="card shadow-lg border-0 rounded-4 text-center p-4">
              <label htmlFor="profileUpload" style={{ cursor: "pointer" }}>
                <div
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm overflow-hidden mx-auto mb-3"
                  style={{ width: "120px", height: "120px" }}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "2rem" }}>👤</span>
                  )}
                </div>
              </label>
              <input
                type="file"
                id="profileUpload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />

              <h4 className="fw-bold">{user.firstname} {user.lastname}</h4>
              <p className="text-muted">{user.email}</p>

              {/* Badge */}
              <span className="badge bg-gradient bg-info px-3 py-2 shadow-sm">
                🎖️ Pro Learner
              </span>
            </div>
          </div>

          {/* Stats / Features */}
          <div className="col-md-8">
            <div className="row g-4">
              {/* Example Feature 1 */}
              <div className="col-md-6">
                <div className="card shadow-sm border-0 rounded-4 p-3 text-center">
                  <h6 className="fw-bold">Daily Quota</h6>
                  <p className="text-muted">Placeholder — e.g. 3 left</p>
                  <button className="btn btn-sm btn-success">
                    Use Help
                  </button>
                </div>
              </div>

              {/* Example Feature 2 */}
              <div className="col-md-6">
                <div className="card shadow-sm border-0 rounded-4 p-3 text-center">
                  <h6 className="fw-bold">Achievements</h6>
                  <p className="text-muted">Badges, milestones here</p>
                  <button className="btn btn-sm btn-primary">
                    View All
                  </button>
                </div>
              </div>

              {/* Example Feature 3 */}
              <div className="col-md-6">
                <div className="card shadow-sm border-0 rounded-4 p-3 text-center">
                  <h6 className="fw-bold">Rank</h6>
                  <p className="text-muted">Placeholder Rank</p>
                </div>
              </div>

              {/* Example Feature 4 */}
              <div className="col-md-6">
                <div className="card shadow-sm border-0 rounded-4 p-3 text-center">
                  <h6 className="fw-bold">Points</h6>
                  <p className="text-muted">Placeholder Points</p>
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
