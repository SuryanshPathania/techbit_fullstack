

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, fetchProfile, updateProfile } from "../redux/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔹 Get user data from Redux
  const { user, status, error } = useSelector((state) => state.auth);
  const token = user?.token;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch profile from API using Redux async thunk
    dispatch(fetchProfile(token)).then((response) => {
      if (response.payload) {
        setFirstName(response.payload.firstName);
        setLastName(response.payload.lastName);
        setDob(response.payload.dob || "");
      }
    });
  }, [dispatch, token, navigate]);

  // Handle Profile Picture Upload
  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  // Handle Profile Update
  const handleUpdate = async () => {
    if (!token) return;

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("dob", dob);
    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    // Dispatch update profile action
    dispatch(updateProfile({ formData, token })).then((response) => {
      if (response.payload) {
        setIsEditing(false);
      }
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", textAlign: "center", marginTop: "50px", backgroundColor: "#f4f4f4", padding: "30px", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", maxWidth: "400px", margin: "auto" }}>
      <h1 style={{ color: "#333", marginBottom: "20px" }}>Profile</h1>

      {status === "loading" ? (
        <p style={{ color: "#777", fontSize: "18px" }}>Loading profile...</p>
      ) : error ? (
        <p style={{ color: "red", fontSize: "18px" }}>{error}</p>
      ) : (
        <div style={{ padding: "20px", borderRadius: "8px", backgroundColor: "#fff" }}>
          {user.profilePic && (
            <div>
              <img src={user.profilePic} alt="Profile" style={{ width: "120px", height: "120px", borderRadius: "50%", border: "3px solid #007BFF", marginBottom: "15px" }} />
            </div>
          )}

          <div style={{ marginBottom: "15px", fontSize: "18px", color: "#555" }}>
            <strong>First Name:</strong> {isEditing ? <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ padding: "8px", fontSize: "16px" }} /> : <span>{user.firstName}</span>}
          </div>

          <div style={{ marginBottom: "15px", fontSize: "18px", color: "#555" }}>
            <strong>Last Name:</strong> {isEditing ? <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ padding: "8px", fontSize: "16px" }} /> : <span>{user.lastName}</span>}
          </div>
          <div style={{ marginBottom: "15px", fontSize: "18px", color: "#555" }}>
            <strong>Email: </strong> {isEditing ? <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: "8px", fontSize: "16px" }} /> : <span>{user.email}</span>}
          </div>

          <div style={{ marginBottom: "15px", fontSize: "18px", color: "#555" }}>
            <strong>D.O.B:</strong> {isEditing ? <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} style={{ padding: "8px", fontSize: "16px" }} /> : <span>{user.dob}</span>}
          </div>

          {isEditing && (
            <div>
              <p style={{ fontSize: "18px", color: "#555" }}>Update Profile Picture:</p>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "15px" }}>
            <button onClick={() => navigate("/dashboard")} style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", borderRadius: "5px", cursor: "pointer", fontSize: "16px", border: "none" }}>Back to Dashboard</button>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} style={{ padding: "10px 20px", backgroundColor: "#ffc107", color: "white", borderRadius: "5px", cursor: "pointer", fontSize: "16px", border: "none" }}>Edit</button>
            ) : (
              <button onClick={handleUpdate} style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", borderRadius: "5px", cursor: "pointer", fontSize: "16px", border: "none" }} disabled={status === "loading"}>{status === "loading" ? "Updating..." : "Save Changes"}</button>
            )}

            <button onClick={handleLogout} style={{ padding: "10px 20px", backgroundColor: "#007BFF", color: "white", borderRadius: "5px", cursor: "pointer", fontSize: "16px", border: "none" }}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;




