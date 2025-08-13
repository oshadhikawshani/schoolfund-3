import { Link } from "react-router-dom";
import React from "react";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank you for your donation! 🎉</h1>
          <p className="text-gray-600 mb-6">Your contribution will make a real difference. You can view your donation history in your dashboard.</p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link 
              to="/donor-dashboard?payment=success" 
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Go to Dashboard
            </Link>
            <Link 
              to="/donor/browseCampaigns" 
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Browse More Campaigns
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}