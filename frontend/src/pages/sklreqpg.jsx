import React, { useState } from "react";
import "../indexskl.css";

const SchoolAccountForm = () => {
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
        // Optionally reset form
      } else {
        setMessage(data.message || "Submission failed");
      }
    } catch (err) {
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="skl-container">
      <h2 className="skl-title">Request Admin Account – School Registration</h2>

      <form className="skl-form" onSubmit={handleSubmit}>
        <div className="skl-grid">
          <div className="skl-group">
            <label className="skl-label">School Name*</label>
            <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} className="skl-input" required />
          </div>

          <div className="skl-group">
            <label className="skl-label">School Address*</label>
            <textarea name="address" value={formData.address} onChange={handleChange} className="skl-input" required />
          </div>

          <div className="skl-group">
            <label className="skl-label">Principal's Name*</label>
            <input type="text" name="principal" value={formData.principal} onChange={handleChange} className="skl-input" required />
          </div>

          <div className="skl-group">
            <label className="skl-label">School Contact Number*</label>
            <input type="tel" name="contact" value={formData.contact} onChange={handleChange} className="skl-input" required />
          </div>

          <div className="skl-group">
            <label className="skl-label">School Email*</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="skl-input" required />
          </div>

          <div className="skl-group">
            <label className="skl-label">Username*</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="skl-input" required />
          </div>

          <div className="skl-group">
            <label className="skl-label">Password*</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="skl-input" required />
          </div>

          <div className="skl-group">
            <label className="skl-label">Confirm Password*</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="skl-input" required />
          </div>

          <div className="skl-group">
            <label className="skl-label">Upload Government-Issued Certificate*</label>
            <input type="file" name="certificate" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="skl-input" required />
          </div>
        </div>

        <div className="skl-checkbox">
          <input type="checkbox" required />
          <span>I confirm the information is accurate and official.</span>
        </div>
        {message && <div className="skl-message">{message}</div>}
        <button type="submit" className="skl-button">Request Admin Account</button>
      </form>
    </div>
  );
};

export default SchoolAccountForm;
