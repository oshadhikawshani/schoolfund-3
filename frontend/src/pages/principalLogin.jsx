import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logoskl.jpg";
import landingBg from "../images/landing-bg.jpg";

export default function PrincipalLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handlePrincipalLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!username || !password) {
      setMessage("Please enter both username and password");
      return;
    }
    try {
      const response = await fetch("http://localhost:4000/api/principal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("principalToken", data.token);
        localStorage.setItem("principalData", JSON.stringify(data.principal));
        navigate("/principal-dashboard");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        backgroundImage: `url(${landingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="School Fund Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-800 mb-1">ALUMNI FUND</h1>
          <h2 className="text-xl font-bold text-gray-900">Principal Login</h2>
        </div>
        {/* Login Form */}
        <form className="space-y-6" onSubmit={handlePrincipalLogin}>
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School Email</label>
            <input
              type="text"
              required
              placeholder="Enter your school email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* Error Message */}
          {message && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {message}
            </div>
          )}
          {/* Login Button */}
          <div>
            <button
              type="submit"
              className="w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{
                backgroundColor: '#0091d9',
                '--tw-ring-color': '#0091d9'
              }}
              onMouseEnter={e => e.target.style.backgroundColor = '#007bb8'}
              onMouseLeave={e => e.target.style.backgroundColor = '#0091d9'}
            >
              Login as Principal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 