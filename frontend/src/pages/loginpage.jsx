import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../images/logoskl.jpg";
import landingBg from "../images/landing-bg.jpg";
import BackButton from "../components/BackButton";

const API = import.meta.env.VITE_API_URL || "https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [loginType, setLoginType] = useState("donor"); // "donor", "school", "admin"
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSchoolLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username || !password) {
      setMessage("Please enter both username and password");
      return;
    }

    console.log('Attempting school login with:', { username: username, password: password ? '***' : 'missing' });

    try {
      const response = await fetch("https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/school-requests/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password }),
        credentials: "include"
      });
      const data = await response.json();

      console.log('Login response:', { status: response.status, data });

      if (response.ok) {
        // Store school data and token
        localStorage.setItem("schoolToken", data.token);
        localStorage.setItem("schoolData", JSON.stringify(data.school));
        navigate("/school-main");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage("Server error. Please try again later.");
    }
  };

  // Remove handleOtherLogin for admin, add new admin login handler
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminPassword("");
    setAdminError("");
    setShowAdminModal(true);
  };

  const handleAdminModalSubmit = (e) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setShowAdminModal(false);
      setAdminPassword("");
      setAdminError("");
      navigate("/admin-review");
    } else {
      setAdminError("Incorrect admin password");
    }
  };

  const handleDonorLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // Clear any existing tokens first
      localStorage.removeItem("donorToken");
      localStorage.removeItem("token");
      localStorage.removeItem("schoolToken");
      localStorage.removeItem("principalToken");
      
      const res = await axios.post(`${API}/api/donors/login`, { email: username, password }, {
        withCredentials: true,
      });
      
      localStorage.setItem("donorToken", res.data.token);
      localStorage.setItem("donorData", JSON.stringify(res.data.donor));
      
      // Store location data if available
      if (res.data.location) {
        localStorage.setItem("donorLocation", JSON.stringify(res.data.location));
        console.log("Donor location stored:", res.data.location);
      }
      
      setMessage("Login successful. Redirecting…");
      setTimeout(() => navigate("/donor-dashboard"), 700);
    } catch (err) {
      setMessage(err?.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
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

        {/* Admin Login Modal */}
        {showAdminModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/10">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
              <h3 className="text-lg font-semibold mb-4 text-center">Admin Login</h3>
              <form onSubmit={handleAdminModalSubmit}>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  autoFocus
                />
                {adminError && <div className="text-red-600 text-sm mb-2 text-center">{adminError}</div>}
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    onClick={() => { setShowAdminModal(false); setAdminPassword(""); setAdminError(""); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="School Fund Logo" className="w-16 h-16 mx-auto mb-4" />
          {/* <h1 className="text-lg font-semibold text-gray-800 mb-1">ALUMNI FUND</h1> */}
          <h2 className="text-xl font-bold text-gray-900">Welcome back! Please login to your account</h2>
        </div>

        {/* Login Form */}
        <form className="space-y-6">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="Enter your username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Checkbox and Forgot Password */}
          {/* <div className="flex items-center justify-between"> */}
          {/* <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Make my donation anonymous</span>
            </label> */}
          {/* <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
              Forgot Password?
            </a>
          </div> */}

          {/* Message */}
          {message && (
            <div className={`text-sm text-center p-3 rounded-md ${
              message.includes('successful') || message.includes('Success') 
                ? 'text-green-600 bg-green-50' 
                : 'text-red-600 bg-red-50'
            }`}>
              {message}
            </div>
          )}

          {/* Login Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              onClick={handleAdminLogin}
              className="w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{
                backgroundColor: '#0091d9',
                '--tw-ring-color': '#0091d9'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#007bb8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0091d9'}
            >
              Login as Admin
            </button>
            <button
              type="submit"
              onClick={handleSchoolLogin}
              className="w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{
                backgroundColor: '#0091d9',
                '--tw-ring-color': '#0091d9'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#007bb8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0091d9'}
            >
              Login as School
            </button>
            <button
              type="submit"
              onClick={handleDonorLogin}
              disabled={loading}
              className="w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-70"
              style={{
                backgroundColor: '#0091d9',
                '--tw-ring-color': '#0091d9'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#007bb8')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#0091d9')}
            >
              {loading ? "Signing in…" : "Login as Donor"}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Create a school account?{" "}
            <Link to="/school-request" className="text-blue-600 hover:text-blue-500 font-medium">
              Click here
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Check school request status?{" "}
            <button
              onClick={() => {
                const email = prompt("Enter your school email to check status:");
                if (email) {
                  navigate(`/req-pending?email=${encodeURIComponent(email)}`);
                }
              }}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Click here
            </button>
          </p>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign up as Donor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
