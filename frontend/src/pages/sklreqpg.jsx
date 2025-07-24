import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

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
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          SchoolRequestID: formData.schoolName.replace(/\s+/g, "_") + "_" + Math.floor(Math.random() * 10000),
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 mx-auto relative">
        {/* Back Button - top left, outside form and header */}
        <div className="absolute left-4 top-4">
          <BackButton />
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center mb-4 mt-10">
          Request Admin Account – School Registration
        </h2>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          {/* School Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* School Address - Full Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Document Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Government-Issued Certificate <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-4 pb-5 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-10 w-10 text-gray-400"
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
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="certificate"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
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
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
              </div>
            </div>
            {formData.certificate && (
              <p className="mt-1 text-sm text-gray-600">
                Selected file: {formData.certificate.name}
              </p>
            )}
          </div>

          {/* Confirmation Checkbox (remove this, now handled in modal) */}
          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-md ${message.includes("successfully")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
              }`}>
              {message}
            </div>
          )}

          {/* Submit Button triggers modal */}
          <div className="pt-1">
            <button
              type="button"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={handlePreSubmit}
            >
              Request Admin Account
            </button>
          </div>
        </form>

        {/* Modal for Policy Agreement */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <h3 className="text-lg font-semibold mb-4">Policy Agreement</h3>
              <div className="mb-4 text-sm text-gray-700">
                <p>
                  Please read and agree to the following policy before submitting your request:
                </p>
                <ul className="list-disc pl-5 mt-2">
                  <li>All information provided is accurate and official.</li>
                  <li>You agree to abide by the platform's terms and conditions.</li>
                  <li>Misrepresentation may result in disqualification.</li>
                </ul>
              </div>
              <div className="flex items-center mb-4">
                <input
                  id="policyAgreement"
                  type="checkbox"
                  checked={policyChecked}
                  onChange={e => setPolicyChecked(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="policyAgreement" className="ml-2 text-sm text-gray-700">
                  I have read and agree to the policy above.
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => { setShowModal(false); setPolicyChecked(false); }}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded text-white ${policyChecked ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"}`}
                  disabled={!policyChecked}
                  onClick={handleModalConfirm}
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );
};

export default SchoolAccountForm;
