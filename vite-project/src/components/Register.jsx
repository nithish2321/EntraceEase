import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api";
import CollegeForm from "./CollegeForm";
import TestCenterForm from "./TestCenterForm";
import toast, { Toaster } from "react-hot-toast";

function Register({ role }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [data, setData] = useState({});
  const navigate = useNavigate();
  const [hoveredInput, setHoveredInput] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isRegisterHovered, setIsRegisterHovered] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      toast.error("All fields are required.");
      return false;
    }
    if (!email.includes("@")) {
      toast.error("Invalid email format.");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handlePasswordConfirm = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowForm(true); // Trigger modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(role, {
        email,
        password,
        [role === "college" ? "collegeData" : "testCenterData"]: data,
      });
      toast.success("Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed.");
    }
  };

  const getInputStyle = (inputName) => ({
    ...inputStyle,
    ...(hoveredInput === inputName ? inputHoverStyle : {}),
    ...(focusedInput === inputName ? inputFocusStyle : {})
  });

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", fontFamily: "Segoe UI", background: "#f4f7fb",justifyContent: 'center' }}>
      <Toaster position="top-center" />
     <div
      style={{
      maxWidth: "500px",
      margin: "90px auto auto auto",
      padding: "2rem",
      borderRadius: "16px",
      background: "rgba(255, 255, 255, 0.1)", 
      backdropFilter: "blur(5px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    }}
    >
      <h2 style={{ textAlign: "center", color: "#1e3a8a", marginBottom: "2rem" }}>
         Getting Started as {role === "college" ? "College Authority" : "Test Center Manager"}
        </h2>
        <form onSubmit={handlePasswordConfirm}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>📧 Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={getInputStyle('email')}
              onMouseEnter={() => setHoveredInput('email')}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>🔑 Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={getInputStyle('password')}
              onMouseEnter={() => setHoveredInput('password')}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>🔒 Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={getInputStyle('confirmPassword')}
              onMouseEnter={() => setHoveredInput('confirmPassword')}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={() => setFocusedInput('confirmPassword')}
              onBlur={() => setFocusedInput(null)}
            />
          </div>

          <button 
            type="submit" 
            style={getButtonStyle(isHovered)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Next
          </button>
        </form>
        
      </div>

      {showForm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ textAlign: "center", color: "#333" }}>
              Fill {role === "college" ? "College" : "Test Center"} Details
            </h3>
            <div style={{ maxHeight: "70vh", overflowY: "auto", paddingTop: "1rem" }}>
              <form onSubmit={handleSubmit}>
                {role === "college" ? <CollegeForm onChange={setData} /> : <TestCenterForm onChange={setData} />}
                <button 
                  type="submit" 
                  style={{ ...getButtonStyle(isRegisterHovered), marginTop: "1.5rem" }}
                  onMouseEnter={() => setIsRegisterHovered(true)}
                  onMouseLeave={() => setIsRegisterHovered(false)}
                >
                  Register
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Styles
const formGroupStyle = { marginBottom: "1.5rem" };

 // Base input style
  const inputStyle = {
    width: "90%",
    marginLeft: "30px",
    marginRight: "10px",
    padding: "0.65rem 0",
    border: "none",
    borderBottom: "1px solid #ccc",
    fontSize: "0.95rem",
    backgroundColor: "transparent",
    color: "rgb(1, 18, 2)", 
    outline: "none",
    transition: "all 0.3s ease-in-out",
    caretColor: "#00ddeb",
  };

  // Hover and focus styles
  const inputHoverStyle = {
    borderBottom: "1px solid #e0ffff", // Light cyan for hover
  };

  const inputFocusStyle = {
    borderBottom: "1px solid #00ddeb",
    fontWeight: "bold", 
  };


const labelStyle = {
  fontSize: "1rem",
  fontWeight: "800",
  color: "rgb(124, 176, 255)",
  marginBottom: "0.5rem",
  display: "block",
};

const buttonStyle = {
  width: "100%",
  padding: "0.85rem",
  backgroundColor: "#2563eb",
  color: "white",
  fontWeight: "bold",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background-color 0.3s ease",
};

const buttonHoverStyle = {
  backgroundColor: "rgba(8, 12, 21, 0.27)", // Darker blue for hover effect
};

const getButtonStyle = (isHovered) => ({
  ...buttonStyle,
  ...(isHovered ? buttonHoverStyle : {}),
});

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  animation: "fadeIn 0.5s ease",
};

const modalStyle = {
  background: "#fff",
  padding: "2rem",
  borderRadius: "10px",
  width: "90%",
  maxWidth: "800px",
  animation: "fadeIn 0.5s ease",
};

// Add keyframe animation
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;
document.head.append(style);

export default Register;
