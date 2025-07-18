import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../images/logoskl.jpg";
import "../index.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleOtherLogin = (role) => (e) => {
    e.preventDefault();
    if (role === "admin") {
      navigate("/admin-review");
    } else {
      alert(`Login for ${role} clicked`);
    }
  };

  const handleDonorLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch("http://localhost:4000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <img src={logo} alt="School Fund Logo" className="login-logo" />
        <h2 className="login-title">Welcome back! Please login to your account</h2>
        <form className="login-form">
          <div className="login-input-group">
            <label className="login-label">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="login-input-group">
            <label className="login-label">Password</label>
            <input
              type="password"
              required
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="login-checkbox-group">
            <label className="login-checkbox-label">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
              />
              Make my donation anonymous
            </label>
            <a href="#" className="login-forgot-link">Forgot Password?</a>
          </div>
          {message && <div className="login-message">{message}</div>}
          <div className="space-y-2 mt-4">
            <button type="submit" onClick={handleOtherLogin("admin")} className="login-button">
              Login as Admin
            </button>
            <button type="submit" onClick={handleOtherLogin("school")} className="login-button">
              Login as School
            </button>
            <button type="submit" onClick={handleDonorLogin} className="login-button">
              Login as Donor
            </button>
          </div>
        </form>
        <div className="login-footer">
          <p>
            Create a school account?{" "}
            <Link to="/school-request" className="login-secondary-link">Click here</Link>
          </p>
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="login-secondary-link">Sign up as Donor</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
