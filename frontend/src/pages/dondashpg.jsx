import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoskl from "../images/logoskl.jpg";
import BackButton from "../components/BackButton";
import { fetchCampaigns } from "../api/campaigns";
import { categories } from "../config/categories";

const categoryNames = categories.map(cat => cat.name);

const times = ["Urgent (<7 days)", "This Month", "Long-term"];

const donationTypes = [
  "Monetary Donations",
  "Non-Monetary Items"
];

export default function DonorCampaignDashboard() {
  const [page, setPage] = useState(1);
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [selectedDonationTypes, setSelectedDonationTypes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCampaigns();
        console.log("Campaigns data:", data); // Debug: Log campaign data structure
        setCampaigns(data);
        setFilteredCampaigns(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter campaigns based on selected filters
  useEffect(() => {
    let filtered = [...campaigns];

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(campaign => {
        const campaignCategory = campaign.category || campaign.campaignType || "Other";
        return selectedCategories.includes(campaignCategory);
      });
    }

    // Filter by donation types
    if (selectedDonationTypes.length > 0) {
      console.log("Filtering by donation types:", selectedDonationTypes); // Debug
      filtered = filtered.filter(campaign => {
        // Check if campaign has specific donation type flags
        const hasMonetaryFlag = campaign.hasOwnProperty('acceptsMonetary');
        const hasNonMonetaryFlag = campaign.hasOwnProperty('acceptsNonMonetary');
        
        // If campaign has explicit flags, use them
        if (hasMonetaryFlag || hasNonMonetaryFlag) {
          const isMonetary = hasMonetaryFlag ? campaign.acceptsMonetary : false;
          const isNonMonetary = hasNonMonetaryFlag ? campaign.acceptsNonMonetary : false;
          
          console.log(`Campaign ${campaign.campaignName || campaign.title}: hasMonetaryFlag=${hasMonetaryFlag}, hasNonMonetaryFlag=${hasNonMonetaryFlag}, isMonetary=${isMonetary}, isNonMonetary=${isNonMonetary}`); // Debug
          
          if (selectedDonationTypes.includes("Monetary Donations") && selectedDonationTypes.includes("Non-Monetary Items")) {
            return isMonetary || isNonMonetary;
          } else if (selectedDonationTypes.includes("Monetary Donations")) {
            return isMonetary;
          } else if (selectedDonationTypes.includes("Non-Monetary Items")) {
            return isNonMonetary;
          }
          return false;
        }
        
        // If no explicit flags, try to infer from campaign properties
        // Check if campaign has monetary-related fields
        const hasMonetaryFields = campaign.amount || campaign.goal || campaign.raised || campaign.targetAmount;
        // Check if campaign has non-monetary related fields
        const hasNonMonetaryFields = campaign.itemType || campaign.itemDescription || campaign.requiredItems;
        
        let isMonetary = false;
        let isNonMonetary = false;
        
        if (hasMonetaryFields) {
          isMonetary = true;
        }
        if (hasNonMonetaryFields) {
          isNonMonetary = true;
        }
        
        // If neither is detected, assume it accepts both (default behavior)
        if (!hasMonetaryFields && !hasNonMonetaryFields) {
          isMonetary = true;
          isNonMonetary = true;
        }
        
        console.log(`Campaign ${campaign.campaignName || campaign.title}: hasMonetaryFields=${hasMonetaryFields}, hasNonMonetaryFields=${hasNonMonetaryFields}, isMonetary=${isMonetary}, isNonMonetary=${isNonMonetary}`); // Debug
        
        if (selectedDonationTypes.includes("Monetary Donations") && selectedDonationTypes.includes("Non-Monetary Items")) {
          return isMonetary || isNonMonetary;
        } else if (selectedDonationTypes.includes("Monetary Donations")) {
          return isMonetary;
        } else if (selectedDonationTypes.includes("Non-Monetary Items")) {
          return isNonMonetary;
        }
        
        return false;
      });
      console.log("Filtered campaigns count:", filtered.length); // Debug
    }

    // Filter by time remaining
    if (selectedTimes.length > 0) {
      filtered = filtered.filter(campaign => {
        const endDate = new Date(campaign.endDate || campaign.deadline);
        const now = new Date();
        const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        
        if (selectedTimes.includes("Urgent (<7 days)")) {
          if (daysRemaining <= 7 && daysRemaining > 0) return true;
        }
        if (selectedTimes.includes("This Month")) {
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          if (endDate <= monthEnd && daysRemaining > 0) return true;
        }
        if (selectedTimes.includes("Long-term")) {
          if (daysRemaining > 30) return true;
        }
        
        return false;
      });
    }

    setFilteredCampaigns(filtered);
    setPage(1); // Reset to first page when filters change
  }, [campaigns, selectedCategories, selectedTimes, selectedDonationTypes]);

  // Handle category filter changes
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Handle time filter changes
  const handleTimeChange = (time) => {
    setSelectedTimes(prev => 
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  // Handle donation type filter changes
  const handleDonationTypeChange = (type) => {
    setSelectedDonationTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTimes([]);
    setSelectedDonationTypes([]);
  };

  const campaignsPerPage = 9;
  const start = (page - 1) * campaignsPerPage;
  const end = start + campaignsPerPage;
  const pageCampaigns = filteredCampaigns.slice(start, end);
  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / campaignsPerPage));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Navigation */}
      <header className="bg-white shadow flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xl text-blue-700">
            <img src={logoskl} alt="SchoolFund Logo" className="w-16 h-16 rounded-full object-cover" />
          </div>
          <nav className="flex gap-8 text-base font-medium flex-grow justify-center">
            <Link to="/donor/browse" className="text-blue-600 font-medium">
              Browse Campaigns
            </Link>
            <Link to="/donhistoryta" className="text-gray-700 hover:text-blue-600 font-medium">
              My Donations
            </Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-800">Donor Dashboard</span>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            D
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg mb-8">
          <p className="text-center font-medium text-lg">
            <strong>3,500+</strong> donors contributed this month! Join them in making a difference.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by school name, campaign, or location..."
                className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md hover:shadow-lg transition-all duration-200 text-lg"
                disabled
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Campaigns Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Filter Campaigns</h3>
                {(selectedCategories.length > 0 || selectedTimes.length > 0 || selectedDonationTypes.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Donation Types Filter */}
              <div className="mb-8">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  DONATION TYPES
                </p>
                {donationTypes.map((type, idx) => (
                  <label key={idx} className="flex items-center mb-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
                    <input
                      type="checkbox"
                      checked={selectedDonationTypes.includes(type)}
                      onChange={() => handleDonationTypeChange(type)}
                      className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">{type}</span>
                  </label>
                ))}
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  CATEGORIES
                </p>
                {categoryNames.map((cat, idx) => (
                  <label key={idx} className="flex items-center mb-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                      className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">{cat}</span>
                  </label>
                ))}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  TIME REMAINING
                </p>
                {times.map((t, idx) => (
                  <label key={idx} className="flex items-center mb-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
                    <input
                      type="checkbox"
                      checked={selectedTimes.includes(t)}
                      onChange={() => handleTimeChange(t)}
                      className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">{t}</span>
                  </label>
                ))}
              </div>

              {/* Active Filters Summary */}
              {(selectedCategories.length > 0 || selectedTimes.length > 0 || selectedDonationTypes.length > 0) && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800 mb-2">Active Filters:</p>
                  <div className="space-y-1">
                    {selectedDonationTypes.map(type => (
                      <span key={type} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                        {type}
                      </span>
                    ))}
                    {selectedCategories.map(cat => (
                      <span key={cat} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                        {cat}
                      </span>
                    ))}
                    {selectedTimes.map(time => (
                      <span key={time} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Campaigns */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Active Campaigns</h2>
                <span className="text-gray-600 font-medium">
                  {filteredCampaigns.length} of {campaigns.length} campaigns
                </span>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg font-medium">Loading campaigns...</p>
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-gray-500 font-medium text-lg">No campaigns match your filters</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filter criteria</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {pageCampaigns.map((c) => {
                      const percent = c.amount ? Math.round(((c.raised || 0) / c.amount) * 100) : 0;
                      const isMonetary = c.acceptsMonetary !== false;
                      const isNonMonetary = c.acceptsNonMonetary !== false;
                      
                      return (
                        <div
                          key={c._id}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                                                      <div className="relative">
                              <img
                                src={c.image || "https://via.placeholder.com/600x400"}
                                alt={c.campaignName || c.title}
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute top-3 right-3">
                                <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                                  Active
                                </span>
                              </div>
                            </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                              {c.campaignName || c.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{c.description}</p>
                            
                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600 font-medium text-sm">Progress</span>
                                <span className="text-gray-800 font-bold">{percent}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <p className="text-gray-800 font-bold text-lg">
                                Rs. {Number(c.raised || 0).toLocaleString()}
                              </p>
                              <p className="text-gray-500 text-sm">
                                raised of Rs. {Number(c.amount || c.goal || 0).toLocaleString()} goal
                              </p>
                            </div>
                            
                            <button
                              onClick={() => window.open('https://donate.stripe.com/test_cNi6oGcEG1c5fzmeuhgEg00', '_blank')}
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-semibold"
                            >
                              Donate Now
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          onClick={() => setPage(num)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            page === num
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
