import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './sketchy.css';
import Dnav from './dnav';
import { Tooltip } from 'bootstrap';

// --- 1. IMPORT FIREBASE MODULES ---
import { db, storage } from '../firebaseConfig'; // Ensure this path is correct
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify'; // Optional: for user feedback

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  // --- 2. ADD UPLOADING STATE ---
  const [isUploading, setIsUploading] = useState(false);

  // --- 3. REPLACE USEEFFECT WITH FIREBASE LISTENER ---
  useEffect(() => {
    // Don't run if the user object isn't ready
    if (!user || !user.uid) return;

    // Listen to the user's document in Firestore for real-time updates.
    // IMPORTANT: Make sure your user collection is named 'users' and the document ID is user.uid.
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        // If a profile image URL exists in Firestore, use it
        if (userData.profileImageURL) {
          setProfileImage(userData.profileImageURL);
        } else {
          // Otherwise, generate and set a default avatar
          const dummyAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstname} ${user.lastname}`;
          setProfileImage(dummyAvatarUrl);
        }
      } else {
        // Fallback for new users or if the document doesn't exist yet
        const dummyAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstname} ${user.lastname}`;
        setProfileImage(dummyAvatarUrl);
      }
    });

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new Tooltip(el));

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [user]); // Re-run this effect if the user object changes

  // --- 4. REPLACE HANDLEIMAGECHANGE WITH FIREBASE UPLOAD LOGIC ---
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setIsUploading(true);
    toast.info("Uploading image...");

    // Create a reference in Firebase Storage (e.g., profile_images/some_user_id)
    const storageRef = ref(storage, `profile_images/${user.uid}`);

    try {
      // 1. Upload the file to Firebase Storage
      await uploadBytes(storageRef, file);

      // 2. Get the public URL of the uploaded file
      const downloadURL = await getDownloadURL(storageRef);

      // 3. Update the user's document in Firestore with the new image URL
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        profileImageURL: downloadURL
      });
      
      toast.success("Profile image updated!");

    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to update profile image.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user || user.role === 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">You are not logged in.</div>
      </div>
    );
  }

  return (
    <>
      <Dnav />
      <div className="container-fluid px-4 py-5" style={{ minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div
              className="dashboard-container shadow-lg rounded-4 overflow-hidden"
              style={{
                background: 'rgba(26, 26, 26, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="row g-0 h-100">
                {/* Profile Section - Left Side */}
                <div className="col-12 col-lg-4">
                  <div
                    className="profile-section h-100 d-flex flex-column align-items-center justify-content-center p-5"
                    style={{ color: 'white' }}
                  >
                    <label htmlFor="profileUpload" className="profile-upload-label mb-4">
                      <div
                        className="profile-image-container rounded-circle shadow-lg overflow-hidden position-relative"
                        style={{ width: "200px", height: "200px", cursor: "pointer" }}
                      >
                        {/* --- 5. ADD UPLOADING SPINNER --- */}
                        {isUploading && (
                          <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="spinner-border text-light" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        )}
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary">
                             <div className="spinner-border text-light" role="status"></div>
                          </div>
                        )}
                        <div className="profile-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                          <i className="bi bi-camera-fill" style={{ fontSize: "1.5rem", opacity: 0 }}></i>
                        </div>
                      </div>
                    </label>

                    <input
                      type="file"
                      id="profileUpload"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                      disabled={isUploading} // Disable input while uploading
                    />

                    <div className="text-center">
                        <h2 className="mb-2 fw-bold">{user.firstname} {user.lastname}</h2>
                        <p className="mb-3 text-light opacity-75" style={{ fontSize: "1.1rem" }}>{user.email}</p>
                        <div
                          className="user-badge d-inline-flex align-items-center px-4 py-2 rounded-pill"
                          style={{
                            background: ' linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444);',
                            boxShadow: '0 4px 15px rgba(17, 153, 142, 0.3)'
                          }}
                        >
                          <i className="bi bi-person-check-fill me-2"></i>
                          <span className="fw-semibold">Verified User</span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Section - Right Side */}
                <div className="col-12 col-lg-8">
                  {/* ... Rest of your JSX is unchanged ... */}
                  <div className="navigation-section h-100 d-flex flex-column justify-content-center p-5">
                    <div className="text-center mb-5">
                      <h1 className="display-4 fw-bold text-white mb-3">Welcome to Dashboard</h1>
                      <p className="lead text-light opacity-75">Choose your learning path and start your coding journey</p>
                    </div>

                    <div className="navigation-grid">
                         <div className="nav-card mb-4" onClick={() => navigate("/new-chat")}>
                           <div className="nav-card-inner d-flex align-items-center p-4 rounded-3 shadow-sm h-100">
                             <div className="nav-icon me-4">
                              <i className="bi bi-broadcast-pin"></i>
                             </div>
                             <div className="nav-content flex-grow-1">
                               <h4 className="mb-2 fw-bold text-white">Live Sessions</h4>
                               <p className="mb-0 text-light opacity-90">Real-time collaborative coding sessions, with an integrated chat for immediate doubt clarification</p>
                             </div>
                             <div className="nav-arrow">
                               <i className="bi bi-arrow-right-circle-fill"></i>
                             </div>
                           </div>
                         </div>
                         <div className="nav-card mb-4" onClick={() => navigate("/problems")}>
                           <div className="nav-card-inner d-flex align-items-center p-4 rounded-3 shadow-sm h-100">
                             <div className="nav-icon me-4">
                               <i className="bi bi-puzzle-fill"></i>
                             </div>
                             <div className="nav-content flex-grow-1">
                               <h4 className="mb-2 fw-bold text-white">Solve Problems</h4>
                               <p className="mb-0 text-light opacity-90">Practice coding with our curated problem sets</p>
                             </div>
                             <div className="nav-arrow">
                               <i className="bi bi-arrow-right-circle-fill"></i>
                             </div>
                           </div>
                         </div>
                           <div className="nav-card mb-4" onClick={() => navigate("/funda")}>
                           <div className="nav-card-inner d-flex align-items-center p-4 rounded-3 shadow-sm h-100">
                             <div className="nav-icon me-4">
                               <i className="bi bi-book-half"></i>
                             </div>
                             <div className="nav-content flex-grow-1">
                               <h4 className="mb-2 fw-bold text-white">Fundamentals</h4>
                               <p className="mb-0 text-light opacity-90">Master the core concepts and principles</p>
                             </div>
                             <div className="nav-arrow">
                               <i className="bi bi-arrow-right-circle-fill"></i>
                             </div>
                           </div>
                         </div>
                         <div className="nav-card mb-4" onClick={() => navigate("/contexts")}>
                           <div className="nav-card-inner d-flex align-items-center p-4 rounded-3 shadow-sm h-100">
                             <div className="nav-icon me-4">
                               <i className="bi bi-collection-fill"></i>
                             </div>
                             <div className="nav-content flex-grow-1">
                               <h4 className="mb-2 fw-bold text-white">Contests</h4>
                               <p className="mb-0 text-light opacity-90">Explore real-world examples and use cases</p>
                             </div>
                             <div className="nav-arrow">
                               <i className="bi bi-arrow-right-circle-fill"></i>
                             </div>
                           </div>
                         </div>

                         <div className="nav-card" onClick={() => navigate("/sub")}>
                           <div className="nav-card-inner d-flex align-items-center p-4 rounded-3 shadow-sm h-100">
                             <div className="nav-icon me-4">
                               <i className="bi bi-check2-square"></i>
                             </div>
                             <div className="nav-content flex-grow-1">
                               <h4 className="mb-2 fw-bold text-white">Submissions</h4>
                               <p className="mb-0 text-light opacity-90">Review your previous solutions and progress</p>
                             </div>
                             <div className="nav-arrow">
                               <i className="bi bi-arrow-right-circle-fill"></i>
                             </div>
                           </div>
                         </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ... Your existing styles are unchanged ... */
        .dashboard-container {
          min-height: 600px;
        }

        .profile-upload-label:hover .profile-overlay {
          background: rgba(0,0,0,0.5);
        }

        .profile-upload-label:hover .profile-overlay i {
          opacity: 1 !important;
          color: white;
        }

        .profile-overlay {
          transition: all 0.3s ease;
          border-radius: 50%;
        }

        .nav-card {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-card:hover {
          transform: translateY(-2px);
        }

        .nav-card-inner {
         background: "linear-gradient(135deg, #a8edea 0%, #dcedc2 100%)",
          color: white;
          transition: all 0.3s ease;
          border: none;
          min-height: 100px;
        }

        .nav-card:hover .nav-card-inner {
          background: linear-gradient(135deg, #f12711 0%, #f5af19 100%);
          box-shadow: 0 8px 25px rgba(241, 39, 17, 0.3) !important;
        }

        .nav-icon {
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .nav-arrow {
          font-size: 1.5rem;
          opacity: 0.7;
          transition: all 0.3s ease;
        }

        .nav-card:hover .nav-arrow {
          opacity: 1;
          transform: translateX(5px);
        }

        .user-badge {
          font-size: 1rem;
        }
      `}</style>
    </>
  );
}

export default Dashboard;