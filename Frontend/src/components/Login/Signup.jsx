
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../../redux/authSlice";
import "./Signup.css";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [formError, setFormError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]); // Store the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password || !dob) {
      setFormError("All fields are required.");
      return;
    } else {
      setFormError("");
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email.toLowerCase());
    formData.append("password", password);
    formData.append("dob", dob);
    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    const result = await dispatch(signupUser(formData));

    if (signupUser.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="signup-form" encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth</label>
          <input type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
        </div>

        <div className="form-group">
          <label htmlFor="profilePic">Profile Picture</label>
          <input type="file" id="profilePic" accept="image/*" onChange={handleFileChange} />
        </div>

        {formError && <div className="error-message">{formError}</div>}
        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-btn" disabled={status === "loading"}>
          {status === "loading" ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '10px' }}>Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link></p>
    
    </div>
  );
};

export default Signup;
