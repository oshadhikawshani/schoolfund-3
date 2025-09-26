import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import LoginPage from "./pages/loginpage";
import RegPage from "./pages/regpage";
// import BrowseCampaigns from "./pages/dondashpg";
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
import DonorRegister from './pages/DonorRegister';

import DonorDashboard from './pages/DonorDashboard.jsx'

import BrowseCampaigns from "./pages/BrowseCampaigns";
import MonetaryDonationPage from "./pages/MonetaryDonationPage";
import NonMonetaryDonationPage from "./pages/NonMonetaryDonationPage";

import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentCancel from "./pages/PaymentCancel.jsx";


// Styles
import "./index.css";

//app layouts3
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegPage />} />
        <Route path="/school-request" element={<SchoolAccountForm />} />
        <Route path="/req-pending" element={<SchoolReqPending />} />
        <Route path="/admin-review" element={<AdminRequestPage />} />
        <Route path="/school-main" element={<SchoolMain />} />
        <Route path="/school-create-campaign" element={<SchoolCreateCampaign />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/principal-login" element={<PrincipalLogin />} />
        <Route path="/principal-dashboard" element={<PrincipalDashboard />} />
        <Route path="/school/profile" element={<SchoolProfileDashboard />} />

        <Route path="/donor/register" element={<DonorRegister />} />
        {/* <Route path="/donhistoryta" element={<DonHistoryTA />} /> */}
        <Route path="/donor-dashboard" element={<DonorDashboard />} />
        {/* <Route path="/donor/browse" element={<BrowseCampaigns />} /> */}
        <Route path="/donor/donate/:id" element={<MonetaryDonationPage />} />
        <Route path="/donor/nonmonetary/:id" element={<NonMonetaryDonationPage />} />
        <Route path="/donor/browseCampaigns" element={<BrowseCampaigns />} />
        <Route path="/donation/success" element={<PaymentSuccess />} />
        <Route path="/donation/cancel" element={<PaymentCancel />} />
      </Routes>
    </Router>
  );
}

export default App;
