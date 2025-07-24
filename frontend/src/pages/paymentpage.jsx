import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function PaymentPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const navigate = useNavigate();

  const handlePay = (e) => {
    e.preventDefault();
    console.log({
      cardHolder,
      cardNumber,
      expiryDate,
      cvv,
    });
    alert("💳 Payment successful (simulated)");
  };

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>
        <h2 className="text-blue-600 text-2xl font-semibold text-center mb-6">
          Enter Payment Details
        </h2>

        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="block text-black text-sm font-medium mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-black text-sm font-medium mb-2">
              Card Number
            </label>
            <input
              type="text"
              required
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-black text-sm font-medium mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              required
              placeholder="MM/YY"
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-black text-sm font-medium mb-2">
              CVV
            </label>
            <input
              type="password"
              required
              placeholder="123"
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </div>

          <div className="space-y-3 mt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              Pay Now
            </button>
            <button
              type="button"
              onClick={handleGoBack}
              className="w-full bg-gray-200 text-black py-3 px-4 rounded-full font-medium hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
