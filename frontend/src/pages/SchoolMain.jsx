import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logoskl.jpg";
import landingBg from "../images/landing-bg.jpg";
import bagdash from "../images/bagdash.jpg";
import classroomdash from "../images/classroomdash.jpg";
import disabilitiesdash from "../images/disabilitiesdash.jpg";
import healthcheckdash from "../images/healthcheckdash.jpg";
import BackButton from "../components/BackButton";
import Footer from "../components/Footer";
 


export default function SchoolMain() {
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedSchoolData = localStorage.getItem("schoolData");
    if (storedSchoolData) {
      setSchoolData(JSON.parse(storedSchoolData));
    } else {
      navigate("/");
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    // Fetch campaigns for this school from backend
    async function fetchCampaigns() {
      if (!schoolData) return;
      try {
        const res = await fetch(`https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/campaigns/school/${schoolData.SchoolRequestID}`);
        const data = await res.json();
        setCampaigns(data);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
        setCampaigns([]);
      }
    }
    fetchCampaigns();

    const onFocus = () => fetchCampaigns();
    window.addEventListener('focus', onFocus);

    const onStorage = (e) => {
      if (e.key === 'donationCompletedAt') {
        fetchCampaigns();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [schoolData]);

  const handleLogout = () => {
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
    navigate("/");
  };

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  }

  // Calculate progress percentage
  const calculateProgress = (raised, goal) => {
    const safeGoal = Number(goal) || 0;
    const safeRaised = Number(raised) || 0;
    if (safeGoal <= 0) return 0;
    return Math.min(Math.round((safeRaised / safeGoal) * 100), 100);
  };

  // Calculate remaining amount needed
  const calculateRemaining = (raised, goal) => {
    const safeGoal = Number(goal) || 0;
    const safeRaised = Number(raised) || 0;
    return Math.max(0, safeGoal - safeRaised);
  };

  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    const endDate = new Date(deadline);
    const now = new Date();
    return Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  };

  function daysLeft(deadline) {
    if (!deadline) return "-";
    const now = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!schoolData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-64 md:h-80 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, #0804fc 0%, white 100%)`
        }}
      >
        {/* Floating Back Button */}
        <div className="absolute top-4 left-4 z-30">
          <BackButton />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white to-[#0804fc] opacity-80"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <img
            src={logo}
            alt="School Logo"
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg mb-4"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {schoolData.SchoolRequestID || "School Name"}
          </h1>
          <p className="mt-2 text-lg md:text-xl text-green-500 italic font-medium">
            "Empowering Minds, Shaping Futures"
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 z-20 hover:shadow-lg hover:scale-105 transform"
        >
          Logout
        </button>
        <button
          onClick={() => navigate('/principal-login')}
          className="absolute top-4 right-32 md:right-36 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 z-20 hover:shadow-lg hover:scale-105 transform"
          style={{ backgroundColor: '#0804fc' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#0603d9'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#0804fc'}
        >
          Principal Login
        </button>
        <button
          onClick={() => navigate('/school/profile')}
          className="absolute top-4 right-20 md:right-72 bg-white hover:bg-gray-100 text-gray-800 px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium border border-gray-300 shadow transition-all duration-200 z-20 hover:shadow-lg hover:scale-105 transform hover:border-gray-400"
        >
          <span className="hidden md:inline">Manage Profile</span>
          <span className="md:hidden">Profile</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Campaigns Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center w-full md:w-auto">Our Campaigns</h2>
            <button
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-base font-medium shadow transition-colors duration-200"
              onClick={() => navigate('/school-create-campaign')}
            >
              + Add Campaign
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {campaigns.map((c, i) => {
              const isApproved = c.status === 'approved';
              const cardContent = (
                <>
                  <img src={c.image || bagdash} alt={c.campaignName} className="w-full h-40 object-cover" />
                  {/* Campaign Name and Status Row below image */}
                  <div className="flex items-center justify-between px-4 pt-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{c.campaignName}</h3>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                          ${c.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                          ${c.status === 'pending' || c.status === 'principal_pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${c.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        `}
                      >
                        {c.status === 'approved' && 'Approved'}
                        {c.status === 'pending' && 'Pending Admin Approval'}
                        {c.status === 'principal_pending' && 'Pending Principal Approval'}
                        {c.status === 'rejected' && 'Rejected'}
                      </span>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold 
                          ${c.monetaryType === 'Monetary' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
                        `}
                      >
                        {c.monetaryType === 'Monetary' ? 'Monetary' : 'Non-Monetary'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-3">{c.description}</p>
                    {/* Campaign Progress - Enhanced with percentage and status */}
                    {c.monetaryType === 'Non-Monetary' ? (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 font-bold text-sm">
                            {calculateProgress(c.itemsReceived || c.raised || 0, c.amount || 0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${calculateProgress(c.itemsReceived || c.raised || 0, c.amount || 0)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{Number(c.itemsReceived || c.raised || 0).toLocaleString()} items received</span>
                          <span>of {Number(c.amount || 0).toLocaleString()} needed</span>
                        </div>
                        {/* Remaining items */}
                        {calculateRemaining(c.itemsReceived || c.raised || 0, c.amount || 0) > 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            <span className="font-medium">Still needed: {calculateRemaining(c.itemsReceived || c.raised || 0, c.amount || 0).toLocaleString()} items</span>
                          </div>
                        )}
                        {/* Status indicator */}
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${calculateProgress(c.itemsReceived || c.raised || 0, c.amount || 0) >= 100
                            ? 'bg-green-100 text-green-800'
                            : calculateProgress(c.itemsReceived || c.raised || 0, c.amount || 0) >= 75
                              ? 'bg-blue-100 text-blue-800'
                              : calculateProgress(c.itemsReceived || c.raised || 0, c.amount || 0) >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {calculateProgress(c.itemsReceived || c.raised || 0, c.amount || 0) >= 100
                              ? 'Completed'
                              : calculateProgress(c.itemsReceived || c.raised || 0, c.amount || 0) >= 75
                                ? 'Almost Complete'
                                : calculateProgress(c.itemsReceived || c.raised || 0, c.amount || 0) >= 50
                                  ? 'Halfway There'
                                  : 'Just Started'
                            }
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 font-bold text-sm">
                            {calculateProgress(c.raised || 0, c.amount || c.goal || 0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${calculateProgress(c.raised || 0, c.amount || c.goal || 0)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Rs. {Number(c.raised || 0).toLocaleString()} raised</span>
                          <span>of Rs. {Number(c.amount || c.goal || 0).toLocaleString()} goal</span>
                        </div>
                        {/* Remaining amount */}
                        {calculateRemaining(c.raised || 0, c.amount || c.goal || 0) > 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            <span className="font-medium">Still needed: Rs. {calculateRemaining(c.raised || 0, c.amount || c.goal || 0).toLocaleString()}</span>
                          </div>
                        )}
                        {/* Status indicator */}
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${calculateProgress(c.raised || 0, c.amount || c.goal || 0) >= 100
                            ? 'bg-green-100 text-green-800'
                            : calculateProgress(c.raised || 0, c.amount || c.goal || 0) >= 75
                              ? 'bg-blue-100 text-blue-800'
                              : calculateProgress(c.raised || 0, c.amount || c.goal || 0) >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {calculateProgress(c.raised || 0, c.amount || c.goal || 0) >= 100
                              ? 'Goal Reached'
                              : calculateProgress(c.raised || 0, c.amount || c.goal || 0) >= 75
                                ? 'Almost There'
                                : calculateProgress(c.raised || 0, c.amount || c.goal || 0) >= 50
                                  ? 'Halfway There'
                                  : 'Just Started'
                            }
                          </span>
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
                  </div>
                </>
              );
              return isApproved ? (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1"
                  onClick={() => { setSelectedCampaign(c); setModalOpen(true); }}
                >
                  {cardContent}
                </div>
              ) : (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 opacity-90 transform hover:scale-102">
                  {cardContent}
                </div>
              );
            })}
          </div>
        </div>
        {/* Modal for campaign details */}
        {modalOpen && selectedCampaign && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-opacity-30"
            onClick={() => setModalOpen(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative">
                <img
                  src={selectedCampaign.image || bagdash}
                  alt={selectedCampaign.campaignName}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <button
                  className="absolute top-4 right-4 text-white hover:text-gray-200 hover:bg-black/20 text-3xl font-bold w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-black/30 backdrop-blur-sm"
                  onClick={() => setModalOpen(false)}
                >
                  &times;
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{selectedCampaign.campaignName}</h2>
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm
                        ${selectedCampaign.status === 'approved' ? 'bg-green-500/80 text-white' : ''}
                        ${selectedCampaign.status === 'pending' || selectedCampaign.status === 'principal_pending' ? 'bg-yellow-500/80 text-white' : ''}
                        ${selectedCampaign.status === 'rejected' ? 'bg-red-500/80 text-white' : ''}
                      `}
                    >
                      {selectedCampaign.status === 'approved' && '✓ Approved'}
                      {selectedCampaign.status === 'pending' && '⏳ Pending Admin'}
                      {selectedCampaign.status === 'principal_pending' && '⏳ Pending Principal'}
                      {selectedCampaign.status === 'rejected' && '✗ Rejected'}
                    </span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm
                        ${selectedCampaign.monetaryType === 'Monetary' ? 'bg-blue-500/80 text-white' : 'bg-purple-500/80 text-white'}
                      `}
                    >
                      {selectedCampaign.monetaryType === 'Monetary' ? '💰 Monetary' : '📦 Non-Monetary'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    {selectedCampaign.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {selectedCampaign.monetaryType === 'Monetary' ? (
                    <>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-1">💰 Funding Goal</h4>
                        <p className="text-2xl font-bold text-green-700">Rs {selectedCampaign.amount ? selectedCampaign.amount.toLocaleString() : 0}</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-1">📈 Amount Raised</h4>
                        <p className="text-2xl font-bold text-blue-700">Rs {selectedCampaign.raised ? selectedCampaign.raised.toLocaleString() : 0}</p>
                      </div>
                      {calculateRemaining(selectedCampaign.raised || 0, selectedCampaign.amount || 0) > 0 && (
                        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-800 mb-1">🎯 Still Needed</h4>
                          <p className="text-2xl font-bold text-red-700">Rs {calculateRemaining(selectedCampaign.raised || 0, selectedCampaign.amount || 0).toLocaleString()}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-1">📦 Quantity Needed</h4>
                        <p className="text-2xl font-bold text-purple-700">{selectedCampaign.amount ? selectedCampaign.amount.toLocaleString() : 0} items</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-1">✅ Items Received</h4>
                        <p className="text-2xl font-bold text-orange-700">{selectedCampaign.itemsReceived || selectedCampaign.raised ? (selectedCampaign.itemsReceived || selectedCampaign.raised).toLocaleString() : 0} items</p>
                      </div>
                      {calculateRemaining(selectedCampaign.itemsReceived || selectedCampaign.raised || 0, selectedCampaign.amount || 0) > 0 && (
                        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-800 mb-1">🎯 Still Needed</h4>
                          <p className="text-2xl font-bold text-red-700">{calculateRemaining(selectedCampaign.itemsReceived || selectedCampaign.raised || 0, selectedCampaign.amount || 0).toLocaleString()} items</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Deadline
                    </h4>
                    <p className="text-gray-900 font-medium">{formatDate(selectedCampaign.deadline)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Days Left
                    </h4>
                    <p className="text-gray-900 font-medium">{daysLeft(selectedCampaign.deadline)} days</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Progress
                    </h4>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          selectedCampaign.monetaryType === 'Non-Monetary' 
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                        style={{ width: `${calculateProgress(
                          selectedCampaign.monetaryType === 'Non-Monetary' 
                            ? (selectedCampaign.itemsReceived || selectedCampaign.raised || 0)
                            : (selectedCampaign.raised || 0),
                          selectedCampaign.amount || 0
                        )}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-600">
                        {calculateProgress(
                          selectedCampaign.monetaryType === 'Non-Monetary' 
                            ? (selectedCampaign.itemsReceived || selectedCampaign.raised || 0)
                            : (selectedCampaign.raised || 0),
                          selectedCampaign.amount || 0
                        )}% complete
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        calculateProgress(
                          selectedCampaign.monetaryType === 'Non-Monetary' 
                            ? (selectedCampaign.itemsReceived || selectedCampaign.raised || 0)
                            : (selectedCampaign.raised || 0),
                          selectedCampaign.amount || 0
                        ) >= 100
                          ? 'bg-green-100 text-green-800'
                          : calculateProgress(
                              selectedCampaign.monetaryType === 'Non-Monetary' 
                                ? (selectedCampaign.itemsReceived || selectedCampaign.raised || 0)
                                : (selectedCampaign.raised || 0),
                              selectedCampaign.amount || 0
                            ) >= 75
                            ? 'bg-blue-100 text-blue-800'
                            : calculateProgress(
                                selectedCampaign.monetaryType === 'Non-Monetary' 
                                  ? (selectedCampaign.itemsReceived || selectedCampaign.raised || 0)
                                  : (selectedCampaign.raised || 0),
                                selectedCampaign.amount || 0
                              ) >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {calculateProgress(
                          selectedCampaign.monetaryType === 'Non-Monetary' 
                            ? (selectedCampaign.itemsReceived || selectedCampaign.raised || 0)
                            : (selectedCampaign.raised || 0),
                          selectedCampaign.amount || 0
                        ) >= 100
                          ? (selectedCampaign.monetaryType === 'Non-Monetary' ? 'Completed' : 'Goal Reached')
                          : calculateProgress(
                              selectedCampaign.monetaryType === 'Non-Monetary' 
                                ? (selectedCampaign.itemsReceived || selectedCampaign.raised || 0)
                                : (selectedCampaign.raised || 0),
                              selectedCampaign.amount || 0
                            ) >= 75
                            ? (selectedCampaign.monetaryType === 'Non-Monetary' ? 'Almost Complete' : 'Almost There')
                            : calculateProgress(
                                selectedCampaign.monetaryType === 'Non-Monetary' 
                                  ? (selectedCampaign.itemsReceived || selectedCampaign.raised || 0)
                                  : (selectedCampaign.raised || 0),
                                selectedCampaign.amount || 0
                              ) >= 50
                              ? 'Halfway There'
                              : 'Just Started'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Technical Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Campaign ID:</span>
                      <span className="ml-2 font-mono text-gray-800">{selectedCampaign.campaignID}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">School ID:</span>
                      <span className="ml-2 font-mono text-gray-800">{selectedCampaign.schoolID}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category ID:</span>
                      <span className="ml-2 font-mono text-gray-800">{selectedCampaign.categoryID}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Our School Section */}
        <div className="mb-12">
          <div className="flex mb-3">

            <h2 className="text-2xl font-bold text-gray-900">About Our School</h2>
          </div>
        </div>

        {/* School Info Card */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-8 mb-8 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* School Name */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide">School Name</label>
                  <p className="text-lg font-bold text-gray-900">{schoolData.SchoolName || schoolData.SchoolRequestID}</p>
                </div>
              </div>
            </div>

            {/* Principal */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide">Principal</label>
                  <p className="text-lg font-semibold text-gray-900">{schoolData.PrincipalName}</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide">Email</label>
                  <p className="text-lg text-gray-900 break-all">{schoolData.Email}</p>
                </div>
              </div>
            </div>

            {/* Contact Number */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide">Contact Number</label>
                  <p className="text-lg font-semibold text-gray-900">{schoolData.ContactNumber}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide">Address</label>
                  <p className="text-lg text-gray-900">{schoolData.Address}</p>
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide">Username</label>
                  <p className="text-lg font-semibold text-gray-900">{schoolData.Username}</p>
                </div>
              </div>
            </div>
          </div>

          {/* School Motto/Description */}
          <div className="mt-10 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg p-8 text-white max-w-2xl mx-auto">

              <h3 className="text-xl font-bold mb-3">Our Mission</h3>
              <p className="text-lg leading-relaxed">
                Our mission is to nurture every student to reach their full potential and become responsible citizens of tomorrow.
              </p>
            </div>
          </div>
        </div>

        

        {/* Quick Actions */}
      </main>
      <Footer />
    </div>
  );
} 