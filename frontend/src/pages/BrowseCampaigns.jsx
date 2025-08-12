import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCampaigns as apiFetchCampaigns } from "../api/campaigns";
import { categories, categoryMap, getCategoryDisplayName } from "../config/categories";

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
      console.log(`Fetching school data for schoolID: ${schoolID}`);
      const encodedSchoolID = encodeURIComponent(schoolID);
      const response = await fetch(`https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/school-requests/school/${encodedSchoolID}`);

      if (response.ok) {
        const schoolData = await response.json();
        console.log(`Successfully fetched school data for ${schoolID}:`, schoolData);
        return schoolData;
      } else if (response.status === 404) {
        console.warn(`School not found in database for schoolID: ${schoolID}`);
        return {
          schoolID: schoolID,
          schoolName: `Unknown School (${schoolID})`,
          location: "Location not available",
          principalName: "Unknown",
          email: "N/A",
          contactNumber: "N/A",
          status: "unknown"
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`Failed to fetch school data for schoolID: ${schoolID}. Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
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
      console.error(`Error fetching school data for schoolID ${schoolID}:`, err);
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
      console.log("Fetched campaigns:", data); // Debug log
      setAllCampaigns(data);
      setCampaigns(data);

      // Fetch school data for all unique schoolIDs
      const uniqueSchoolIDs = [...new Set(data.map(campaign => campaign.schoolID))];
      console.log("Unique schoolIDs found in campaigns:", uniqueSchoolIDs);

      // Debug: Show campaign data with schoolIDs
      console.log("Campaign data with schoolIDs:", data.map(campaign => ({
        campaignName: campaign.campaignName,
        schoolID: campaign.schoolID,
        schoolIDType: typeof campaign.schoolID,
        schoolIDLength: campaign.schoolID ? campaign.schoolID.length : 0
      })));

      const schoolsDataMap = {};

      // Fetch school data for each unique schoolID
      const schoolDataPromises = uniqueSchoolIDs.map(async (schoolID) => {
        if (!schoolID) {
          console.warn("Campaign has no schoolID");
          return;
        }
        const schoolData = await fetchSchoolData(schoolID);
        schoolsDataMap[schoolID] = schoolData;
      });

      await Promise.all(schoolDataPromises);
      setSchoolsData(schoolsDataMap);
      console.log("Fetched schools data:", schoolsDataMap);

      // Debug: Show which schoolIDs are missing data
      const missingSchoolIDs = uniqueSchoolIDs.filter(schoolID => !schoolsDataMap[schoolID]);
      if (missingSchoolIDs.length > 0) {
        console.warn("SchoolIDs missing data:", missingSchoolIDs);
      }
    } catch (err) {
      console.error("Error fetching campaigns", err);
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

    console.log("Applying filters:", { typeFilter, categoryFilter, timeFilter, searchQuery });
    console.log("All campaigns before filtering:", allCampaigns);

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
      console.log("After search filtering:", filtered);
    }

    // Filter by donation types (monetary/non-monetary)
    if (typeFilter.length > 0) {
      filtered = filtered.filter(campaign => {
        const campaignType = campaign.monetaryType;
        console.log(`Campaign ${campaign.campaignName} type:`, campaignType);

        return typeFilter.some(filterType => {
          if (filterType === 'Monetary') return campaignType === 'Monetary';
          if (filterType === 'Non-Monetary') return campaignType === 'Non-Monetary';
          return false;
        });
      });
      console.log("After type filtering:", filtered);
    }

    // Filter by categories
    if (categoryFilter.length > 0) {
      filtered = filtered.filter(campaign => {
        // Get the display category name from the categoryID
        const campaignCategory = categoryMap[campaign.categoryID];
        console.log(`Campaign ${campaign.campaignName} category:`, campaign.categoryID, "->", campaignCategory);
        return categoryFilter.includes(campaignCategory);
      });
      console.log("After category filtering:", filtered);
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
      console.log("After time filtering:", filtered);
    }

    console.log("Final filtered campaigns:", filtered);
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">SCHOOL FUND</span>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-8">
              <a href="#" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2">Browse Campaigns</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">My Donations</a>
            </nav>
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

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by school name, campaign, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Filter Campaigns */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Filter Campaigns</h2>

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
            {/* Header with title and sort */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Active Campaigns</h1>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Most Popular</option>
                  <option>Newest</option>
                  <option>Ending Soon</option>
                  <option>Most Funded</option>
                </select>
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
                    <div key={c._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
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

                      <div className="p-6">
                        {/* Location */}
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {schoolsData[c.schoolID]?.schoolName || "School Name"}, {schoolsData[c.schoolID]?.location || "Location"}
                        </div>

                        {/* Campaign Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {c.campaignName || c.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {c.description}
                        </p>

                        {/* Funding Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Rs. {c.raised || 8750} raised</span>
                            <span className="text-gray-600">of Rs. {c.amount || c.goal || 10000} goal</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${calculateProgress(c.raised || 8750, c.amount || c.goal || 10000)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Time Remaining */}
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {getDaysRemaining(c.deadline)} days left
                        </div>

                        {/* Donate Button */}
                        <button
                          onClick={() => navigate(`/donor/donate/${c._id}`)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Donate Now
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
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-md">1</button>
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
      <div className="bg-white py-16">
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Subscribe
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Left Column */}
            <div className="md:col-span-1">
              <p className="text-gray-300 mb-6">
                Connecting donors with schools in need to create better educational opportunities for all students.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Browse Campaigns</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Start a Campaign</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">How it works</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Success Stories</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">FAQs</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Contact Support</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Donation Policy</a></li>
              </ul>
            </div>

            {/* Contact & Payment */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-gray-300">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  123 SisuDiriya, Wijerama Road Colombo
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  support@schoolfundraising.org
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  +94 112 869 844
                </div>
              </div>

              <h4 className="text-sm font-semibold mb-2">Secure Payment Methods</h4>
              <div className="flex space-x-2">
                <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-xs font-bold text-blue-600">VISA</div>
                <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-xs font-bold text-red-600">MC</div>
                <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-xs font-bold text-blue-500">PP</div>
                <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-xs font-bold text-gray-600">$</div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2025 School Fundraising Platform All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-300 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
