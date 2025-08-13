// frontend/src/pages/MonetaryDonationPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function MonetaryDonationPage() {
  const { id } = useParams(); // campaign id from URL
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [amount, setAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  // donor info (only for UX; backend auth uses token)
  const donorRaw = localStorage.getItem("donorData");
  const donor = (() => {
    try { return donorRaw ? JSON.parse(donorRaw) : null; } catch { return null; }
  })();
  const donorId = donor?._id || donor?.id || donor?.donorId || null;

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

  const handleQuickAmount = (amt) => setAmount(String(amt));

  const handleDonate = async (e) => {
    e.preventDefault();
    if (loading) return;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setNote("Enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      // Store donation data
      const donationPayload = {
        campaignID: id,
        amount: numericAmount,
        visibility: isAnonymous ? "anonymous" : "public",
        message,
        paymentMethod: "card",
      };

      const { data: donationData } = await api.post(`/api/donations/monetary`, donationPayload, {
        withCredentials: true,
      });

      console.log('Donation created successfully:', donationData);

      // Store donation ID in session storage for reference
      if (donationData.donationId) {
        sessionStorage.setItem('lastDonationId', donationData.donationId);
      }

      // Redirect to Stripe with donation metadata
      const stripeUrl = `https://donate.stripe.com/test_cNi6oGcEG1c5fzmeuhgEg00?client_reference_id=${donationData.donationId || 'donation'}`;
      window.location.href = stripeUrl;
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "❌ Error. Please try again.";
      setNote(errorMsg);
      console.error("Donation error:", e);
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
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto flex gap-6">
        {/* Left Column - Campaign Information (60%) */}
        <div className="w-3/5 flex flex-col">
          {/* Campaign Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {campaign.campaignName || campaign.title}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {campaign.description}
              </p>
              
              {/* Campaign Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">Rs. 0</div>
                  <div className="text-sm text-gray-600">Raised So Far</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Donors</div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About This Campaign</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Campaign Duration</h3>
                  <p className="text-gray-600">Ongoing campaign to support school needs</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Impact</h3>
                  <p className="text-gray-600">Your donation will directly benefit students and improve educational facilities</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Transparency</h3>
                  <p className="text-gray-600">Regular updates on how your donations are being used</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Donation Form (40%) */}
        <div className="w-2/5">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 h-full overflow-y-auto">
            {/* Stripe-style Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete your donation</h2>
              <p className="text-gray-600 text-sm">Your contribution will make a real difference</p>
            </div>

            <form onSubmit={handleDonate} className="space-y-6">
              {/* Amount Section - Stripe Style */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Donation amount
                </label>

                {/* Quick Amount Buttons - Stripe Style */}
                <div className="grid grid-cols-3 gap-3">
                  {[1000, 2500, 5000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => handleQuickAmount(amt)}
                      className={`relative group transition-all duration-200 rounded-lg border p-4 text-center hover:scale-105 ${
                        Number(amount) === amt
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="text-lg font-semibold">Rs. {amt.toLocaleString()}</div>
                      {Number(amount) === amt && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input - Stripe Style */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">Rs.</span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                    min="1"
                    required
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              {/* Anonymous Donation Toggle - Stripe Style */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={() => setIsAnonymous((v) => !v)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                      isAnonymous ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                        isAnonymous ? 'translate-x-5' : 'translate-x-0.5'
                      }`}></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">Donate anonymously</span>
                    <p className="text-xs text-gray-500">Your name will be hidden from public view</p>
                  </div>
                </label>
              </div>

              {/* Message Section - Stripe Style */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 resize-none"
                  rows="3"
                  placeholder="Add a personal message..."
                />
              </div>

              {/* Payment Method - Stripe Style */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Payment method
                </label>
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      paymentMethod === "card" ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}>
                      {paymentMethod === "card" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-1"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Credit or debit card</span>
                        <p className="text-xs text-gray-500">Secure payment via Stripe</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button - Stripe Style */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Donate Rs. ${Number(amount) || 0}`
                )}
              </button>

              {/* Note */}
              {note && (
                <div className={`text-sm p-3 rounded-lg ${
                  note.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {note}
                </div>
              )}

              {/* Security Notice - Stripe Style */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Your payment is secure and encrypted</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
