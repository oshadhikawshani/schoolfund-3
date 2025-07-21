import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../images/logoskl.jpg";
import landingBg from "../images/landing-bg.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [loginType, setLoginType] = useState("donor"); // "donor", "school", "admin"
  const navigate = useNavigate();

  const handleSchoolLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (!email || !password) {
      setMessage("Please enter both username and password");
      return;
    }

    console.log('Attempting school login with:', { username: email, password: password ? '***' : 'missing' });

    try {
      const response = await fetch("http://localhost:4000/api/school-requests/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
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
          <h2 className="text-xl font-bold text-gray-900">Welcome back! Please login to your account</h2>
        </div>

        {/* Login Form */}
        <form className="space-y-6">
          {/* Email/Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {loginType === "school" ? "Username" : "Email Address"}
            </label>
            <input
              type={loginType === "school" ? "text" : "email"}
              required
              placeholder={loginType === "school" ? "Enter your username" : "you@example.com"}
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
              className="w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{
                backgroundColor: '#0091d9',
                '--tw-ring-color': '#0091d9'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#007bb8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0091d9'}
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
              Check school request status?{" "}
              <button 
                onClick={() => {
                  const email = prompt("Enter your school email to check status:");
                  if (email) {
                    window.open(`http://localhost:4000/api/school-requests/status?email=${encodeURIComponent(email)}`, '_blank');
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
