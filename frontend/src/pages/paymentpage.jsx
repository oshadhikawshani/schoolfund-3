import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css"; // Make sure this includes the .pay- styles

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
    <div className="pay-wrapper">
      <div className="pay-box">
        <h2 className="pay-title">Enter Payment Details</h2>
        <form onSubmit={handlePay} className="pay-form">
          <div className="pay-input-group">
            <label className="pay-label">Cardholder Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="pay-input"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
            />
          </div>

          <div className="pay-input-group">
            <label className="pay-label">Card Number</label>
            <input
              type="text"
              required
              placeholder="1234 5678 9012 3456"
              className="pay-input"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>

          <div className="pay-input-group">
            <label className="pay-label">Expiry Date</label>
            <input
              type="text"
              required
              placeholder="MM/YY"
              className="pay-input"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div className="pay-input-group">
            <label className="pay-label">CVV</label>
            <input
              type="password"
              required
              placeholder="123"
              className="pay-input"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </div>

          <div className="space-y-2 mt-4">
            <button type="submit" className="pay-button">
              Pay Now
            </button>
            <button
              type="button"
              onClick={handleGoBack}
              className="pay-back-button"
            >
              Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
