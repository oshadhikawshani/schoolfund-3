import React, { useState, useEffect } from 'react';
import api from '../lib/api';

export default function SchoolDonations({ schoolID }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, monetary, non-monetary
  const [statusFilter, setStatusFilter] = useState('all'); // all, completed, pending, failed
  const [groupBy, setGroupBy] = useState('status'); // status | none
  const [page, setPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState({}); // Track which donations are being updated
  const [successMessage, setSuccessMessage] = useState(''); // Success message for status updates
  const pageSize = 5;

  useEffect(() => {
    fetchDonations();
  }, [schoolID]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!schoolID) {
        setError('School ID is required');
        setLoading(false);
        return;
      }
      
      console.log('Fetching donations for school ID:', schoolID);
      
      // Use the localhost API endpoint for school donations
      const response = await api.get(`/api/donations/school/${schoolID}`);

      console.log('Donations data:', response.data);
      setDonations(response.data.donations || []);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError(`Failed to load donations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case 'completed':
      case 'received':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Normalize mixed backend statuses into UX buckets
  const normalizeStatusBucket = (donation) => {
    const status = donation?.status?.toLowerCase();
    if (status === 'completed' || status === 'received' || status === 'paid') return 'completed';
    if (status === 'pending') return 'pending';
    if (status === 'failed' || status === 'cancelled') return 'failed';
    return 'other';
  };

  const getDeliveryMethodIcon = (method) => {
    switch (method) {
      case 'handover':
        return '🤝';
      case 'courier':
        return '📦';
      case 'pickup':
        return '🚚';
      default:
        return '📋';
    }
  };

  // Function to update donation status
  const updateDonationStatus = async (donationId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [donationId]: true }));
      
      // Check if we have authentication token
      const token = localStorage.getItem("schoolToken") || localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      console.log('Updating donation status:', { donationId, newStatus, token: token.substring(0, 20) + '...' });
      
      const response = await api.put(`/api/school-donations/nonmonetary/${donationId}/status`, {
        status: newStatus
      });

      console.log('API response:', response.data);

      if (response.data.success) {
        // Update the donation in the local state
        setDonations(prevDonations => 
          prevDonations.map(donation => 
            donation._id === donationId 
              ? { ...donation, status: newStatus }
              : donation
          )
        );
        
        // Show success message
        setSuccessMessage(`Donation status updated to ${newStatus} successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000); // Clear after 3 seconds
      }
    } catch (err) {
      console.error('Error updating donation status:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      let errorMessage = 'Failed to update donation status';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You are not authorized to update this donation.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Donation not found.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [donationId]: false }));
    }
  };

  const filteredDonations = donations
    .filter(donation => {
      if (filter === 'all') return true;
      return donation.donationType === filter;
    })
    .filter(donation => {
      if (statusFilter === 'all') return true;
      return normalizeStatusBucket(donation) === statusFilter;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Reset or clamp page when filters change
  useEffect(() => {
    setPage(1);
  }, [filter, statusFilter, groupBy]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredDonations.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [filteredDonations.length]);

  const totalItems = filteredDonations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  const paginatedDonations = filteredDonations.slice(startIdx, endIdx);

  // Prepare grouped view
  const groupedByStatus = (source) => {
    const groups = [
      { key: 'completed', title: 'Completed / Received', donations: [] },
      { key: 'pending', title: 'Pending', donations: [] },
      { key: 'failed', title: 'Failed / Cancelled', donations: [] },
      { key: 'other', title: 'Other', donations: [] }
    ];
    const bucket = {
      completed: groups[0].donations,
      pending: groups[1].donations,
      failed: groups[2].donations,
      other: groups[3].donations
    };
    (source || []).forEach(d => bucket[normalizeStatusBucket(d)].push(d));
    return groups.filter(g => g.donations.length > 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading donations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800">{successMessage}</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donations Received</h2>
          <p className="text-gray-600 mt-1">All donations for your school campaigns</p>
          <p className="text-sm text-blue-600 mt-1">
            💡 For non-monetary donations: Click "Mark as Received" when you obtain the items to update campaign progress
          </p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-4 sm:mt-0 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({donations.length})
          </button>
          <button
            onClick={() => setFilter('monetary')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'monetary' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monetary ({donations.filter(d => d.donationType === 'monetary').length})
          </button>
          <button
            onClick={() => setFilter('non-monetary')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'non-monetary' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Non-Monetary ({donations.filter(d => d.donationType === 'non-monetary').length})
          </button>
        </div>
      </div>

      {/* Controls: Status + Grouping */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="completed">Completed / Received</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed / Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700">Group by</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="status">Status</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-lg font-semibold text-gray-900">{filteredDonations.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-xs text-green-700">Completed / Received</div>
          <div className="text-lg font-semibold text-green-900">{filteredDonations.filter(d => normalizeStatusBucket(d) === 'completed').length}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
                          <div className="text-xs text-yellow-700">Pending</div>
          <div className="text-lg font-semibold text-yellow-900">{filteredDonations.filter(d => normalizeStatusBucket(d) === 'pending').length}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="text-xs text-red-700">Failed / Cancelled</div>
          <div className="text-lg font-semibold text-red-900">{filteredDonations.filter(d => normalizeStatusBucket(d) === 'failed').length}</div>
        </div>
      </div>

      {/* Donations List */}
      {filteredDonations.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No donations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? "No donations have been made to your campaigns yet." 
              : `No ${filter} donations found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupBy === 'status' ? (
            groupedByStatus(paginatedDonations).map((group) => (
              <div key={group.key}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">
                    {group.title}
                  </h4>
                  <span className="text-xs text-gray-500">{group.donations.length}</span>
                </div>
                <div className="space-y-3">
                  {group.donations.map((donation, index) => (
                    <div key={donation._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                              {donation.status || 'Unknown'}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              donation.donationType === 'monetary' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {donation.donationType === 'monetary' ? '💰 Monetary' : '📦 Non-Monetary'}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {donation.campaignName || 'Unknown Campaign'}
                          </h3>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Donor:</span> {donation.donorDisplay || 'Unknown'}
                          </div>
                          {donation.donationType === 'monetary' ? (
                            <div className="text-lg font-bold text-green-600">
                              {formatAmount(donation.amount)}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="mr-2">{getDeliveryMethodIcon(donation.deliveryMethod)}</span>
                                <span className="font-medium">Delivery:</span> {donation.deliveryMethod || 'Not specified'}
                              </div>
                              {donation.deadlineDate && (
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Deadline:</span> {formatDate(donation.deadlineDate)}
                                </div>
                              )}
                              {donation.notes && (
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Notes:</span> {donation.notes}
                                </div>
                              )}
                            </div>
                          )}
                          {donation.message && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <span className="font-medium">Message:</span> {donation.message}
                            </div>
                          )}
                          
                          {/* Status Update Buttons for Non-Monetary Donations */}
                          {donation.donationType === 'non-monetary' && donation.status === 'pledged' && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => updateDonationStatus(donation._id, 'received')}
                                disabled={updatingStatus[donation._id]}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {updatingStatus[donation._id] ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-green-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Mark as Received
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => updateDonationStatus(donation._id, 'cancelled')}
                                disabled={updatingStatus[donation._id]}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {updatingStatus[donation._id] ? (
                                  'Updating...'
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500 ml-4">
                          {formatDate(donation.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            paginatedDonations.map((donation, index) => (
              <div key={donation._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                        {donation.status || 'Unknown'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        donation.donationType === 'monetary' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {donation.donationType === 'monetary' ? '💰 Monetary' : '📦 Non-Monetary'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {donation.campaignName || 'Unknown Campaign'}
                    </h3>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Donor:</span> {donation.donorDisplay || 'Unknown'}
                    </div>
                    {donation.donationType === 'monetary' ? (
                      <div className="text-lg font-bold text-green-600">
                        {formatAmount(donation.amount)}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">{getDeliveryMethodIcon(donation.deliveryMethod)}</span>
                          <span className="font-medium">Delivery:</span> {donation.deliveryMethod || 'Not specified'}
                        </div>
                        {donation.deadlineDate && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Deadline:</span> {formatDate(donation.deadlineDate)}
                          </div>
                        )}
                        {donation.notes && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {donation.notes}
                          </div>
                        )}
                      </div>
                    )}
                    {donation.message && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        <span className="font-medium">Message:</span> {donation.message}
                      </div>
                    )}
                    
                    {/* Status Update Buttons for Non-Monetary Donations */}
                    {donation.donationType === 'non-monetary' && donation.status === 'pledged' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => updateDonationStatus(donation._id, 'received')}
                          disabled={updatingStatus[donation._id]}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updatingStatus[donation._id] ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-green-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Mark as Received
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => updateDonationStatus(donation._id, 'cancelled')}
                          disabled={updatingStatus[donation._id]}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updatingStatus[donation._id] ? (
                            'Updating...'
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500 ml-4">
                    {formatDate(donation.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{totalItems === 0 ? 0 : startIdx + 1}</span> to <span className="font-medium">{endIdx}</span> of <span className="font-medium">{totalItems}</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1.5 text-sm rounded-md border ${page === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-sm rounded-md border ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1.5 text-sm rounded-md border ${page === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 