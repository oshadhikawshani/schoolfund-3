import React, { useEffect, useState } from "react";
import "../index.css";

export default function AdminRequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/school-requests") // Replace with your backend endpoint
      .then((res) => res.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching requests:", err);
        setLoading(false);
      });
  }, []);

  const handleApprove = async (id) => {
    try {
      await fetch(`/api/school-requests/approve/${id}`, { method: "POST" });
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await fetch(`/api/school-requests/reject/${id}`, { method: "POST" });
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  return (
    <div className="adminreq-wrapper">
      <h2 className="adminreq-title">Pending School Account Requests</h2>

      {loading ? (
        <p className="adminreq-empty">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="adminreq-empty">No pending requests to review.</p>
      ) : (
        <div className="adminreq-list">
          {requests.map((req) => (
            <div key={req._id} className="adminreq-card">
              <div className="adminreq-field">
                <strong>School Name:</strong> {req.school_name}
              </div>
              <div className="adminreq-field">
                <strong>Principal:</strong> {req.principal_name}
              </div>
              <div className="adminreq-field">
                <strong>Address:</strong> {req.address}
              </div>
              <div className="adminreq-field">
                <strong>Contact Number:</strong> {req.contact_number}
              </div>
              <div className="adminreq-field">
                <strong>Email:</strong> {req.email}
              </div>
              <div className="adminreq-field">
                <strong>Username:</strong> {req.username}
              </div>
              <div className="adminreq-actions">
                <button
                  onClick={() => handleApprove(req._id)}
                  className="adminreq-approve-btn"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(req._id)}
                  className="adminreq-reject-btn"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
