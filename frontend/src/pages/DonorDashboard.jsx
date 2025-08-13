import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchDonorHistory, checkCurrentUser } from '../api/donations';
import { fetchCampaignById } from '../api/campaigns';

const DonorDashboard = () => {
  const [showImpact, setShowImpact] = useState(true);
  const [donationHistory, setDonationHistory] = useState([]);
  const [campaigns, setCampaigns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donorStats, setDonorStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    monthlyGoal: 5000,
    monthlyProgress: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showNewDonationNotification, setShowNewDonationNotification] = useState(false);
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

      // Fetch campaign details for each donation
      const campaignPromises = historyData.monetary.map(async (donation) => {
        try {
          const campaign = await fetchCampaignById(donation.campaignID);
          return { donationId: donation._id, campaign };
        } catch (err) {
          console.warn(`Failed to fetch campaign ${donation.campaignID}:`, err);
          return { donationId: donation._id, campaign: null };
        }
      });

      const campaignResults = await Promise.all(campaignPromises);
      const campaignsMap = {};
      campaignResults.forEach(({ donationId, campaign }) => {
        if (campaign) {
          campaignsMap[donationId] = campaign;
        }
      });

      setCampaigns(campaignsMap);
      
      // Check if there are new donations (comparing with previous state)
      const previousCount = donationHistory.length;
      const newCount = historyData.monetary.length;
      
      if (newCount > previousCount && previousCount > 0) {
        setShowNewDonationNotification(true);
        // Auto-hide notification after 5 seconds
        setTimeout(() => setShowNewDonationNotification(false), 5000);
      }
      
      setDonationHistory(historyData.monetary);

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
        return 'yellow';
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
        return 'Processing';
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
              <a href="#" className="text-gray-600 hover:text-gray-900">My Donations</a>
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
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, Donor!</h1>
            <div className="bg-[#e7deb6] text-yellow-900 px-4 py-2 rounded-full font-medium flex items-center space-x-2">
              <span>{donorStats.totalDonations >= 10 ? 'Gold Donor' : donorStats.totalDonations >= 5 ? 'Silver Donor' : 'Bronze Donor'}</span>
            </div>
          </div>
        </section>

        {/* Recent Activity Summary */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
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
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">Rs. {donorStats.monthlyProgress.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {Math.round((donorStats.monthlyProgress / donorStats.monthlyGoal) * 100)}% of goal
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
              <Link to="/donation-history" className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1">
                <span>View All</span>
                <span className="text-lg">→</span>
              </Link>
            </div>
          </div>

          {donationHistory.length === 0 ? (
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
                            <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1">
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
        </section>



        {/* Call to Action Section */}
        <section className="bg-[#0091d9] rounded-lg p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Make a Bigger Impact?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto">
              Your donations have already changed lives. Discover more campaigns and continue your journey of making a difference in children's education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/donor/browseCampaigns"
                className="bg-white text-[#0091d9] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors border-2 border-white"
              >
                Donate Again
              </Link>
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
    </div>
  );
};

export default DonorDashboard;
