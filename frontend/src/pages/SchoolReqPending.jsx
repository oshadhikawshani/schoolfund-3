import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from "../images/logoskl.jpg";

const SchoolReqPending = () => {
    const [requestData, setRequestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkRequestStatus = async () => {
            const searchParams = new URLSearchParams(location.search);
            const emailFromQuery = searchParams.get('email');
            const email = emailFromQuery || localStorage.getItem("schoolRequestEmail");

            if (!email) {
                setError("No request found. Please submit a new request.");
                setLoading(false);
                return;
            }

            const baseUrl = import.meta.env.VITE_API_URL || "https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev";

            try {
                let response;
                if (emailFromQuery) {
                    // Use the query-string variant when email is provided in URL
                    const encoded = encodeURIComponent(emailFromQuery);
                    response = await fetch(`${baseUrl}/api/school-requests/status?email=${encoded}`);
                } else {
                    // Fallback to path-param using stored email
                    const encoded = encodeURIComponent(email);
                    response = await fetch(`${baseUrl}/api/school-requests/status/${encoded}`);
                }

                if (response.ok) {
                    const data = await response.json();
                    setRequestData(data);
                } else {
                    setError("Request not found. Please submit a new request.");
                }
            } catch (err) {
                setError("Failed to fetch request status. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        checkRequestStatus();
    }, [location.search]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'declined':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'declined':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'pending':
            default:
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'approved':
                return "Your school account request has been approved! You can now log in with your credentials.";
            case 'declined':
                return "Your school account request has been declined. Please contact support for more information.";
            case 'pending':
            default:
                return "Your school account request is currently under review. We'll notify you once a decision has been made.";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading request status...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Not Found</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/school-request")}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Submit New Request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img src={logo} alt="School Fund Logo" className="h-16 w-auto" />
                        <h1 className="text-2xl font-bold text-gray-900">School Request Status</h1>
                    </div>
                    <button
                        onClick={() => navigate("/")}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Back to Login
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Status Header */}
                    <div className={`px-6 py-4 border-b ${getStatusColor(requestData.Status)}`}>
                        <div className="flex items-center space-x-3">
                            {getStatusIcon(requestData.Status)}
                            <div>
                                <h2 className="text-xl font-semibold capitalize">
                                    Status: {requestData.Status}
                                </h2>
                                <p className="text-sm opacity-90">
                                    {getStatusMessage(requestData.Status)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Request Details */}
                    <div className="px-6 py-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">School Name</label>
                                    <p className="text-gray-900 font-medium">{(requestData.SchoolRequestID || '').replace(/_/g, ' ')}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Principal Name</label>
                                    <p className="text-gray-900">{requestData.PrincipalName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Email Address</label>
                                    <p className="text-gray-900">{requestData.Email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Contact Number</label>
                                    <p className="text-gray-900">{requestData.ContactNumber}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Username</label>
                                    <p className="text-gray-900">{requestData.Username}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Request ID</label>
                                    <p className="text-gray-900 font-mono text-sm">{requestData.SchoolRequestID}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Submitted On</label>
                                    <p className="text-gray-900">
                                        {new Date(requestData.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">School Address</label>
                                    <p className="text-gray-900">{requestData.Address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Principal Credentials (visible when approved and credentials exist) */}
                        {requestData.Status === 'approved' && (requestData.principalUsername || requestData.principalPassword) && (
                            <div className="mt-8 p-4 rounded-lg border border-green-200 bg-green-50">
                                <h4 className="text-md font-semibold text-green-900 mb-3">Principal Credentials</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Username</label>
                                        <p className="text-gray-900 font-medium">{requestData.principalUsername || requestData.PrincipalName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Password</label>
                                        <div className="flex items-center gap-3">
                                            <p className="text-gray-900 font-mono">
                                                {showPassword ? (requestData.principalPassword || '—') : '••••••••'}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(v => !v)}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                {showPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-green-800 mt-2">Keep these credentials safe. You can change them after first login.</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            {requestData.Status === 'approved' && (
                                <button
                                    onClick={() => navigate("/")}
                                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Proceed to Login
                                </button>
                            )}
                            {requestData.Status === 'declined' && (
                                <button
                                    onClick={() => navigate("/school-request")}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Submit New Request
                                </button>
                            )}
                            <button
                                onClick={() => navigate("/")}
                                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolReqPending;