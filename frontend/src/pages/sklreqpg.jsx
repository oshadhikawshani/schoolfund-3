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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
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

        <button type="submit" className="skl-button">Request Admin Account</button>
      </form>
    </div>
  );
};

export default SchoolAccountForm;
