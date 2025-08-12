import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCampaigns as apiFetchCampaigns } from "../api/campaigns";
import { categories, categoryMap, getCategoryDisplayName } from "../config/categories";
import api from "../lib/api";

// 👇 use the existing logo image as fallback
const FALLBACK = "/logoskl.jpg";

export default function BrowseCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]); // Store all campaigns for client-side filtering
  const [schoolsData, setSchoolsData] = useState({}); // Store school data mapped by schoolID
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState([]); // Array to allow multiple selections
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [timeFilter, setTimeFilter] = useState([]); // Time-based filtering
  const [searchQuery, setSearchQuery] = useState(""); // Search functionality
  const [sortBy, setSortBy] = useState("Most Popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const categoryNames = categories.map(cat => cat.name);

  // Time filter options
  const timeOptions = ["Urgent (<7 days)", "This Month", "Long-term"];

  // Category icons mapping
  const categoryIcons = {
    "Books & Education": "📚",
    "School Meals": "🍽️",
    "Sanitation": "🚽",
    "Sports Equipment": "⚾",
    "Technology": "💻",
    "Infrastructure": "🏢"
  };

  // Fetch school data by schoolID
  const fetchSchoolData = async (schoolID) => {
    try {
      const response = await api.get(`/api/school-requests/school/${schoolID}`);

      if (response.status === 200) {
        const schoolData = response.data;
        return {
          schoolID: schoolData.schoolID,
          schoolName: schoolData.schoolName,
          location: schoolData.location,
          principalName: schoolData.principalName,
          email: schoolData.email,
          contactNumber: schoolData.contactNumber,
          status: schoolData.status
        };
      } else {
        return {
          schoolID: schoolID,
          schoolName: `School (${schoolID})`,
          location: "Location not available",
          principalName: "Unknown",
          email: "N/A",
          contactNumber: "N/A",
          status: "error"
        };
      }
    } catch (err) {
      if (err.response?.status === 404) {
        return {
          schoolID: schoolID,
          schoolName: `Unknown School (${schoolID})`,
          location: "Location not available",
          principalName: "Unknown",
          email: "N/A",
          contactNumber: "N/A",
          status: "unknown"
        };
      }
      return {
        schoolID: schoolID,
        schoolName: `School (${schoolID})`,
        location: "Location not available",
        principalName: "Unknown",
        email: "N/A",
        contactNumber: "N/A",
        status: "error"
      };
    }
  };

  // Load all campaigns and fetch school data
  const loadAllCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetchCampaigns();
      setAllCampaigns(data);
      setCampaigns(data);

      // Fetch school data for all unique schoolIDs
      const uniqueSchoolIDs = [...new Set(data.map(campaign => campaign.schoolID))];

      const schoolsDataMap = {};

      // Fetch school data for each unique schoolID
      const schoolDataPromises = uniqueSchoolIDs.map(async (schoolID) => {
        if (!schoolID) {
          return;
        }
        const schoolData = await fetchSchoolData(schoolID);
        schoolsDataMap[schoolID] = schoolData;
      });

      await Promise.all(schoolDataPromises);
      setSchoolsData(schoolsDataMap);
    } catch (err) {
      // Handle error silently or show user-friendly message
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all campaigns on mount
  useEffect(() => {
    loadAllCampaigns();
  }, [loadAllCampaigns]);

  // Apply filters to campaigns
  useEffect(() => {
    let filtered = [...allCampaigns];

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(campaign => {
        const campaignName = (campaign.campaignName || campaign.title || "").toLowerCase();
        const description = (campaign.description || "").toLowerCase();
        const schoolName = (campaign.schoolName || "").toLowerCase();

        return campaignName.includes(query) ||
          description.includes(query) ||
          schoolName.includes(query);
      });
    }

    // Filter by donation types (monetary/non-monetary)
    if (typeFilter.length > 0) {
      filtered = filtered.filter(campaign => {
        const campaignType = campaign.monetaryType;

        return typeFilter.some(filterType => {
          if (filterType === 'Monetary') return campaignType === 'Monetary';
          if (filterType === 'Non-Monetary') return campaignType === 'Non-Monetary';
          return false;
        });
      });
    }

    // Filter by categories
    if (categoryFilter.length > 0) {
      filtered = filtered.filter(campaign => {
        // Get the display category name from the categoryID
        const campaignCategory = categoryMap[campaign.categoryID];
        return categoryFilter.includes(campaignCategory);
      });
    }

    // Filter by time remaining
    if (timeFilter.length > 0) {
      filtered = filtered.filter(campaign => {
        const endDate = new Date(campaign.deadline);
        const now = new Date();
        const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        if (timeFilter.includes("Urgent (<7 days)")) {
          if (daysRemaining <= 7 && daysRemaining > 0) return true;
        }
        if (timeFilter.includes("This Month")) {
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          if (endDate <= monthEnd && daysRemaining > 0) return true;
        }
        if (timeFilter.includes("Long-term")) {
          if (daysRemaining > 30) return true;
        }

        return false;
      });
    }

    setCampaigns(filtered);
  }, [allCampaigns, typeFilter, categoryFilter, timeFilter, searchQuery]);

  const handleTypeChange = (value) => {
    setTypeFilter(prev => {
      if (prev.includes(value)) {
        // Remove the filter
        return prev.filter(type => type !== value);
      } else {
        // Add the filter
        return [...prev, value];
      }
    });
  };

  const handleCheckbox = (category) => {
    setCategoryFilter((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleTimeChange = (time) => {
    setTimeFilter(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const clearAllFilters = () => {
    setTypeFilter([]);
    setCategoryFilter([]);
    setTimeFilter([]);
    setSearchQuery("");
  };

  const hasActiveFilters = typeFilter.length > 0 || categoryFilter.length > 0 || timeFilter.length > 0 || searchQuery.trim() !== "";

  // Calculate progress percentage
  const calculateProgress = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    const endDate = new Date(deadline);
    const now = new Date();
    return Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  };

  // Handle newsletter subscription
  const handleSubscribe = (e) => {
    e.preventDefault();
    // Add newsletter subscription logic here
    alert("Thank you for subscribing to our newsletter!");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="/logo.svg"
                alt="School Fund Logo"
                className="w-10 h-10"
              />
              {/* <span className="text-xl font-bold text-gray-900">SCHOOL FUND</span> */}
            </div>

            {/* Navigation - Centered */}
            <nav className="flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
              <a href="#" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2">Browse Campaigns</a>
              {/* <a href="#" className="text-gray-600 hover:text-gray-900">My Donations</a> */}
              <a href="/donor-dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            </nav>

            {/* User Avatar and Logout */}
            <div className="relative">
              <button
                onClick={() => {
                  // Clear donor token and redirect to login
                  localStorage.removeItem('donorToken');
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

      {/* Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-center text-blue-800 font-medium">
            3,500+ donors contributed this month! Join them in making a difference.
          </p>
        </div>
      </div>



      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Filter Campaigns */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Filter Campaigns</h2>

              {/* Donation Type Section */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Donation Type</h3>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={typeFilter.includes('Monetary')}
                      onChange={() => handleTypeChange('Monetary')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-lg mr-2">💰</span>
                    <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors duration-200">Monetary</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={typeFilter.includes('Non-Monetary')}
                      onChange={() => handleTypeChange('Non-Monetary')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-lg mr-2">📦</span>
                    <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors duration-200">Non-Monetary</span>
                  </label>
                </div>
              </div>

              {/* Categories Section */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Categories</h3>
                <div className="space-y-3">
                  {categoryNames.map((cat) => (
                    <label key={cat} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={categoryFilter.includes(cat)}
                        onChange={() => handleCheckbox(cat)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-lg mr-2">{categoryIcons[cat] || "📋"}</span>
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors duration-200">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Remaining Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Time Remaining</h3>
                <div className="space-y-3">
                  {timeOptions.map((time) => (
                    <label key={time} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={timeFilter.includes(time)}
                        onChange={() => handleTimeChange(time)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-blue-600 transition-colors duration-200">{time}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Content - Active Campaigns */}
          <div className="flex-1">
            {/* Header with title and search */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Active Campaigns</h1>
              <div className="relative w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0091d9] focus:border-[#0091d9] text-sm placeholder-gray-500 transition-all duration-200"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading campaigns...</p>
                </div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {hasActiveFilters ? "No campaigns match your filters" : "No campaigns available"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results."
                    : "Check back later for new campaigns."
                  }
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Campaigns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {campaigns.map((c) => (
                    <div key={c._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                      <div className="relative">
                        <img
                          src={c.image || c.imageUrl || c.banner || FALLBACK}
                          alt={c.campaignName || c.title || "Campaign"}
                          onError={(e) => {
                            if (e.currentTarget.dataset.fallback !== "1") {
                              e.currentTarget.src = FALLBACK;
                              e.currentTarget.dataset.fallback = "1";
                            }
                          }}
                          className="w-full h-48 object-cover"
                        />
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        {/* Campaign Type Badge and Location */}
                        <div className="flex items-center justify-between mb-3">
                          {schoolsData[c.schoolID]?.location && (
                            <div className="flex items-center text-xs text-gray-500">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {schoolsData[c.schoolID].location}
                            </div>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${c.monetaryType === 'Non-Monetary'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                            }`}>
                            {c.monetaryType === 'Non-Monetary' ? '📦 Items' : '💰 Money'}
                          </span>
                        </div>

                        {/* Campaign Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {c.campaignName || c.title}
                        </h3>



                        {/* Campaign Progress - Different for Monetary vs Non-Monetary */}
                        {c.monetaryType === 'Non-Monetary' ? (
                          <div className="mb-4">
                            <div className="text-sm mb-2">
                              <div className="text-gray-700 font-medium mb-1">📦 Items needed</div>
                              <div className="text-gray-600 text-xs">Physical donations</div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((c.raised || 0) / (c.amount || c.goal || 100) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Accepting: Books, Supplies, Equipment, etc.
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">Rs. {c.raised || 8750} raised</span>
                              <span className="text-gray-600">of Rs. {c.amount || c.goal || 10000} goal</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#0091d9] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${calculateProgress(c.raised || 8750, c.amount || c.goal || 10000)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Time Remaining */}
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {getDaysRemaining(c.deadline)} days left
                        </div>

                        {/* Donate Button - Different text for Non-Monetary */}
                        <button
                          onClick={() => navigate(`/donor/donate/${c._id}`)}
                          className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 mt-auto ${c.monetaryType === 'Non-Monetary'
                            ? 'bg-[#0091d9] hover:bg-[#036ca1] text-white '
                            : 'bg-[#0091d9] hover:bg-[#036ca1] text-white '
                            }`}
                        >
                          {c.monetaryType === 'Non-Monetary' ? 'Donate Items' : 'Donate Now'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center space-x-2 mb-12">
                  <button className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="px-3 py-2 bg-[#0091d9] text-white rounded-md">1</button>
                  <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">2</button>
                  <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">3</button>
                  <span className="px-3 py-2 text-gray-500">...</span>
                  <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">8</button>
                  <button className="px-3 py-2 text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Your Impact Visualization Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Impact Visualization</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how your donations are making a real difference in children's education and well-being.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">📚</div>
              <div className="text-3xl font-bold text-blue-600 mb-2">15,230</div>
              <div className="text-gray-700">Books Provided to Students</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🏢</div>
              <div className="text-3xl font-bold text-blue-600 mb-2">347</div>
              <div className="text-gray-700">Schools Supported Nationwide</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🎓</div>
              <div className="text-3xl font-bold text-blue-600 mb-2">42,850</div>
              <div className="text-gray-700">Students benefited from donations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription Section */}
      <div className="bg-[#0091d9]/30 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated on School Campaigns</h2>
          <p className="text-lg text-gray-600 mb-8">
            Subscribe to our newsletter to receive updates on new campaigns and success stories.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 border border-[#0091d9] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#0091d9] text-white font-semibold rounded-lg hover:bg-[#0091d9] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Subscribe
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>


    </div>
  );
}
