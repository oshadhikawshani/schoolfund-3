import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDonorHistory } from '../api/donations';
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

  // Fetch donor data on component mount
  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        setLoading(true);
        const historyData = await fetchDonorHistory();

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
      }
    };

    fetchDonorData();
  }, []);

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
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
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
            <nav className="flex space-x-6">
              <Link to="/donor/browseCampaigns" className="text-gray-900 hover:text-gray-600 transition-colors">Browse Campaigns</Link>
              <Link to="/my-donations" className="text-blue-600 font-medium">My Donations</Link>
              <Link to="/dashboard" className="text-gray-900 hover:text-gray-600 transition-colors">Dashboard</Link>
              <Link to="/logout" className="text-gray-900 hover:text-gray-600 transition-colors">Logout</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, Donor!</h1>
            <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-medium flex items-center space-x-2">
              <span>{donorStats.totalDonations >= 10 ? 'Gold Donor' : donorStats.totalDonations >= 5 ? 'Silver Donor' : 'Bronze Donor'}</span>
              <span className="text-yellow-600">⭐⭐</span>
            </div>
          </div>

        </section>

        {/* Donation History Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Donation History</h2>
            <Link to="/donation-history" className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1">
              <span>View All</span>
              <span className="text-lg">→</span>
            </Link>
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
                    {donationHistory.map((donation) => {
                      const campaign = campaigns[donation._id];
                      const statusColor = getStatusColor(donation.status);
                      const statusText = getStatusText(donation.status);

                      return (
                        <tr key={donation._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(donation.createdAt)}
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
        <section className="bg-blue-600 rounded-lg p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Make a Bigger Impact?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto">
              Your donations have already changed lives. Discover more campaigns and continue your journey of making a difference in children's education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/donor/browseCampaigns"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors border-2 border-white"
              >
                Donate Again
              </Link>
              <Link
                to="/donor/browseCampaigns"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
