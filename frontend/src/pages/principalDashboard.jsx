import React, { useEffect, useState } from "react";
import landingBg from "../images/landing-bg.jpg";
import BackButton from "../components/BackButton";
export default function PrincipalDashboard() {
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Get principal data from localStorage
  const principalData = JSON.parse(localStorage.getItem("principalData") || "null");
  const schoolID = principalData?.SchoolRequestID;

  useEffect(() => {
    if (!schoolID) return;
    async function fetchPendingCampaigns() {
      setLoading(true);
      setMessage("");
      try {
        const res = await fetch(`https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/campaigns/principal-dashboard/${schoolID}`);
        const data = await res.json();
        setPendingCampaigns(data);
      } catch (err) {
        setMessage("Failed to fetch pending campaigns.");
      }
      setLoading(false);
    }
    fetchPendingCampaigns();
  }, [schoolID]);

  if (!schoolID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
        <div className="bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-blue-600 max-w-md w-full">
          <div className="flex flex-col items-center mb-4">
            <svg className="w-12 h-12 text-blue-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 0c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm0 0v2m0 4h.01" /></svg>
            <h1 className="text-3xl font-extrabold text-blue-700 mb-1">Principal Dashboard</h1>
          </div>
          <p className="text-red-600 text-center font-medium">No school is associated with this principal account.<br />Please contact support.</p>
        </div>
      </div>
    );
  }

  const handleAction = async (campaignId, action) => {
    setMessage("");
    try {
      const res = await fetch(`https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/campaigns/principal-approve/${campaignId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Campaign ${action}d successfully.`);
        setPendingCampaigns((prev) => prev.filter((c) => c._id !== campaignId));
      } else {
        setMessage(data.message || `Failed to ${action} campaign.`);
      }
    } catch (err) {
      setMessage(`Failed to ${action} campaign.`);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center py-10 px-2">
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <img
          src={landingBg}
          alt="Background"
          className="w-full h-full object-cover object-center"
          style={{ minHeight: '100vh' }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 " />
      </div>
      <div className="w-full max-w-4xl z-10 relative">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 justify-center">

          <div>
            <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight drop-shadow">Principal  Dashboard</h1>
            <p className="text-blue-400 mt-1 drop-shadow">Review, approve, or reject school campaigns below.</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 flex justify-center">
            <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-lg shadow-sm font-medium animate-fade-in">
              {message}
            </div>
          </div>
        )}

        {/* Campaigns */}
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-8 min-h-[350px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40">
              <svg className="w-10 h-10 text-blue-500 animate-spin mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              <span className="text-blue-700 font-semibold">Loading pending campaigns...</span>
            </div>
          ) : pendingCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <svg className="w-12 h-12 text-green-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <span className="text-green-700 font-semibold text-lg">No campaigns pending approval.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pendingCampaigns.map((c) => (
                <div key={c._id} className="relative border border-blue-100 rounded-xl p-6 shadow-md bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-shadow duration-200 group">
                  {/* Pending badge */}
                  <span className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 11.25h-1.5v-1.5h1.5v1.5zm0-3h-1.5v-4h1.5v4z" /></svg>
                    Pending
                  </span>
                  <h2 className="text-xl font-bold mb-2 text-blue-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 7H7v6h6V7z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3-9a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H8a1 1 0 01-1-1V9z" clipRule="evenodd" /></svg>
                    {c.campaignName}
                  </h2>
                  <div className="mb-2 text-gray-700 flex items-center gap-2">
                    <span className="font-semibold">Amount:</span>
                    <span className="text-green-700 font-bold">Rs {c.amount.toLocaleString()}</span>
                  </div>
                  <div className="mb-2 text-gray-700">
                    <span className="font-semibold">Description:</span> {c.description}
                  </div>
                  <div className="mb-4 text-gray-700">
                    <span className="font-semibold">Deadline:</span> {c.deadline ? new Date(c.deadline).toLocaleDateString() : '-'}
                  </div>
                  <div className="flex gap-4 mt-2">
                    <button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400"
                      onClick={() => handleAction(c._id, "approve")}
                    >
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Approve
                      </span>
                    </button>
                    <button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                      onClick={() => handleAction(c._id, "reject")}
                    >
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        Reject
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 