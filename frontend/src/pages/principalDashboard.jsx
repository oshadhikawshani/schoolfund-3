import React, { useEffect, useState } from "react";

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
        const res = await fetch(`http://localhost:4000/api/campaigns/principal-dashboard/${schoolID}`);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">Principal Dashboard</h1>
          <p className="text-red-600 text-center">No school is associated with this principal account. Please contact support.</p>
        </div>
      </div>
    );
  }

  const handleAction = async (campaignId, action) => {
    setMessage("");
    try {
      const res = await fetch(`http://localhost:4000/api/campaigns/principal-approve/${campaignId}`, {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Principal Dashboard</h1>
        <p className="mb-6 text-center text-gray-600">Approve or reject campaigns requiring your approval.</p>
        {message && <div className="mb-4 text-center text-blue-700 font-medium">{message}</div>}
        {loading ? (
          <div className="text-center">Loading pending campaigns...</div>
        ) : pendingCampaigns.length === 0 ? (
          <div className="text-center text-green-700">No campaigns pending approval.</div>
        ) : (
          <div className="space-y-6">
            {pendingCampaigns.map((c) => (
              <div key={c._id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                <h2 className="text-lg font-semibold mb-2">{c.campaignName}</h2>
                <p className="mb-1 text-gray-700">Amount: <span className="font-bold">Rs {c.amount.toLocaleString()}</span></p>
                <p className="mb-1 text-gray-700">Description: {c.description}</p>
                <p className="mb-1 text-gray-700">Deadline: {c.deadline ? new Date(c.deadline).toLocaleDateString() : '-'}</p>
                <div className="flex gap-4 mt-4">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                    onClick={() => handleAction(c._id, "approve")}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
                    onClick={() => handleAction(c._id, "reject")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 