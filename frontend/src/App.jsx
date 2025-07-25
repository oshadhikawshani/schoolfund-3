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
import SchoolReqPending from "./pages/SchoolReqPending";
import SchoolMain from "./pages/SchoolMain";
import SchoolCreateCampaign from "./pages/SchoolCreateCampaign";
import PrincipalLogin from './pages/principalLogin';
import PrincipalDashboard from "./pages/principalDashboard";
import SchoolProfileDashboard from "./pages/SchoolProfileDashboard";

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
        <Route path="/req-pending" element={<SchoolReqPending />} />
        <Route path="/admin-review" element={<AdminRequestPage />} />
        <Route path="/school-main" element={<SchoolMain />} />
        <Route path="/school-create-campaign" element={<SchoolCreateCampaign />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/principal-login" element={<PrincipalLogin />} />
        <Route path="/principal-dashboard" element={<PrincipalDashboard />} />
        <Route path="/school/profile" element={<SchoolProfileDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
