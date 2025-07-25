import React, { useEffect, useState } from "react";
import "../index.css";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import BackButton from "../components/BackButton";

export default function AdminRequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState({}); // { [id]: 'approve' | 'reject' | null }

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/school-requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        console.error("Failed to fetch requests");
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  const handleApprove = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: "approve" }));
    try {
      const response = await fetch(`https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/school-requests/approve/${id}`, {
        method: "POST"
      });
      if (response.ok) {
        showNotification('School request approved successfully! Approval email has been sent.', 'success');
        fetchRequests();
      } else {
        showNotification('Failed to approve request', 'error');
      }
    } catch (err) {
      console.error("Error approving request:", err);
      showNotification('Error approving request', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async (id) => {
    setSelectedRequest(requests.find(req => req._id === id));
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    setActionLoading(prev => ({ ...prev, [selectedRequest._id]: "reject" }));
    try {
      const response = await fetch(`https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/school-requests/reject/${selectedRequest._id}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });
      if (response.ok) {
        showNotification('School request rejected successfully! Rejection email has been sent.', 'success');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedRequest(null);
        fetchRequests();
      } else {
        showNotification('Failed to reject request', 'error');
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
      showNotification('Error rejecting request', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedRequest._id]: null }));
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      declined: "bg-red-100 text-red-800 border-red-200"
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[status] || statusColors.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Sort requests by createdAt descending (most recent first)
  const sortedRequests = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filteredRequests = sortedRequests.filter(req =>
    req.PrincipalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.Address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.Username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>
        {/* Notification */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-md border shadow-lg flex items-center gap-3 transition-all duration-300 animate-fade-in-fast ${notification.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
            }`} role="alert" aria-live="assertive">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium flex-1">{notification.message}</p>
            <button
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              aria-label="Dismiss notification"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Header & Search Bar */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">School Account Requests</h1>
            <p className="text-gray-600">Review and manage school registration requests</p>
          </div>
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm w-full md:w-80">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search by name, address, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full outline-none bg-transparent text-gray-700"
              aria-label="Search requests"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
            <p className="mt-1 text-sm text-gray-500">No school requests to review at this time.</p>
          </div>
        ) : (
          /* Requests Grid */
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredRequests.map((req) => (
              <div key={req._id} className={`bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-200 flex flex-col ${req.Status === 'pending' ? 'ring-2 ring-yellow-300' : ''}`}>
                {/* Card Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shadow-sm">
                      {req.Username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{req.PrincipalName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <FaUserCircle className="text-gray-400 w-4 h-4" />
                      <span className="text-xs text-gray-600 truncate">{req.Username}</span>
                    </div>
                  </div>
                  {getStatusBadge(req.Status)}
                </div>

                {/* Card Body */}
                <div className="px-6 py-4 space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 w-28">School Name:</span>
                    <span className="text-gray-800">{req.PrincipalName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 w-28">Principal:</span>
                    <span className="text-gray-800">{req.PrincipalName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 w-28">Address:</span>
                    <span className="text-gray-800">{req.Address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 w-28">Contact:</span>
                    <span className="text-gray-800">{req.ContactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 w-28">Email:</span>
                    <span className="text-gray-800">{req.Email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 w-28">Username:</span>
                    <span className="text-gray-800">{req.Username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 w-28">Request ID:</span>
                    <span className="text-gray-800">{req.SchoolRequestID}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 w-28">Submitted:</span>
                    <span className="text-gray-800">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Card Actions */}
                {req.Status === 'pending' && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={() => handleApprove(req._id)}
                      className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${actionLoading[req._id] === 'approve' ? 'cursor-wait' : ''}`}
                      disabled={!!actionLoading[req._id]}
                      aria-busy={actionLoading[req._id] === 'approve'}
                    >
                      {actionLoading[req._id] === 'approve' ? (
                        <span className="loader mr-2"></span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      className={`flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${actionLoading[req._id] === 'reject' ? 'cursor-wait' : ''}`}
                      disabled={!!actionLoading[req._id]}
                      aria-busy={actionLoading[req._id] === 'reject'}
                    >
                      {actionLoading[req._id] === 'reject' ? (
                        <span className="loader mr-2"></span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-60 flex items-center justify-center z-50">
            <div className="relative w-full max-w-md mx-auto p-6 border shadow-2xl rounded-xl bg-white animate-fade-in-fast">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-3">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Reject School Request</h3>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Are you sure you want to reject the request from <strong>{selectedRequest.PrincipalName}</strong>?
                </p>
                <label className="block text-sm font-medium text-gray-700 text-left mb-2 w-full">
                  Reason for rejection (optional):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
                  rows="3"
                  placeholder="Please provide a reason for rejection..."
                />
                <div className="flex justify-end space-x-3 w-full mt-2">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReject}
                    className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${actionLoading[selectedRequest._id] === 'reject' ? 'cursor-wait' : ''}`}
                    disabled={!!actionLoading[selectedRequest._id]}
                  >
                    {actionLoading[selectedRequest._id] === 'reject' ? (
                      <span className="loader"></span>
                    ) : null}
                    Reject Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Add this CSS to your global styles or in index.css for the loader spinner */
/*
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  display: inline-block;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/
