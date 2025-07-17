import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../images/logoskl.jpg";
import "../index.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("You must agree to the Terms & Conditions to proceed.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const response = await fetch("http://localhost:4000/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phoneNumber }),
        credentials: "include", 
      });      
      const data = await response.json();
      if (response.ok) {
        setMessage("Registration successful! Please login.");
        setName(""); setEmail(""); setPassword(""); setConfirmPassword(""); setPhoneNumber(""); setAgreeTerms(false);
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (err) {
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="reg-wrapper">
      <div className="reg-box">
        <img src={logo} alt="School Fund Logo" className="reg-logo" />

        <h2 className="reg-title">Create Account</h2>
        <p className="reg-subtitle">Join up to support school campaign</p>

        <form onSubmit={handleRegister} className="reg-form">
          <div className="reg-input-group">
            <label className="reg-label">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              required
              className="reg-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="reg-input-group">
            <label className="reg-label">Email Address</label>
            <input
              type="email"
              placeholder="donor@example.com"
              required
              className="reg-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="reg-input-group">
            <label className="reg-label">Password</label>
            <input
              type="password"
              placeholder="Create password"
              required
              className="reg-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="reg-input-group">
            <label className="reg-label">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              required
              className="reg-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="reg-input-group">
            <label className="reg-label">Phone Number</label>
            <input
              type="text"
              placeholder="Enter your phone number"
              className="reg-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="reg-terms">
            <label className="reg-terms-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
              />
              I agree to the <a href="#" className="text-blue-600">Terms & Conditions</a>
            </label>
          </div>

          {message && <div className="reg-message">{message}</div>}

          <button type="submit" className="reg-button">
            Create Account
          </button>

          <div className="reg-social-buttons">
            <button type="button" className="reg-social-google">Google</button>
            <button type="button" className="reg-social-facebook">Facebook</button>
          </div>
        </form>

        <div className="reg-footer">
          <p>
            Already have an account? <Link to="/" className="reg-secondary-link">Login</Link>
          </p> 
        </div>
      </div>
    </div>
  );
}
