import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchDonorHistory, checkCurrentUser, fetchDonorDetails, fetchMyDonorStats, fetchTopDonors } from '../api/donations';
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
  const [badge, setBadge] = useState('None');
  const [topDonors, setTopDonors] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donorName, setDonorName] = useState('');
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Monthly report state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [downloadingReport, setDownloadingReport] = useState(false);

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

      // Fetch stats and top donors in parallel with history
      const [historyData, myStats, top] = await Promise.all([
        fetchDonorHistory(showRefreshIndicator), // Force refresh when explicitly requested
        fetchMyDonorStats().catch(() => null),
        fetchTopDonors().catch(() => ({ top: [] }))
      ]);
      console.log('Donation history fetched for token:', token.substring(0, 20) + '...', historyData);

      // Campaign data is now included in the history response for most items.
      // For any missing campaigns, fetch them in parallel and then set state once
      const campaignsMap = {};
      const missingPairs = [];
      const missingIdsSet = new Set();

      // Map monetary donations with their included campaign data
      historyData.monetary.forEach((donation) => {
        if (donation.campaign) {
          campaignsMap[donation._id] = donation.campaign;
        } else if (donation.campaignID) {
          missingPairs.push({ donationId: donation._id, campaignID: donation.campaignID });
          missingIdsSet.add(String(donation.campaignID));
        }
      });

      // Map non-monetary donations with their included campaign data
      historyData.nonMonetary.forEach((donation) => {
        if (donation.campaign) {
          campaignsMap[donation._id] = donation.campaign;
        } else if (donation.campaignID) {
          missingPairs.push({ donationId: donation._id, campaignID: donation.campaignID });
          missingIdsSet.add(String(donation.campaignID));
        }
      });

      if (missingIdsSet.size > 0) {
        const missingIds = Array.from(missingIdsSet);
        const fetchedResults = await Promise.all(
          missingIds.map(async (id) => {
            try {
              const campaign = await fetchCampaignById(id);
              return [String(id), campaign];
            } catch (err) {
              console.warn('Failed to fetch campaign by id', id, err);
              return [String(id), null];
            }
          })
        );
        const campaignsById = Object.fromEntries(fetchedResults);

        // Attach fetched campaigns back to donations
        missingPairs.forEach(({ donationId, campaignID }) => {
          const campaign = campaignsById[String(campaignID)];
          if (campaign) {
            campaignsMap[donationId] = campaign;
          }
        });
      }

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

      if (myStats) {
        setBadge(myStats.badge || 'None');
      }
      setTopDonors(top.top || []);

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

  // Prefer backend profile name over localStorage fallback
  useEffect(() => {
    (async () => {
      try {
        const profile = await fetchDonorDetails();
        if (profile?.donor?.name) {
          setDonorName(profile.donor.name);
          return;
        }
      } catch (err) {
        // fall back to localStorage
      }
      // Fallback to localStorage if API not available
      const donorData = localStorage.getItem('donorData');
      if (donorData) {
        try {
          const parsedData = JSON.parse(donorData);
          let name = parsedData.name || parsedData.Name || parsedData.fullName;
          const isEmail = name && name.includes('@') && name.includes('.');
          if (isEmail || (name && parsedData.email && name.toLowerCase() === parsedData.email.toLowerCase())) {
            name = 'Donor';
          }
          if (!name || name === parsedData.email) name = 'Donor';
          setDonorName(name);
        } catch {
          setDonorName('Donor');
        }
      } else {
        setDonorName('Donor');
      }
    })();
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

  // Migration function (temporary)
  const runMigration = async () => {
    try {
      const token = localStorage.getItem('donorToken');
      // Use the correct API base URL for local development
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiBaseUrl}/api/donations/migrate/campaign-ids`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Migration result:', result);
      alert(`Migration completed! Migrated: ${result.migratedCount}, Errors: ${result.errorCount}`);
      // Refresh data after migration
      fetchDonorData(true);
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed: ' + error.message);
    }
  };

  // Debug function to check current donation data
  const debugLatestDonation = () => {
    console.log('=== DONATION DEBUG INFO ===');
    console.log('Donation History:', donationHistory);
    console.log('Non-Monetary History:', nonMonetaryHistory);
    console.log('Campaigns Map:', campaigns);
    
    if (donationHistory.length > 0) {
      const latestDonation = donationHistory[0];
      console.log('Latest Monetary Donation:', latestDonation);
      console.log('Latest Campaign Data:', campaigns[latestDonation._id]);
      
      const debugInfo = `
Latest Donation Debug:
- Donation ID: ${latestDonation._id}
- Campaign ID: ${latestDonation.campaignID}
- Campaign ID Type: ${typeof latestDonation.campaignID}
- Campaign Found: ${campaigns[latestDonation._id] ? 'Yes' : 'No'}
- Campaign Name: ${campaigns[latestDonation._id]?.campaignName || 'N/A'}
      `.trim();
      
      alert(debugInfo);
    } else {
      alert('No monetary donations found');
    }
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

  // Handle monthly report download
  const handleDownloadMonthlyReport = async (format = 'pdf') => {
    try {
      setDownloadingReport(true);

      const token = localStorage.getItem('donorToken');
      if (!token) {
        alert('Please log in to download reports');
        return;
      }

      // Resolve API base URL robustly
      const getApiBaseUrl = () => {
        const envUrl = import.meta.env.VITE_API_URL;
        if (envUrl) {
          if (envUrl.startsWith('http')) return envUrl.replace(/\/$/, '');
          if (envUrl.startsWith(':')) {
            const { protocol, hostname } = window.location;
            return `${protocol}//${hostname}${envUrl}`.replace(/\/$/, '');
          }
          if (envUrl.startsWith('/')) {
            return `${window.location.origin}${envUrl}`.replace(/\/$/, '');
          }
          return envUrl.replace(/\/$/, '');
        }
        return 'http://localhost:4000';
      };

      const baseUrl = getApiBaseUrl();

      const response = await fetch(
        `${baseUrl}/api/donors/me/donations/monthly?month=${selectedMonth}&year=${selectedYear}&format=${format}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        let message = 'Failed to download report';
        try {
          const errorData = await response.json();
          if (errorData?.error) message = errorData.error;
        } catch {}
        throw new Error(message);
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format
      const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long' });
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      link.download = `donation-report-${monthName}-${selectedYear}.${extension}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      alert(`Failed to download report: ${error.message}`);
    } finally {
      setDownloadingReport(false);
    }
  };

  // Generate month options for the past 12 months
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthValue = date.getMonth() + 1;
      const yearValue = date.getFullYear();
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      options.push({
        value: `${monthValue}-${yearValue}`,
        label: monthName,
        month: monthValue,
        year: yearValue
      });
    }
    
    return options;
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

  // Compute badge from frontend total to guarantee at least Bronze at 20,000
  const computeBadgeFromAmount = (amount) => {
    if (amount >= 80000) return 'Gold';
    if (amount >= 40000) return 'Silver';
    if (amount >= 20000) return 'Bronze';
    return 'None';
  };

  const badgeRank = (b) => (b === 'Gold' ? 3 : b === 'Silver' ? 2 : b === 'Bronze' ? 1 : 0);
  const computedBadge = computeBadgeFromAmount(donorStats.totalAmount || 0);
  const finalBadge = badgeRank(computedBadge) > badgeRank(badge) ? computedBadge : badge;

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
              <Link to="/donor/browseCampaigns" className="text-gray-600 hover:text-gray-900">Browse Campaigns</Link>
              <Link to="/donor-dashboard" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2">My Dashboard</Link>
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
             <div className={`px-4 py-2 rounded-full font-medium flex items-center space-x-2 ${
               finalBadge === 'Gold' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900' :
               finalBadge === 'Silver' ? 'bg-gradient-to-r from-gray-300 to-slate-400 text-gray-800' :
               finalBadge === 'Bronze' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-amber-900' :
               'bg-[#e7deb6] text-yellow-900'
             }`}>
               <span>{finalBadge !== 'None' ? `${finalBadge} Donor` : 'Donor'}</span>
             </div>
          </div>
        </section>

        

        {/* Recent Activity Summary  asd*/}
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

        {/* Donor Badges Section */}
        <section className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Unlock Your Donor Badges</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Earn badges by contributing more and unlock exclusive rewards to amplify your impact on schools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bronze Badge Card */}
            <div className={`relative bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${finalBadge === 'Bronze' ? 'ring-4 ring-amber-300 ring-opacity-50' : ''}`}>
              {finalBadge === 'Bronze' && (
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Current Level
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-4xl animate-pulse">
                    🥉
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full opacity-0 hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                  Bronze Donor
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-amber-800 mb-2">How to Unlock</h4>
                  <p className="text-sm text-amber-700">
                    Donate over Rs. 20,000 in monetary contributions or more than 100 non-monetary items/pledges.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-800 mb-3">Rewards</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-amber-700">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Priority support for campaigns
                    </li>
                    <li className="flex items-center text-sm text-amber-700">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Monthly impact reports
                    </li>
                    <li className="flex items-center text-sm text-amber-700">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Bronze donor certificate
                    </li>
                    <li className="flex items-center text-sm text-amber-700">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Early access to new campaigns
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                {finalBadge === 'Bronze' ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Achieved!</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-sm text-amber-700 mb-2">
                      <span>Progress to Bronze</span>
                      <span>{Math.min(Math.round((donorStats.totalAmount / 20000) * 100), 100)}%</span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((donorStats.totalAmount / 20000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Silver Badge Card */}
            <div className={`relative bg-gradient-to-br from-gray-100 via-gray-50 to-slate-100 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${finalBadge === 'Silver' ? 'ring-4 ring-gray-300 ring-opacity-50' : ''}`}>
              {finalBadge === 'Silver' && (
                <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Current Level
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-slate-400 rounded-full flex items-center justify-center text-4xl animate-pulse">
                    🥈
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-slate-300 rounded-full opacity-0 hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
                  Silver Donor
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">How to Unlock</h4>
                  <p className="text-sm text-gray-600">
                    Donate over Rs. 40,000 in monetary contributions or more than 200 non-monetary items/pledges.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Rewards</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      All Bronze rewards
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Direct school communication
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Silver donor certificate
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Quarterly impact meetings
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                {finalBadge === 'Silver' ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Achieved!</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress to Silver</span>
                      <span>{Math.min(Math.round((donorStats.totalAmount / 40000) * 100), 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-gray-400 to-slate-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((donorStats.totalAmount / 40000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gold Badge Card */}
            <div className={`relative bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-100 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${finalBadge === 'Gold' ? 'ring-4 ring-yellow-300 ring-opacity-50' : ''}`}>
              {finalBadge === 'Gold' && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Current Level
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-4xl animate-pulse">
                    🥇
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full opacity-0 hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  Gold Donor
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">How to Unlock</h4>
                  <p className="text-sm text-yellow-700">
                    Donate over Rs. 80,000 in monetary contributions or more than 400 non-monetary items/pledges.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-yellow-800 mb-3">Rewards</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-yellow-700">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      All Silver rewards
                    </li>
                    <li className="flex items-center text-sm text-yellow-700">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      VIP school visits
                    </li>
                    <li className="flex items-center text-sm text-yellow-700">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Gold donor certificate
                    </li>
                    <li className="flex items-center text-sm text-yellow-700">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Annual recognition ceremony
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                {finalBadge === 'Gold' ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Achieved!</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-sm text-yellow-700 mb-2">
                      <span>Progress to Gold</span>
                      <span>{Math.min(Math.round((donorStats.totalAmount / 80000) * 100), 100)}%</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((donorStats.totalAmount / 80000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Learn More Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => setShowBadgeModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Learn More About Badge Rules</span>
            </button>
          </div>
        </section>

        {/* Top Donors Table */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Top Donors</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topDonors.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500 text-sm">No donors yet</td>
                    </tr>
                  ) : (
                    topDonors.map((d, idx) => (
                      <tr key={d.DonorID}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{idx + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.Username?.split('@')[0] || d.DonorID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs. {(d.totalDonations || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.badge || 'None'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Monthly Report Download Section */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Download Monthly Report</h2>
              <div className="flex items-center space-x-2 text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium">Export your donation history</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Month/Year Selector */}
              <div>
                <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Month & Year
                </label>
                <select
                  id="month-select"
                  value={`${selectedMonth}-${selectedYear}`}
                  onChange={(e) => {
                    const [month, year] = e.target.value.split('-');
                    setSelectedMonth(parseInt(month));
                    setSelectedYear(parseInt(year));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {generateMonthOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Download Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDownloadMonthlyReport('pdf')}
                  disabled={downloadingReport}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                >
                  {downloadingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>PDF</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleDownloadMonthlyReport('excel')}
                  disabled={downloadingReport}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                >
                  {downloadingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Excel</span>
                    </>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="text-sm text-gray-600">
                <p className="mb-1">📊 Includes all donations for the selected month</p>
                <p>📋 Available in PDF and Excel formats</p>
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
            {/* Debug buttons - remove after fixing */}
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
                              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
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
                                  {/* <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${donation.status === 'pledged' ? 'bg-yellow-100 text-yellow-800' :
                                      donation.status === 'received' ? 'bg-green-100 text-green-800' :
                                        donation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                      }`}>
                                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                    </span>
                                  </td> */}
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
                          src={`${import.meta.env.VITE_API_URL || 'https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev'}/uploads/${selectedDonation.imagePath}`}
                          alt="Donated item"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully');
                          }}
                        />
                        <div
                          className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center"
                          style={{ display: 'none' }}
                        >
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
                            <span className="text-xs text-gray-500">Target Items:</span>
                            <p className="font-medium text-gray-900"> {Number(selectedCampaign.targetAmount || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Raised Items:</span>
                            <p className="font-medium text-gray-900"> {Number(selectedCampaign.raisedAmount || 0).toLocaleString()}</p>
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
                          <span>{selectedDonation.amount ? 'Rs. ' : ''}{Number((selectedCampaign.raisedAmount || selectedCampaign.raised || 0)).toLocaleString()}</span>
                          <span>{selectedDonation.amount ? 'Rs. ' : ''}{Number((selectedCampaign.targetAmount || selectedCampaign.amount || selectedCampaign.goal || 0)).toLocaleString()}</span>
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

      {/* Badge Rules Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Donor Badge System Rules</h2>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-8">
                {/* Introduction */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🏆</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">How Our Badge System Works</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Our donor badge system recognizes and rewards your generous contributions to education. 
                    Each badge level unlocks exclusive benefits and recognition opportunities.
                  </p>
                </div>

                {/* Badge Levels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bronze Rules */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
                        🥉
                      </div>
                      <h4 className="text-lg font-bold text-amber-800">Bronze Donor</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-semibold text-amber-700 mb-1">Requirements:</h5>
                        <ul className="text-sm text-amber-600 space-y-1">
                          <li>• Rs. 20,000+ in monetary donations</li>
                          <li>• OR 100+ non-monetary items/pledges</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-amber-700 mb-1">Benefits:</h5>
                        <ul className="text-sm text-amber-600 space-y-1">
                          <li>• Priority campaign support</li>
                          <li>• Monthly impact reports</li>
                          <li>• Digital certificate</li>
                          <li>• Early campaign access</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Silver Rules */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-6 border border-gray-200">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-300 to-slate-400 rounded-full flex items-center justify-center text-2xl">
                        🥈
                      </div>
                      <h4 className="text-lg font-bold text-gray-700">Silver Donor</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-semibold text-gray-600 mb-1">Requirements:</h5>
                        <ul className="text-sm text-gray-500 space-y-1">
                          <li>• Rs. 40,000+ in monetary donations</li>
                          <li>• OR 200+ non-monetary items/pledges</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-600 mb-1">Benefits:</h5>
                        <ul className="text-sm text-gray-500 space-y-1">
                          <li>• All Bronze benefits</li>
                          <li>• Direct school communication</li>
                          <li>• Premium certificate</li>
                          <li>• Quarterly impact meetings</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Gold Rules */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-6 border border-yellow-200">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-2xl">
                        🥇
                      </div>
                      <h4 className="text-lg font-bold text-yellow-800">Gold Donor</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-semibold text-yellow-700 mb-1">Requirements:</h5>
                        <ul className="text-sm text-yellow-600 space-y-1">
                          <li>• Rs. 80,000+ in monetary donations</li>
                          <li>• OR 400+ non-monetary items/pledges</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-yellow-700 mb-1">Benefits:</h5>
                        <ul className="text-sm text-yellow-600 space-y-1">
                          <li>• All Silver benefits</li>
                          <li>• VIP school visits</li>
                          <li>• Gold certificate</li>
                          <li>• Annual recognition ceremony</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Important Information
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Badge levels are calculated based on your total lifetime contributions</li>
                    <li>• Both monetary and non-monetary donations count toward badge progression</li>
                    <li>• Badge status is updated in real-time as you make new donations</li>
                    <li>• All benefits are cumulative - higher levels include all lower level benefits</li>
                    <li>• Certificates are delivered digitally and can be printed for your records</li>
                    <li>• Special events and recognition ceremonies are held annually</li>
                  </ul>
                </div>

                {/* Close Button */}
                <div className="text-center">
                  <button 
                    onClick={() => setShowBadgeModal(false)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
