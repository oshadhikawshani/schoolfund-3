import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import LoginPage from "./pages/loginpage";
import RegPage from "./pages/regpage";
import DonorDashboard from "./pages/dondashpg";
import DonHistoryTA from "./pages/donhistoryta";
import SchoolAccountForm from "./pages/sklreqpg";
import AdminRequestPage from "./pages/adminreqpg";
import PaymentPage from "./pages/paymentpage";

// Styles
import "./index.css";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegPage />} />
        <Route path="/donor-dashboard" element={<DonorDashboard />} />
        <Route path="/donhistoryta" element={<DonHistoryTA />} />
        <Route path="/school-request" element={<SchoolAccountForm />} />
        <Route path="/admin-review" element={<AdminRequestPage />} /> {/* ✅ New route */}
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
