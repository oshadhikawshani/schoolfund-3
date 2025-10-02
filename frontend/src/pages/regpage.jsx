import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../images/logoskl.jpg";
import BackButton from "../components/BackButton";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);

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
      const response = await fetch("https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/users/signup", {
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <img src={logo} alt="School Fund Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-800 mb-1">ALUMNI FUND</h1>
          <h2 className="text-xl font-bold text-gray-900">Register</h2>
        </div>
        {/* Registration Form */}
        <form className="space-y-6" onSubmit={handleRegister}>
          <div className="space-y-3">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="donor@example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <div className="flex items-center">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
                I have read and agree to the {" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 hover:text-blue-500 font-medium underline"
                >
                  Terms & Conditions
                </button>
              </label>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`text-sm p-2 rounded-md ${message.includes("successful")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
              }`}>
              {message}
            </div>
          )}

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={!agreeTerms}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
              agreeTerms ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            Create Account
          </button>

          
        </form>

        {/* Terms & Conditions Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowTermsModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Terms & Conditions</h3>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto text-sm text-gray-700 space-y-5">
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">What Information We Collect</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li><span className="font-medium">School details:</span> Your school’s name, address, email, and contact information.</li>
                    <li><span className="font-medium">Verification documents:</span> Your uploaded registration certificate to confirm your school is legitimate.</li>
                    <li><span className="font-medium">Login credentials:</span> Your username and password, stored securely.</li>
                    <li><span className="font-medium">Principal ID:</span> A unique code sent to your school principal so only they can review and approve campaigns valued above Rs. 50,000.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">How We Use Your Information</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Verify schools before granting access to the system.</li>
                    <li>Allow principals to approve high-value donation campaigns using their secure Principal ID.</li>
                    <li>Contact you about your account, approvals, or any issues.</li>
                    <li>Maintain security and improve the platform, including troubleshooting and updates.</li>
                    <li>Comply with local laws regarding school donations and fundraising activities.</li>
                  </ul>
                  <p className="mt-2">We do not sell or trade your personal data to anyone.</p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">How We Protect Your Data</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li><span className="font-medium">Encryption:</span> All uploaded files and personal information are encrypted during transfer and storage.</li>
                    <li><span className="font-medium">Secure servers:</span> Your data is stored on protected servers with firewalls, intrusion detection, and regular security audits.</li>
                    <li><span className="font-medium">Access controls:</span> Only verified system admins and authorized staff can access your documents.</li>
                    <li><span className="font-medium">Monitoring:</span> We monitor our systems to detect unauthorized access or suspicious activity.</li>
                    <li><span className="font-medium">Breach notification:</span> If your information is ever exposed due to a data breach, we will notify you within 72 hours via email and provide guidance on what to do next.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Your Rights</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Request a copy of the data we hold about your school.</li>
                    <li>Ask us to correct any inaccurate information.</li>
                    <li>Request deletion of your data when it’s no longer needed (unless we’re legally required to keep it).</li>
                    <li>Withdraw your consent for us to process your data (which may mean you can no longer use the platform).</li>
                  </ul>
                  <p className="mt-2">To exercise these rights, contact us at <span className="font-medium">[Insert Contact Email]</span>.</p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Your Responsibilities</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Only create accounts for registered and verified schools.</li>
                    <li>Ensure all documents and campaign information are truthful and accurate.</li>
                    <li>Understand that campaigns below Rs. 50,000 are auto-approved, while those above Rs. 50,000 require principal approval using the Principal ID.</li>
                    <li>Keep your login details and Principal ID confidential. Sharing or misusing them may lead to account suspension or termination.</li>
                    <li>Not use the platform for fraud, scams, or unauthorized fundraising.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">How Long We Keep Your Information</h4>
                  <p>We store your registration certificates and data only as long as necessary for verification, legal compliance, and to maintain your account. Once no longer needed, your documents and data will be securely deleted from our systems.</p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Cookies & Tracking</h4>
                  <p>SchoolFund+ may use cookies for analytics and to improve your experience. You’ll be informed if cookies are used, and you can control or disable them in your browser settings.</p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Changes to This Agreement</h4>
                  <p>We may update this Privacy & User Agreement from time to time. If we make significant changes, we’ll notify you by email or through the app before the new terms take effect.</p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Acceptance</h4>
                  <p>By clicking “I Agree”, you confirm that you:</p>
                  <ul className="list-disc ml-5 space-y-1 mt-1">
                    <li>Have read and understood this agreement.</li>
                    <li>Agree to our collection, protection, and use of your information as described.</li>
                    <li>Will follow the platform’s rules and responsibilities.</li>
                  </ul>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>

  );
}
