import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api"; // <-- use shared axios with Authorization header

export default function NonMonetaryDonationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [file, setFile] = useState(null); // single file, backend expects "photo"
  const [quantity, setQuantity] = useState(1); // Added quantity state
  const [deliveryMethod] = useState("handover"); // Only one delivery method available
  const [deadlineDate, setDeadlineDate] = useState(""); // backend field name
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  // Calculate handover deadline (2 weeks from preferred date)
  const getHandoverDeadline = (preferredDate) => {
    if (!preferredDate) return null;
    const date = new Date(preferredDate);
    date.setDate(date.getDate() + 14); // Add 2 weeks
    return date;
  };

  const handoverDeadline = getHandoverDeadline(deadlineDate);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/api/campaigns/${id}`);
        if (mounted) setCampaign(res.data);
      } catch {
        if (mounted) setNote("Could not load campaign.");
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setNote("At least one photo is required");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);               // <-- must be "photo"
    formData.append("campaignID", id);            // <-- capital ID
    formData.append("quantity", quantity);        // Added quantity
    formData.append("deliveryMethod", deliveryMethod);
    if (deadlineDate) formData.append("deadlineDate", deadlineDate);
    if (notes) formData.append("notes", notes);

    setLoading(true);
    setNote("");
    try {
      const { data } = await api.post(`/api/donations/nonmonetary`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setNote(`✅ ${data.message}${data.collectionDeadline ? ` — Collect by: ${new Date(data.collectionDeadline).toLocaleString()}` : ""}`);
    } catch (err) {
      setNote(err?.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center font-medium">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate('/donor-dashboard')}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-blue-600 text-blue-600 hover:text-white transition-colors focus:outline-none shadow-lg"
          aria-label="Back to dashboard"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className="max-w-4xl mx-auto">
        {/* Campaign Header */}
        {/* <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {campaign.campaignName || campaign.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-6 max-w-2xl mx-auto">
              {campaign.description}
            </p>
            
            
            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{campaign.amount || 0}</div>
                <div className="text-sm text-gray-600">Items Needed</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Items Donated</div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Donation Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete your donation</h2>
            <p className="text-gray-600 text-sm">Your contribution will make a real difference</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Item Photo <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="photo-upload"
                  required
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Max 5MB; PNG/JPG/WEBP</p>
                </label>
              </div>
            </div>

            {/* Quantity and Delivery Method - Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity of Items <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
                  min="1"
                  required
                  placeholder="How many items are you donating?"
                />
                <p className="text-xs text-gray-500">Enter the number of items you're donating</p>
              </div>

              {/* Delivery Method */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Method
                </label>
                <div className="flex items-center space-x-3 border border-gray-200 rounded-lg p-4 bg-gray-50 h-[52px]">
                  <span className="text-2xl">🏫</span>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Handover to school</span>
                    <p className="text-xs text-gray-500">Deliver items directly to the school</p>
                  </div>
                </div>
              </div>
            </div>



            {/* Preferred Date and Notes - Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deadline Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
                />
                
                {/* Handover Deadline Notice */}
                {handoverDeadline && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Handover Deadline
                        </p>
                        <p className="text-sm text-blue-700">
                          Your donation must be handed over to the school by{' '}
                          <span className="font-semibold">
                            {handoverDeadline.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          {' '}at{' '}
                          <span className="font-semibold">
                            {handoverDeadline.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {' '}(within 2 weeks of your preferred date).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="Leave a note about your donation..."
                />
              </div>
            </div>

            {/* Message */}
            {note && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${note.startsWith("✅")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                  }`}
              >
                {note}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting donation...</span>
                </div>
              ) : (
                "Submit Donation"
              )}
            </button>

            {/* Security Notice */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Your donation information is secure and private</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
