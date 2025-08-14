import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchDonorHistory, checkCurrentUser, fetchDonorDetails } from '../api/donations';
import { fetchCampaignById } from '../api/campaigns';

const DonorDashboard = () => {
  const [showImpact, setShowImpact] = useState(true);
  const [donationHistory, setDonationHistory] = useState([]);
  const [nonMonetaryHistory, setNonMonetaryHistory] = useState([]);
  const [campaigns, setCampaigns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('monetary'); // 'monetary' or 'nonMonetary'
  const [donorStats, setDonorStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    totalNonMonetary: 0,
    monthlyGoal: 5000,
    monthlyProgress: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showNewDonationNotification, setShowNewDonationNotification] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donorName, setDonorName] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  // Get current donor token to force re-render when user changes
  const currentToken = localStorage.getItem('donorToken');

  // Check if user is returning from payment success
  const isReturningFromPayment = location.search.includes('payment=success') ||
    location.search.includes('donation=completed');

  // Fetch donor data on component mount
  const fetchDonorData = async (showRefreshIndicator = false) => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('donorToken');
      if (!token) {
        console.error('No donor token found');
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      // Debug: Check current user
      try {
        const userInfo = await checkCurrentUser();
        console.log('Current user info:', userInfo);
      } catch (err) {
        console.warn('Failed to check current user:', err);
      }

      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const historyData = await fetchDonorHistory();
      console.log('Donation history fetched for token:', token.substring(0, 20) + '...', historyData);

      // Fetch campaign details for each monetary donation
      const campaignPromises = historyData.monetary.map(async (donation) => {
        try {
          const campaign = await fetchCampaignById(donation.campaignID);
          return { donationId: donation._id, campaign };
        } catch (err) {
          console.warn(`Failed to fetch campaign ${donation.campaignID}:`, err);
          return { donationId: donation._id, campaign: null };
        }
      });

      // Fetch campaign details for each non-monetary donation
      const nonMonetaryCampaignPromises = historyData.nonMonetary.map(async (donation) => {
        try {
          const campaign = await fetchCampaignById(donation.campaignID);
          return { donationId: donation._id, campaign };
        } catch (err) {
          console.warn(`Failed to fetch campaign ${donation.campaignID}:`, err);
          return { donationId: donation._id, campaign: null };
        }
      });

      const [campaignResults, nonMonetaryCampaignResults] = await Promise.all([
        Promise.all(campaignPromises),
        Promise.all(nonMonetaryCampaignPromises)
      ]);

      const campaignsMap = {};
      campaignResults.forEach(({ donationId, campaign }) => {
        if (campaign) {
          campaignsMap[donationId] = campaign;
        }
      });
      nonMonetaryCampaignResults.forEach(({ donationId, campaign }) => {
        if (campaign) {
          campaignsMap[donationId] = campaign;
        }
      });

      setCampaigns(campaignsMap);

      // Check if there are new donations (comparing with previous state)
      const previousMonetaryCount = donationHistory.length;
      const previousNonMonetaryCount = nonMonetaryHistory.length;
      const newMonetaryCount = historyData.monetary.length;
      const newNonMonetaryCount = historyData.nonMonetary.length;

      if ((newMonetaryCount > previousMonetaryCount || newNonMonetaryCount > previousNonMonetaryCount) &&
        (previousMonetaryCount > 0 || previousNonMonetaryCount > 0)) {
        setShowNewDonationNotification(true);
        // Auto-hide notification after 5 seconds
        setTimeout(() => setShowNewDonationNotification(false), 5000);
      }

      setDonationHistory(historyData.monetary);
      setNonMonetaryHistory(historyData.nonMonetary);

      // Calculate statistics
      const totalAmount = historyData.monetary.reduce((sum, donation) => sum + donation.amount, 0);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyAmount = historyData.monetary
        .filter(donation => {
          const donationDate = new Date(donation.createdAt);
          return donationDate.getMonth() === currentMonth && donationDate.getFullYear() === currentYear;
        })
        .reduce((sum, donation) => sum + donation.amount, 0);

      setDonorStats({
        totalDonations: historyData.monetary.length,
        totalAmount,
        totalNonMonetary: historyData.nonMonetary.length,
        monthlyGoal: 5000,
        monthlyProgress: monthlyAmount
      });

    } catch (err) {
      console.error('Failed to fetch donor data:', err);
      setError('Failed to load your donation data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, [currentToken]); // Re-fetch when token changes (user logs in/out)

  // Get donor name from localStorage with improved logic
  useEffect(() => {
    const getDonorName = () => {
      const donorData = localStorage.getItem('donorData');
      if (donorData) {
        try {
          const parsedData = JSON.parse(donorData);
          console.log('Donor data from localStorage:', parsedData);

          // Try different possible field names for the name
          let name = parsedData.name || parsedData.Name || parsedData.fullName;

          // Check if the name is actually an email address
          const isEmail = name && name.includes('@') && name.includes('.');

          // If name looks like an email or is the same as email field, use fallback
          if (isEmail || (name && parsedData.email && name.toLowerCase() === parsedData.email.toLowerCase())) {
            console.log('Email is being used as name, using fallback');
            name = 'Donor';
          }

          // If still no valid name, use fallback
          if (!name || name === parsedData.email) {
            name = 'Donor';
          }

          setDonorName(name);
        } catch (error) {
          console.error('Error parsing donor data:', error);
          setDonorName('Donor');
        }
      } else {
        setDonorName('Donor');
      }
    };

    getDonorName();
  }, []);

  // Auto-refresh when returning from payment success
  useEffect(() => {
    if (isReturningFromPayment) {
      // Add a small delay to ensure backend has processed the payment
      const timer = setTimeout(() => {
        fetchDonorData(true);
        // Clear the URL parameters after refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isReturningFromPayment]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchDonorData(true);
  };

  // Handle opening donation report modal
  const handleViewReport = (donation) => {
    const campaign = campaigns[donation._id];
    setSelectedDonation(donation);
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  // Handle opening non-monetary donation report modal
  const handleViewNonMonetaryReport = (donation) => {
    const campaign = campaigns[donation._id];
    setSelectedDonation(donation);
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDonation(null);
    setSelectedCampaign(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color based on donation status
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'green';
      case 'pending':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  // Calculate achievements based on real data
  const calculateAchievements = () => {
    const achievements = [];

    if (donorStats.totalDonations >= 1) {
      achievements.push({ id: 1, icon: '🏆', label: 'First Donation' });
    }

    if (donorStats.totalDonations >= 5) {
      achievements.push({ id: 2, icon: '🥇', label: '5 Campaigns' });
    }

    if (donorStats.totalAmount >= 10000) {
      achievements.push({ id: 3, icon: '🔥', label: 'High Impact Donor' });
    }

    if (donorStats.monthlyProgress >= donorStats.monthlyGoal) {
      achievements.push({ id: 4, icon: '⭐', label: 'Goal Achiever' });
    }

    if (donorStats.totalDonations >= 10) {
      achievements.push({ id: 5, icon: '👥', label: 'Dedicated Supporter' });
    }

    // Add default achievement if none earned
    if (achievements.length === 0) {
      achievements.push({ id: 1, icon: '🌟', label: 'Getting Started' });
    }

    return achievements;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const achievements = calculateAchievements();
  const monthlyProgressPercentage = Math.min((donorStats.monthlyProgress / donorStats.monthlyGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="School Fund Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold text-gray-900">School Fund</span>
            </div>
            <nav className="flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
              <a href="donor/browseCampaigns" className="text-gray-600 hover:text-gray-900">Browse Campaigns</a>
              <a href="/donor-dashboard" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2">My Dashboard</a>
            </nav>
            <div className="relative">
              <button
                onClick={() => {
                  // Clear all authentication tokens and data
                  localStorage.removeItem('donorToken');
                  localStorage.removeItem('donorData');
                  localStorage.removeItem('token');
                  localStorage.removeItem('schoolToken');
                  localStorage.removeItem('principalToken');
                  localStorage.removeItem('schoolData');
                  localStorage.removeItem('principalData');
                  localStorage.removeItem('schoolRequestEmail');
                  // Clear any cached data
                  localStorage.removeItem('campaigns');
                  localStorage.removeItem('stats');
                  localStorage.removeItem('topDonors');
                  localStorage.removeItem('expenses');
                  // Redirect to home page
                  navigate('/');
                }}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                <div className="w-10 h-10 bg-[#0091d9] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {donorName}!</h1>
            <div className="bg-[#e7deb6] text-yellow-900 px-4 py-2 rounded-full font-medium flex items-center space-x-2">
              <span>{donorStats.totalDonations >= 10 ? 'Gold Donor' : donorStats.totalDonations >= 5 ? 'Silver Donor' : 'Bronze Donor'}</span>
            </div>
          </div>
        </section>

        {/* Recent Activity Summary */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monetary Donations</p>
                  <p className="text-2xl font-bold text-gray-900">{donorStats.totalDonations}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Non-Monetary Donations</p>
                  <p className="text-2xl font-bold text-gray-900">{donorStats.totalNonMonetary}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">Rs. {donorStats.totalAmount.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Impact</p>
                  <p className="text-2xl font-bold text-gray-900">{donorStats.totalDonations + donorStats.totalNonMonetary}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Message for New Donations */}
        {isReturningFromPayment && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">Donation Successful!</h3>
                <p className="text-sm text-green-700">Your donation has been processed successfully. Refreshing your dashboard...</p>
              </div>
            </div>
          </div>
        )}

        {/* New Donation Notification */}
        {showNewDonationNotification && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">New Donation Added!</h3>
                  <p className="text-sm text-blue-700">Your latest donation has been added to your history.</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewDonationNotification(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Donation History Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">Donation History</h2>
              {refreshing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Refreshing...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('monetary')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'monetary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Monetary Donations ({donorStats.totalDonations})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('nonMonetary')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'nonMonetary'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>Non-Monetary Donations ({donorStats.totalNonMonetary})</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Empty State */}
          {donationHistory.length === 0 && nonMonetaryHistory.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No donations yet</h3>
              <p className="text-gray-600 mb-6">Start making a difference by donating to a campaign!</p>
              <Link
                to="/donor/browseCampaigns"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Campaigns
              </Link>
            </div>
          ) : (
            <>
              {/* Monetary Donations Tab */}
              {activeTab === 'monetary' && (
                <>
                  {donationHistory.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                      <div className="text-6xl mb-4">💰</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No monetary donations yet</h3>
                      <p className="text-gray-600 mb-6">Make your first monetary donation to support a campaign!</p>
                      <Link
                        to="/donor/browseCampaigns"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Browse Campaigns
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School/Campaign</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Report</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {donationHistory.map((donation, index) => {
                              const campaign = campaigns[donation._id];
                              const statusColor = getStatusColor(donation.status);
                              const statusText = getStatusText(donation.status);
                              const isNewDonation = index === 0 && isReturningFromPayment;

                              return (
                                <tr key={donation._id} className={`hover:bg-gray-50 ${isNewDonation ? 'bg-green-50 border-l-4 border-green-400' : ''}`}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center space-x-2">
                                      <span>{formatDate(donation.createdAt)}</span>
                                      {isNewDonation && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          New
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {campaign ? campaign.campaignName : 'Campaign not found'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                    Rs. {donation.amount.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor === 'green'
                                      ? 'bg-green-100 text-green-800'
                                      : statusColor === 'yellow'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : statusColor === 'red'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                      {statusText}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                      onClick={() => handleViewReport(donation)}
                                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                                    >
                                      <span>📄</span>
                                      <span>View Report</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Non-Monetary Donations Tab */}
              {activeTab === 'nonMonetary' && (
                <>
                  {nonMonetaryHistory.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No non-monetary donations yet</h3>
                      <p className="text-gray-600 mb-6">Donate items like books, uniforms, or other supplies to support students!</p>
                      <Link
                        to="/donor/browseCampaigns"
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Browse Campaigns
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School/Campaign</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Method</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {nonMonetaryHistory.map((donation, index) => {
                              const campaign = campaigns[donation._id];
                              const isNewDonation = index === 0 && isReturningFromPayment;

                              return (
                                <tr key={donation._id} className={`hover:bg-gray-50 ${isNewDonation ? 'bg-green-50 border-l-4 border-green-400' : ''}`}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center space-x-2">
                                      <span>{formatDate(donation.createdAt)}</span>
                                      {isNewDonation && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          New
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {campaign ? campaign.campaignName : 'Campaign not found'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className="capitalize">{donation.deliveryMethod}</span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${donation.status === 'pledged' ? 'bg-yellow-100 text-yellow-800' :
                                      donation.status === 'received' ? 'bg-green-100 text-green-800' :
                                        donation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                      }`}>
                                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {donation.deadlineDate ? formatDate(donation.deadlineDate) : 'No deadline'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                      onClick={() => handleViewNonMonetaryReport(donation)}
                                      className="text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-1"
                                    >
                                      <span>📋</span>
                                      <span>View Details</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>



        {/* Call to Action Section */}
        <section className="bg-[#0091d9]  rounded-lg p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Make a Bigger Impact?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto">
              Your donations have already changed lives. Discover more campaigns and continue your journey of making a difference in children's education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">

              <Link
                to="/donor/browseCampaigns"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-[#0091d9] transition-colors"
              >
                Browse More Campaigns
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Donation Report Modal */}
      {showModal && selectedDonation && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedDonation.amount ? 'Monetary Donation Report' : 'Non-Monetary Donation Details'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Donation Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {selectedDonation.amount ? 'Donation Information' : 'Item Information'}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Donation ID:</span>
                        <span className="font-medium text-gray-900">{selectedDonation._id}</span>
                      </div>
                      {selectedDonation.amount ? (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium text-gray-900">Rs. {selectedDonation.amount.toLocaleString()}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Method:</span>
                          <span className="font-medium text-gray-900 capitalize">{selectedDonation.deliveryMethod}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-900">{formatDate(selectedDonation.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedDonation.amount
                          ? (getStatusColor(selectedDonation.status) === 'green'
                            ? 'bg-green-100 text-green-800'
                            : getStatusColor(selectedDonation.status) === 'red'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800')
                          : (selectedDonation.status === 'pledged' ? 'bg-yellow-100 text-yellow-800' :
                            selectedDonation.status === 'received' ? 'bg-green-100 text-green-800' :
                              selectedDonation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800')
                          }`}>
                          {selectedDonation.amount
                            ? getStatusText(selectedDonation.status)
                            : selectedDonation.status.charAt(0).toUpperCase() + selectedDonation.status.slice(1)
                          }
                        </span>
                      </div>
                      {selectedDonation.amount && selectedDonation.paymentMethod && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium text-gray-900">{selectedDonation.paymentMethod}</span>
                        </div>
                      )}
                      {!selectedDonation.amount && selectedDonation.deadlineDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deadline:</span>
                          <span className="font-medium text-gray-900">{formatDate(selectedDonation.deadlineDate)}</span>
                        </div>
                      )}
                      {!selectedDonation.amount && selectedDonation.courierRef && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Courier Reference:</span>
                          <span className="font-medium text-gray-900">{selectedDonation.courierRef}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Impact Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Impact</h3>
                    <div className={`rounded-lg p-4 space-y-3 ${selectedDonation.amount ? 'bg-blue-50' : 'bg-purple-50'
                      }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedDonation.amount ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                          <svg className={`w-5 h-5 ${selectedDonation.amount ? 'text-blue-600' : 'text-purple-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className={`font-medium ${selectedDonation.amount ? 'text-blue-900' : 'text-purple-900'
                            }`}>Direct Impact</p>
                          <p className={`text-sm ${selectedDonation.amount ? 'text-blue-700' : 'text-purple-700'
                            }`}>
                            {selectedDonation.amount
                              ? 'Your donation directly supports this campaign'
                              : 'Your item donation directly benefits students'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-green-900">Transparency</p>
                          <p className="text-sm text-green-700">
                            {selectedDonation.amount
                              ? '100% of your donation goes to the campaign'
                              : 'Your donation is tracked and verified'
                            }
                          </p>
                        </div>
                      </div>
                      {!selectedDonation.amount && selectedDonation.notes && (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-yellow-900">Notes</p>
                            <p className="text-sm text-yellow-700">{selectedDonation.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Campaign Details */}
                <div className="space-y-6">
                  {/* Item Image for Non-Monetary Donations */}
                  {!selectedDonation.amount && selectedDonation.imagePath && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Image</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <img
                          src={`/uploads/${selectedDonation.imagePath}`}
                          alt="Donated item"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className=" w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <p className="text-gray-500">Image not available</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Information</h3>
                    {selectedCampaign ? (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        {(() => {
                          // Normalize campaign fields across different sources
                          const targetAmount = selectedCampaign.amount || selectedCampaign.targetAmount || selectedCampaign.goal || 0;
                          const raisedAmount = (selectedCampaign.raised ?? selectedCampaign.raisedAmount ?? 0);
                          // Attach normalized fields for reuse below via a shallow copy
                          selectedCampaign.targetAmount = targetAmount;
                          selectedCampaign.raisedAmount = raisedAmount;
                          return null;
                        })()}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">{selectedCampaign.campaignName}</h4>
                          <p className="text-sm text-gray-600">{selectedCampaign.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500">Target Amount</span>
                            <p className="font-medium text-gray-900">Rs. {Number(selectedCampaign.targetAmount || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Raised Amount</span>
                            <p className="font-medium text-gray-900">Rs. {Number(selectedCampaign.raisedAmount || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Category</span>
                            <p className="font-medium text-gray-900">{selectedCampaign.category || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Status</span>
                            <p className="font-medium text-gray-900">{selectedCampaign.status || 'Active'}</p>
                          </div>
                        </div>

                        {selectedCampaign.schoolName && (
                          <div>
                            <span className="text-xs text-gray-500">School</span>
                            <p className="font-medium text-gray-900">{selectedCampaign.schoolName}</p>
                          </div>
                        )}

                        {selectedCampaign.location && (
                          <div>
                            <span className="text-xs text-gray-500">Location</span>
                            <p className="font-medium text-gray-900">{selectedCampaign.location}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-500">Campaign information not available</p>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {selectedCampaign && (selectedCampaign.targetAmount || selectedCampaign.amount || selectedCampaign.goal) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Progress</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-600">
                            {(() => {
                              const raised = Number(selectedCampaign.raisedAmount || selectedCampaign.raised || 0);
                              const target = Number(selectedCampaign.targetAmount || selectedCampaign.amount || selectedCampaign.goal || 0);
                              if (!target || target <= 0) return 0;
                              return Math.round((raised / target) * 100);
                            })()}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(() => {
                                const raised = Number(selectedCampaign.raisedAmount || selectedCampaign.raised || 0);
                                const target = Number(selectedCampaign.targetAmount || selectedCampaign.amount || selectedCampaign.goal || 0);
                                if (!target || target <= 0) return 0;
                                return Math.min((raised / target) * 100, 100);
                              })()}%`
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Rs. {Number((selectedCampaign.raisedAmount || selectedCampaign.raised || 0)).toLocaleString()}</span>
                          <span>Rs. {Number((selectedCampaign.targetAmount || selectedCampaign.amount || selectedCampaign.goal || 0)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleCloseModal();
                  navigate('/donor/browseCampaigns');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse More Campaigns
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
