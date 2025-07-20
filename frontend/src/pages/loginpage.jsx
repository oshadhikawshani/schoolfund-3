import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../images/logoskl.jpg";

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
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="School Fund Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-800 mb-1">ALUMNI FUND</h1>
          <h2 className="text-xl font-bold text-gray-900">Welcome back! Please login to your account</h2>
        </div>

        {/* Login Form */}
        <form className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Make my donation anonymous</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
              Forgot Password?
            </a>
          </div>

          {/* Error Message */}
          {message && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {message}
            </div>
          )}

          {/* Login Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              onClick={handleOtherLogin("admin")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Login as Admin
            </button>
            <button
              type="submit"
              onClick={handleOtherLogin("school")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Login as School
            </button>
            <button
              type="submit"
              onClick={handleDonorLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Login as Donor
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
