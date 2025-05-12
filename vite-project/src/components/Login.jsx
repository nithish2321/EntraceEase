import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import toast, { Toaster } from "react-hot-toast";

function Login({ role, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [hoveredInput, setHoveredInput] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const { data } = await login(role, email, password);
      toast.success("Login successful!");
      onLogin(data.token, role === "college" ? data.collegeId : data.testCenterId);
      setTimeout(() => {
        navigate(role === "college" ? "/college-dashboard" : "/test-center-dashboard");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed.");
    }
  };

  const getInputStyle = (inputName) => ({
    ...inputStyle,
    ...(hoveredInput === inputName ? inputHoverStyle : {}),
    ...(focusedInput === inputName ? inputFocusStyle : {}),
  });

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", fontFamily: "Segoe UI", background: "#f4f7fb", justifyContent: 'center' }}>
      <Toaster position="top-center" />
      <div
        style={{
          maxWidth: "500px",
          margin: "90px auto",
          padding: "2rem",
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(5px)",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#1e3a8a", marginBottom: "2rem" }}>
          Login as {role === "college" ? "College Authority" : "Test Center Manager"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>📧 Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={getInputStyle("email")}
              onMouseEnter={() => setHoveredInput("email")}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={() => setFocusedInput("email")}
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
              style={getInputStyle("password")}
              onMouseEnter={() => setHoveredInput("password")}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
            />
          </div>

          <button
            type="submit"
            style={getButtonStyle(isHovered)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Login
          </button>
        </form>

        <p
          onClick={() => navigate("/register")}
          style={{
            color: "#2563eb",
            fontSize: "0.875rem",
            textAlign: "center",
            marginTop: "1rem",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Don't have an account? Register here
        </p>
      </div>
    </div>
  );
}

// === Shared Styles (from Register.jsx) ===
const formGroupStyle = { marginBottom: "1.5rem" };

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

const inputHoverStyle = {
  borderBottom: "1px solid #e0ffff",
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
  backgroundColor: "rgba(8, 12, 21, 0.27)",
};

const getButtonStyle = (isHovered) => ({
  ...buttonStyle,
  ...(isHovered ? buttonHoverStyle : {}),
});

export default Login;
