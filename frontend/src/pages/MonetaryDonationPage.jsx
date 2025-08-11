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
    setNote("");

    if (!donorId) {
      setNote("Please login as a donor to continue.");
      setTimeout(() => navigate("/donor/login"), 900);
      return;
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setNote("Enter a valid amount.");
      return;
    }

    if (paymentMethod !== "card") {
      setNote("This payment method is coming soon. Please select Credit / Debit Card.");
      return;
    }

    setLoading(true);
    try {
      // IMPORTANT: match backend field names
      const payload = {
        campaignID: id, // backend expects capital ID
        amount: numericAmount,
        visibility: isAnonymous ? "anonymous" : "public",
        message,
        paymentMethod: "card",
      };

      const { data } = await api.post(`/api/donations/monetary`, payload, {
        withCredentials: true,
      });

      if (data?.url) {
        window.location.href = data.url; // Stripe Checkout
        return;
      }

      setNote("✅ Donation successful! Redirecting…");
      setTimeout(() => navigate("/donor/dashboard"), 900);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "❌ Donation failed. Please try again.";
      setNote(msg);
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-full overflow-y-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Make a Donation</h2>
              <p className="text-gray-600">Support this cause with your generous contribution</p>
            </div>

            <form onSubmit={handleDonate} className="space-y-4">
              {/* Amount Section */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-gray-900">
                  Donation Amount
                </label>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 2500, 5000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => handleQuickAmount(amt)}
                      className={`relative group transition-all duration-200 rounded-lg border-2 p-3 text-center hover:scale-105 ${Number(amount) === amt
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-100"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-700"
                        }`}
                    >
                      <div className="text-lg font-bold">Rs. {amt.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Quick Select</div>
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

                {/* Custom Amount Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-base font-medium">Rs.</span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                    min="1"
                    required
                    placeholder="Enter custom amount"
                  />
                </div>
              </div>

              {/* Anonymous Donation Toggle */}
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={() => setIsAnonymous((v) => !v)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${isAnonymous ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${isAnonymous ? 'translate-x-5' : 'translate-x-0.5'
                        }`}></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-base font-medium text-gray-900">Donate Anonymously</span>
                    <p className="text-xs text-gray-600">Your name will be hidden from public view</p>
                  </div>
                </label>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="block text-base font-semibold text-gray-900">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label className="relative flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors duration-200">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${paymentMethod === "card" ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                      {paymentMethod === "card" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Credit / Debit Card</span>
                          <p className="text-xs text-gray-600">Secure payment via Stripe</p>
                        </div>
                      </div>
                    </div>
                  </label>

                  <div className="p-3 border-2 border-gray-100 rounded-lg bg-gray-50 opacity-60">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-5 bg-gray-400 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">PayPal (Coming Soon)</span>
                        <p className="text-xs text-gray-400">We're working on adding more payment options</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-2 border-gray-100 rounded-lg bg-gray-50 opacity-60">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-5 bg-gray-400 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Google Pay (Coming Soon)</span>
                        <p className="text-xs text-gray-400">We're working on adding more payment options</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Section */}
              <div className="space-y-2">
                <label className="block text-base font-semibold text-gray-900">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="block w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 resize-none"
                  placeholder="Share your message with the school and other donors..."
                />
                <p className="text-xs text-gray-500">Your message will be visible to the school and other donors (unless anonymous)</p>
              </div>

              {/* Status Messages */}
              {note && (
                <div className={`rounded-lg px-4 py-3 text-center ${note.startsWith("✅")
                  ? "bg-green-50 text-green-800 border-2 border-green-200"
                  : "bg-red-50 text-red-800 border-2 border-red-200"
                  }`}>
                  <div className="flex items-center justify-center space-x-2">
                    {note.startsWith("✅") ? (
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="font-medium text-sm">{note}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg text-base font-semibold transition-all duration-200 transform hover:scale-105 ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Proceed to Secure Payment</span>
                  </div>
                )}
              </button>

              {/* Login Notice */}
              {!donorId && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center space-x-2 text-amber-800">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium">
                      You're not logged in. You'll be redirected to login before donating.
                    </span>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
