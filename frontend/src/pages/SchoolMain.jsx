import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logoskl.jpg";
import landingBg from "../images/landing-bg.jpg";
import bagdash from "../images/bagdash.jpg";
import classroomdash from "../images/classroomdash.jpg";
import disabilitiesdash from "../images/disabilitiesdash.jpg";
import healthcheckdash from "../images/healthcheckdash.jpg";
import BackButton from "../components/BackButton";


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
  }, [schoolData]);

  const handleLogout = () => {
    localStorage.removeItem("schoolData");
    localStorage.removeItem("schoolToken");
    navigate("/");
  };

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  }

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
        style={{ backgroundImage: `url(${landingBg})` }}
      >
        {/* Floating Back Button */}
        <div className="absolute top-4 left-4 z-30">
          <BackButton />
        </div>
        <div className="absolute inset-0 bg-[#0091d9] bg-opacity-40"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <img
            src={logo}
            alt="School Logo"
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg mb-4"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {schoolData.SchoolRequestID || "School Name"}
          </h1>
          <p className="mt-2 text-lg md:text-xl text-blue-100 italic font-medium drop-shadow">
            "Empowering Minds, Shaping Futures"
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 z-20"
        >
          Logout
        </button>
        <button
          onClick={() => navigate('/principal-login')}
          className="absolute top-4 right-36 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 z-20"
        >
          Principal Login
        </button>
        <button
          onClick={() => navigate('/school/profile')}
          className="absolute top-4 right-72 bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm font-medium border border-gray-300 shadow transition-colors duration-200 z-20"
        >
          Manage Profile
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="mb-3">
                      {c.monetaryType === 'Monetary' ? (
                        <>
                          <p className="text-gray-800">
                            <strong>Rs {c.raised ? c.raised.toLocaleString() : 0}</strong> raised
                          </p>
                          <p className="text-gray-500 text-sm">of Rs {c.amount ? c.amount.toLocaleString() : 0} goal</p>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-800">
                            <strong>{c.raised ? c.raised.toLocaleString() : 0}</strong> items received
                          </p>
                          <p className="text-gray-500 text-sm">of {c.amount ? c.amount.toLocaleString() : 0} items needed</p>
                        </>
                      )}
                    </div>
                    <p className="text-blue-600 font-medium text-sm mb-2">
                      Deadline: {formatDate(c.deadline)} ({daysLeft(c.deadline)} days left)
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, ((c.raised || 0) / (c.amount || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              );
              return isApproved ? (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => { setSelectedCampaign(c); setModalOpen(true); }}
                >
                  {cardContent}
                </div>
              ) : (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow opacity-90">
                  {cardContent}
                </div>
              );
            })}
          </div>
        </div>
        {/* Modal for campaign details */}
        {modalOpen && selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white bg-opacity-20">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setModalOpen(false)}
              >
                &times;
              </button>
              <img src={selectedCampaign.image || bagdash} alt={selectedCampaign.campaignName} className="w-full h-48 object-cover rounded mb-4" />
              <h2 className="text-2xl font-bold mb-2">{selectedCampaign.campaignName}</h2>
              <div className="flex gap-2 mb-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                    ${selectedCampaign.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                    ${selectedCampaign.status === 'pending' || selectedCampaign.status === 'principal_pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${selectedCampaign.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                  `}
                >
                  {selectedCampaign.status === 'approved' && 'Approved'}
                  {selectedCampaign.status === 'pending' && 'Pending Admin Approval'}
                  {selectedCampaign.status === 'principal_pending' && 'Pending Principal Approval'}
                  {selectedCampaign.status === 'rejected' && 'Rejected'}
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                    ${selectedCampaign.monetaryType === 'Monetary' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
                  `}
                >
                  {selectedCampaign.monetaryType === 'Monetary' ? 'Monetary' : 'Non-Monetary'}
                </span>
              </div>
              <p className="text-gray-700 mb-2"><strong>Description:</strong> {selectedCampaign.description}</p>
              {selectedCampaign.monetaryType === 'Monetary' ? (
                <>
                  <p className="text-gray-700 mb-2"><strong>Funding Goal:</strong> Rs {selectedCampaign.amount ? selectedCampaign.amount.toLocaleString() : 0}</p>
                  <p className="text-gray-700 mb-2"><strong>Amount Raised:</strong> Rs {selectedCampaign.raised ? selectedCampaign.raised.toLocaleString() : 0}</p>
                </>
              ) : (
                <>
                  <p className="text-gray-700 mb-2"><strong>Quantity Needed:</strong> {selectedCampaign.amount ? selectedCampaign.amount.toLocaleString() : 0} items</p>
                  <p className="text-gray-700 mb-2"><strong>Items Received:</strong> {selectedCampaign.raised ? selectedCampaign.raised.toLocaleString() : 0} items</p>
                </>
              )}
              <p className="text-gray-700 mb-2"><strong>Deadline:</strong> {formatDate(selectedCampaign.deadline)}</p>
              <p className="text-gray-700 mb-2"><strong>Days Left:</strong> {daysLeft(selectedCampaign.deadline)}</p>
              <p className="text-gray-700 mb-2"><strong>Status:</strong> {selectedCampaign.status}</p>
              <p className="text-gray-700 mb-2"><strong>Campaign ID:</strong> {selectedCampaign.campaignID}</p>
              <p className="text-gray-700 mb-2"><strong>School ID:</strong> {selectedCampaign.schoolID}</p>
              <p className="text-gray-700 mb-2"><strong>Category ID:</strong> {selectedCampaign.categoryID}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, ((selectedCampaign.raised || 0) / (selectedCampaign.amount || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* School Info Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">About Our School</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">School Name</label>
                <p className="mt-1 text-base text-gray-900 font-semibold">{schoolData.SchoolName || schoolData.PrincipalName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Principal</label>
                <p className="mt-1 text-base text-gray-900">{schoolData.PrincipalName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-base text-gray-900">{schoolData.Email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <p className="mt-1 text-base text-gray-900">{schoolData.ContactNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-base text-gray-900">{schoolData.Address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-base text-gray-900">{schoolData.Username}</p>
              </div>
            </div>
          </div>
          {/* School Motto/Description */}
          <div className="mt-8 text-center">
            <p className="text-lg text-gray-700 italic">
              Our mission is to nurture every student to reach their full potential and become responsible citizens of tomorrow.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
      </main>
    </div>
  );
} 