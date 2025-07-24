import React from "react";
import { Link } from "react-router-dom";
import "../index.css";
import logo from "../images/logoskl.jpg";
import BackButton from "../components/BackButton";

const donationData = [
  {
    date: "May 10, 2025",
    school: "Sunshine Elementary School",
    amount: "Rs. 1,500",
  },
  {
    date: "April 28, 2025",
    school: "Hope Children's Academy",
    amount: "Rs. 2,000",
  },
  {
    date: "March 15, 2025",
    school: "Bright Future School",
    amount: "Rs. 1,000",
  },
  {
    date: "February 22, 2025",
    school: "New Beginnings Education Center",
    amount: "Rs. 1,500",
  },
];

export default function DonHistoryTA() {
  return (
    <div className="donhistta-wrapper">
      {/* Back Button */}
      <div className="mb-4">
        <BackButton />
      </div>
      {/* Navigation */}
      <div className="donhistta-nav">
        <img src={logo} alt="Logo" className="donhistta-logo" />
        <div className="donhistta-links">
          <a href="#" className="active">My Donations</a>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </div>

      {/* Table */}
      <div className="donhistta-box">
        <div className="donhistta-header">
          <h2>Donation Breakdown</h2>
          <a href="#" className="donhistta-viewall">View All →</a>
        </div>

        <table className="donhistta-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>School / Campaign</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {donationData.map((entry, idx) => (
              <tr key={idx}>
                <td>{entry.date}</td>
                <td>{entry.school}</td>
                <td>{entry.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Transparency Note */}
        <div className="donhistta-note">
          <p>
            <strong>Donations are verified</strong> by the school’s finance officer and receipts
            are uploaded for transparency. All transactions are audited monthly.
          </p>
        </div>
      </div>
    </div>
  );
}
