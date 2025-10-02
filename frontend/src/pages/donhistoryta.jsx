import React, { useEffect, useState } from "react";
import { fetchDonorHistory } from "../api/donations";
import { validateToken } from "../lib/api";
import { Link } from "react-router-dom";
import logo from "../images/logoskl.jpg";
import BackButton from "../components/BackButton";

export default function DonorHistoryTA() {
  const [data, setData] = useState({ monetary: [], nonMonetary: [] });
  const [tab, setTab] = useState("monetary");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First validate the token
        const tokenValidation = await validateToken();
        if (!tokenValidation.valid) {
          setError(`Authentication failed: ${tokenValidation.error?.error || tokenValidation.error}`);
          return;
        }
        
        const historyData = await fetchDonorHistory();
        setData(historyData);
      } catch (err) {
        console.error('Error loading donation history:', err);
        if (err.response?.status === 401) {
          setError('Please log in to view your donation history');
        } else {
          setError('Failed to load donation history. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Calculate statistics
  const totalMonetary = data.monetary.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalDonations = data.monetary.length + data.nonMonetary.length;
  const completedDonations = data.monetary.filter(d => d.status === 'completed').length + 
                           data.nonMonetary.filter(d => d.status === 'completed').length;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityIcon = (visibility) => {
    return visibility?.toLowerCase() === 'anonymous' ? '👤' : '🌍';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <BackButton />
              <img src={logo} alt="Logo" className="h-16 w-16 rounded-lg shadow-sm" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
                <p className="text-sm text-gray-600">Track your contribution history</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/donor/browse" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                Browse Campaigns
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => window.location.href = "/"}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-sm text-blue-700">Loading your donation history...</p>
            </div>
          </div>
        )}

        {!error && !loading && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-lg">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Donated</p>
                    <p className="text-2xl font-bold text-gray-900">Rs. {totalMonetary.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-lg">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900">{totalDonations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-lg">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{completedDonations}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-8">
              <div className="flex space-x-1">
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    tab === "monetary" 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setTab("monetary")}
                >
                  <span className="flex items-center justify-center">
                    💰 Monetary Donations ({data.monetary.length})
                  </span>
                </button>
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    tab === "nonMonetary" 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setTab("nonMonetary")}
                >
                  <span className="flex items-center justify-center">
                    📦 Non-Monetary Donations ({data.nonMonetary.length})
                  </span>
                </button>
              </div>
            </div>

            {/* Content */}
            {tab === "monetary" ? (
              <div className="space-y-6">
                {data.monetary.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💰</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Monetary Donations Yet</h3>
                    <p className="text-gray-600 mb-6">Start making a difference by donating to campaigns</p>
                    <Link 
                      to="/donor/browse"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Browse Campaigns
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {data.monetary.map((donation) => (
                      <div key={donation._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 text-lg">💰</span>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Campaign #{donation.campaignID}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {new Date(donation.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Amount</p>
                                <p className="text-lg font-bold text-green-600">
                                  Rs. {Number(donation.amount).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Status</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                                  {donation.status}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Visibility</p>
                                <div className="flex items-center space-x-1">
                                  <span>{getVisibilityIcon(donation.visibility)}</span>
                                  <span className="text-sm text-gray-900">{donation.visibility}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Transaction</p>
                                <p className="text-sm text-gray-900">
                                  {donation.payment?.transactionID || "Pending"}
                                </p>
                              </div>
                            </div>

                            {donation.payment?.receiptURL && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <a 
                                  href={donation.payment.receiptURL} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                  📄 View Receipt
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {data.nonMonetary.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📦</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Non-Monetary Donations Yet</h3>
                    <p className="text-gray-600 mb-6">Contribute items or services to help schools in need</p>
                    <Link 
                      to="/donor/browse"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Browse Campaigns
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {data.nonMonetary.map((donation) => (
                      <div key={donation._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-purple-600 text-lg">📦</span>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Campaign #{donation.campaignID}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {new Date(donation.intentDate || donation.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Delivery Method</p>
                                <p className="text-sm text-gray-900">{donation.deliveryMethod}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Status</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                                  {donation.status}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Deadline</p>
                                <p className="text-sm text-gray-900">
                                  {donation.deadlineDate 
                                    ? new Date(donation.deadlineDate).toLocaleDateString()
                                    : "Not set"
                                  }
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Photo</p>
                                {donation.imagePath ? (
                                  <a 
                                    href={donation.imagePath} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    View Image
                                  </a>
                                ) : (
                                  <span className="text-gray-500 text-sm">No image</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Transparency Note */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">🔒</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Transparency & Verification</h3>
                  <p className="text-sm text-blue-800">
                    All donations are verified by the school's finance officer and receipts are uploaded for transparency. 
                    All transactions are audited monthly to ensure accountability.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}