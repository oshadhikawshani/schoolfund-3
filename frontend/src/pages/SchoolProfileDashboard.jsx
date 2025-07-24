import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import schoolfundLogo from "../images/logoskl.jpg";

export default function SchoolProfileDashboard() {
  const [school, setSchool] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    monthlyDonations: 0,
    pendingExpenses: 0,
  });
  const [topDonors, setTopDonors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get school data from localStorage (support both keys)
    const schoolData = JSON.parse(localStorage.getItem("schoolData") || localStorage.getItem("school") || "{}");
    if (schoolData && schoolData.SchoolRequestID) {
      setSchool(schoolData);
      // Fetch campaigns for this school
      fetch(`http://localhost:4000/api/campaigns/school/${schoolData.SchoolRequestID}`)
        .then(res => res.json())
        .then(data => {
          setCampaigns(data);
          localStorage.setItem("campaigns", JSON.stringify(data));
        })
        .catch(err => {
          setCampaigns([]);
          console.error("Failed to fetch campaigns:", err);
        });
    }
    // Adjust keys to match your localStorage structure
    const statsData = JSON.parse(localStorage.getItem("stats"));
    const donorsData = JSON.parse(localStorage.getItem("topDonors"));
    const expensesData = JSON.parse(localStorage.getItem("expenses"));

    if (statsData) setStats(statsData);
    if (donorsData) setTopDonors(donorsData);
    if (expensesData) setExpenses(expensesData);
  }, []);

  const schoolName = school?.Username || school?.name || "School Name";
  const schoolInitial = schoolName[0] || "S";
  const schoolLogoSrc = school?.SchoolLogo ? school.SchoolLogo : schoolfundLogo;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xl text-blue-700">
            <img src={schoolfundLogo} alt="SchoolFund Logo" className="w-12 h-12 rounded-full object-cover" />
          </div>
          <nav className="flex gap-8 text-base font-medium flex-grow justify-center">
            <a href="#" className="flex items-center text-blue-600">
              Dashboard
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600" onClick={e => { e.preventDefault(); navigate('/school-create-campaign'); }}>Create Campaigns</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Manage Expenses</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Generate Reports</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-800">{schoolName}</span>
          <img
            src={schoolLogoSrc}
            alt="School Logo"
            className="w-10 h-10 bg-gray-300 rounded-full object-cover"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back
          </button>
        </div>
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-2xl font-bold">Rs.{stats.totalDonations}</span>
            <span className="text-gray-500 text-sm mt-1">Total Donations</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-2xl font-bold">{campaigns.length}</span>
            <span className="text-gray-500 text-sm mt-1">Active Campaigns</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-2xl font-bold">Rs.{stats.monthlyDonations}</span>
            <span className="text-gray-500 text-sm mt-1">Monthly Donations</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-2xl font-bold">Rs.{stats.pendingExpenses}</span>
            <span className="text-gray-500 text-sm mt-1">Pending Expenses</span>
          </div>
        </div>

        {/* Analytics and Top Donors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
            <div className="font-semibold mb-2">Donation Analytics</div>
            <div className="h-40 flex items-center justify-center text-gray-400">[Chart Placeholder]</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold mb-2">Top Donors</div>
            <ul className="space-y-2">
              {topDonors && topDonors.length > 0 ? (
                topDonors.map((donor, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {donor.name ? donor.name[0] : "?"}
                    </span>
                    {donor.name || "Unknown Donor"}
                  </li>
                ))
              ) : (
                <li className="text-gray-400">Implemented in Sprint 2</li>
              )}
            </ul>
          </div>
        </div>

        {/* Active Campaigns and Recent Expenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold">Active Campaigns</div>
              <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={() => navigate("/school-create-campaign")}>Add Campaign</button>
            </div>
            <div className="space-y-4">
              {campaigns && campaigns.length > 0 ? (
                campaigns.map((c, idx) => {
                  const percent = c.amount ? Math.round(((c.raised || 0) / c.amount) * 100) : 0;
                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-lg font-semibold text-gray-900">{c.campaignName || c.name || "Campaign"}</span>
                        <span className="bg-green-400 text-white px-4 py-1 rounded-full text-sm font-semibold">{c.status || "Active"}</span>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-500 font-medium">Progress</span>
                        <span className="text-gray-700 font-semibold">{percent} %</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div className="bg-blue-700 h-3 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                      <div className="text-gray-500 text-sm font-medium">
                        Rs {(c.raised || 0).toLocaleString()} raised of Rs.{(c.amount || 0).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-400">No active campaigns</div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold">Recent Expenses</div>
              {/* <button className="bg-blue-600 text-white px-4 py-1 rounded">Add Expense</button> */}
            </div>
            <div className="space-y-4">
              {expenses && expenses.length > 0 ? (
                expenses.map((e, idx) => (
                  <div key={idx} className="bg-gray-100 rounded p-3 flex flex-col">
                    <span>{e.title || e.name || "Expense"}</span>
                    <span className={`text-xs ${e.status === "Pending" ? "text-yellow-600" : "text-green-600"}`}>{e.status || "Status"}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">To be implemented</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#18104B] text-white py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="font-bold mb-2">Connecting donors with schools</div>
            <div className="mb-2">in need to create better educational opportunities for all students.</div>
            <div className="flex gap-2 mt-2">
              <span className="bg-white text-[#18104B] rounded-full w-7 h-7 flex items-center justify-center">F</span>
              <span className="bg-white text-[#18104B] rounded-full w-7 h-7 flex items-center justify-center">I</span>
              <span className="bg-white text-[#18104B] rounded-full w-7 h-7 flex items-center justify-center">X</span>
            </div>
          </div>
          <div>
            <div className="font-bold mb-2">Quick Links</div>
            <ul className="space-y-1">
              <li>Browse Campaigns</li>
              <li>Start a Campaign</li>
              <li>How it works</li>
              <li>Success Stories</li>
              <li>About Us</li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-2">Resources</div>
            <ul className="space-y-1">
              <li>Help Center</li>
              <li>Blog</li>
              <li>Contact Support</li>
              <li>Donation Policy</li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-2">Contact Us</div>
            <div>123 Stublubly, Wijerama Road, Colombo</div>
            <div>support@schoolfundraising.org</div>
            <div>+94 112 889 844</div>
            <div className="mt-2">Secure Payment Methods</div>
            <div className="flex gap-2 mt-1">
              <span className="bg-white text-[#18104B] rounded w-10 h-6 flex items-center justify-center">Visa</span>
              <span className="bg-white text-[#18104B] rounded w-10 h-6 flex items-center justify-center">MC</span>
              <span className="bg-white text-[#18104B] rounded w-10 h-6 flex items-center justify-center">Pay</span>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-300 mt-6">2023 School Fundraising Platform. All rights reserved. | Privacy Policy | Terms Of Service | Cookie Policy</div>
      </footer>
    </div>
  );
} 