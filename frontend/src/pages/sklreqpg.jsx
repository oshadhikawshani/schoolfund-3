import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import logoSkl from "../images/logoskl.jpg";

const SchoolAccountForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolName: "",
    address: "",
    principal: "",
    contact: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    certificate: null,
  });
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [policyChecked, setPolicyChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const validate = () => {
    const newErrors = {};
    // School Name
    if (!formData.schoolName.trim()) newErrors.schoolName = "School name is required.";
    // Principal
    if (!formData.principal.trim()) newErrors.principal = "Principal's name is required.";
    // Contact (simple phone validation)
    if (!formData.contact.trim()) newErrors.contact = "Contact number is required.";
    else if (!/^\+?\d{7,15}$/.test(formData.contact.trim())) newErrors.contact = "Enter a valid phone number.";
    // Email
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) newErrors.email = "Enter a valid email address.";
    // Username
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    // Password
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    // Confirm Password
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    // Address
    if (!formData.address.trim()) newErrors.address = "School address is required.";
    // Certificate
    if (!formData.certificate) newErrors.certificate = "Certificate is required.";
    else {
      const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowed.includes(formData.certificate.type)) newErrors.certificate = "File must be PDF, JPG, or PNG.";
      if (formData.certificate.size > 10 * 1024 * 1024) newErrors.certificate = "File must be 10MB or less.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all fields
    if (!validate()) return;
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const response = await fetch("http://localhost:4000/api/school-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          SchoolRequestID: formData.schoolName.replace(/\s+/g, "_"),
          Username: formData.username,
          Password: formData.password,
          Address: formData.address,
          ContactNumber: formData.contact,
          Email: formData.email,
          PrincipalName: formData.principal,
          SchoolLogo: formData.certificate ? formData.certificate.name : "",
          Certificate: formData.certificate ? formData.certificate.name : ""
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("School request submitted successfully!");
        // Store email for status checking
        localStorage.setItem("schoolRequestEmail", formData.email);
        // Navigate to status page after a short delay
        setTimeout(() => {
          navigate("/req-pending");
        }, 1500);
      } else {
        setMessage(data.message || "Submission failed");
      }
    } catch (err) {
      setMessage("Server error. Please try again later.");
    }
  };

  // Instead of submitting directly, open modal
  const handlePreSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  // When modal confirm is clicked, submit the form
  const handleModalConfirm = () => {
    setShowModal(false);
    setPolicyChecked(false);
    // Actually submit the form
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    if (!showModal) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowModal(false);
        setPolicyChecked(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showModal]);

  return (
    <div className="min-h-screen flex items-center justify-center px-2 py-8 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 mx-auto relative border border-blue-100">
        {/* Back Button - top left, outside form and header */}
        <div className="absolute left-4 top-2">
          <BackButton />
        </div>
        <div className="flex flex-col items-center mb-3 mt-3">
          <img src={logoSkl} alt="School Logo" className="w-14 h-14 rounded-full shadow mb-1 border-2 border-blue-200 object-cover" />
          <h2 className="text-xl font-extrabold text-blue-900 text-center tracking-tight">Request Admin Account</h2>
          <p className="text-xs text-gray-500 text-center mt-1">School Registration</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {/* School Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">School Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.schoolName ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}
                  required
                />
                {errors.schoolName && <p className="text-xs text-red-500 mt-1">{errors.schoolName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Principal's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="principal"
                  value={formData.principal}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.principal ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}
                  required
                />
                {errors.principal && <p className="text-xs text-red-500 mt-1">{errors.principal}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.contact ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}
                  required
                />
                {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.email ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}
                  required
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.username ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}
                  required
                />
                {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.password ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}
                  required
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}
                  required
                />
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* School Address - Full Width */}
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">School Address</h3>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className={`w-full px-3 py-2 border ${errors.address ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}
              required
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          {/* Document Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Documents</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Government-Issued Certificate <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex flex-col items-center justify-center px-6 pt-6 pb-6 border-2 border-blue-200 border-dashed rounded-xl hover:border-blue-400 transition-colors bg-blue-50">
              <svg
                className="mx-auto h-12 w-12 text-blue-400 mb-2"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <label
                htmlFor="certificate"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-4 py-2 border border-blue-200 shadow-sm"
              >
                <span>Choose File</span>
                <input
                  id="certificate"
                  name="certificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleChange}
                  className="sr-only"
                  required
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
              {formData.certificate && (
                <p className="mt-2 text-sm text-blue-700 font-medium">
                  Selected file: {formData.certificate.name}
                </p>
              )}
              {errors.certificate && <p className="text-xs text-red-500 mt-1">{errors.certificate}</p>}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm mt-2 ${message.includes("successfully")
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
              }`}>
              {message.includes("successfully") ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              <span>{message}</span>
            </div>
          )}

          {/* Submit Button triggers modal */}
          <div className="pt-2">
            <button
              type="button"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all duration-150"
              onClick={handlePreSubmit}
            >
              Request Admin Account
            </button>
          </div>
        </form>

        {/* Modal for Policy Agreement */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-40 backdrop-blur-sm animate-fadeIn"
            onClick={e => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
                setPolicyChecked(false);
              }
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative border border-blue-200 animate-scaleIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4 text-blue-800">SchoolFund+ Privacy & User Agreement</h3>
              <div className="mb-4 text-sm text-gray-700 space-y-3">
                <p>Welcome to SchoolFund+. Before you create an account or start using our services, please read this agreement carefully. By selecting “I Agree”, you confirm that you understand and accept these terms.</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>What Information We Collect</strong>
                    <ul className="list-disc pl-5 mt-1">
                      <li>School details: Your school’s name, address, email, and contact information.</li>
                      <li>Verification documents: Your uploaded registration certificate to confirm your school is legitimate.</li>
                      <li>Login credentials: Your username and password, stored securely.</li>
                      <li>Principal ID: A unique code sent to your school principal so only they can review and approve campaigns valued above Rs. 50,000.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>How We Use Your Information</strong>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Verify schools before granting access to the system.</li>
                      <li>Allow principals to approve high-value donation campaigns using their secure Principal ID.</li>
                      <li>Contact you about your account, approvals, or any issues.</li>
                      <li>Maintain security and improve the platform, including troubleshooting and updates.</li>
                      <li>Comply with local laws regarding school donations and fundraising activities.</li>
                      <li>We do not sell or trade your personal data to anyone.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>How We Protect Your Data</strong>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Encryption: All uploaded files and personal information are encrypted during transfer and storage.</li>
                      <li>Secure servers: Your data is stored on protected servers with firewalls, intrusion detection, and regular security audits.</li>
                      <li>Access controls: Only verified system admins and authorized staff can access your documents.</li>
                      <li>Monitoring: We monitor our systems to detect unauthorized access or suspicious activity.</li>
                      <li>Breach notification: If your information is ever exposed due to a data breach, we will notify you within 72 hours via email and provide guidance on what to do next.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Your Rights</strong>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Request a copy of the data we hold about your school.</li>
                      <li>Ask us to correct any inaccurate information.</li>
                      <li>Request deletion of your data when it’s no longer needed (unless we’re legally required to keep it).</li>
                      <li>Withdraw your consent for us to process your data (which may mean you can no longer use the platform).</li>
                      <li>To exercise these rights, contact us at [Insert Contact Email].</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Your Responsibilities</strong>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Only create accounts for registered and verified schools.</li>
                      <li>Ensure all documents and campaign information are truthful and accurate.</li>
                      <li>Understand that campaigns below Rs. 50,000 are auto-approved, while those above Rs. 50,000 require principal approval using the Principal ID.</li>
                      <li>Keep your login details and Principal ID confidential. Sharing or misusing them may lead to account suspension or termination.</li>
                      <li>Not use the platform for fraud, scams, or unauthorized fundraising.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>How Long We Keep Your Information</strong>
                    <ul className="list-disc pl-5 mt-1">
                      <li>We store your registration certificates and data only as long as necessary for verification, legal compliance, and to maintain your account.</li>
                      <li>Once no longer needed, your documents and data will be securely deleted from our systems.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Cookies & Tracking</strong>
                    <ul className="list-disc pl-5 mt-1">
                      <li>SchoolFund+ may use cookies for analytics and to improve your experience.</li>
                      <li>You’ll be informed if cookies are used, and you can control or disable them in your browser settings.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Changes to This Agreement</strong>
                    <ul className="list-disc pl-5 mt-1">
                      <li>We may update this Privacy & User Agreement from time to time. If we make significant changes, we’ll notify you by email or through the app before the new terms take effect.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Acceptance</strong>
                    <ul className="list-disc pl-5 mt-1">
                      <li>By clicking “I Agree”, you confirm that you:</li>
                      <li>Have read and understood this agreement.</li>
                      <li>Agree to our collection, protection, and use of your information as described.</li>
                      <li>Will follow the platform’s rules and responsibilities.</li>
                    </ul>
                  </li>
                </ol>
              </div>
              <div className="flex items-center mb-4 mt-2">
                <input
                  id="policyAgreement"
                  type="checkbox"
                  checked={policyChecked}
                  onChange={e => setPolicyChecked(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="policyAgreement" className="ml-2 text-sm text-gray-700">
                  I have read and agree to the Privacy & User Agreement
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium transition"
                  onClick={() => { setShowModal(false); setPolicyChecked(false); }}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-white font-semibold transition ${policyChecked ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"}`}
                  disabled={!policyChecked}
                  onClick={handleModalConfirm}
                >
                  I Agree
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Animations for modal */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease; }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scaleIn { animation: scaleIn 0.2s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </div>
  );
};

export default SchoolAccountForm;
