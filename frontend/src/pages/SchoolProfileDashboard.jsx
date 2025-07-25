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
      fetch(`https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/campaigns/school/${schoolData.SchoolRequestID}`)
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
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
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-blue-700">Rs.{stats.totalDonations.toLocaleString()}</span>
                <p className="text-blue-600 text-sm mt-1 font-medium">Total Donations</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-blue-700">{campaigns.length}</span>
                <p className="text-blue-600 text-sm mt-1 font-medium">Active Campaigns</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-blue-700">Rs.{stats.monthlyDonations.toLocaleString()}</span>
                <p className="text-blue-600 text-sm mt-1 font-medium">Monthly Donations</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-blue-700">Rs.{stats.pendingExpenses.toLocaleString()}</span>
                <p className="text-blue-600 text-sm mt-1 font-medium">Pending Expenses</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics and Top Donors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">

              <h3 className="text-xl font-bold text-gray-800">Donation Analytics</h3>
            </div>
            <div className="h-48 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500 font-medium">Chart Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">

              <h3 className="text-xl font-bold text-gray-800">Top Donors</h3>
            </div>
            <div className="space-y-3">
              {topDonors && topDonors.length > 0 ? (
                topDonors.map((donor, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {donor.name ? donor.name[0].toUpperCase() : "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{donor.name || "Unknown Donor"}</p>
                      <p className="text-sm text-gray-500">Rs. {donor.amount ? donor.amount.toLocaleString() : "0"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">Coming in Sprint 2</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Campaigns and Recent Expenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h3 className="text-xl font-bold text-gray-800">Active Campaigns</h3>
              </div>
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center"
                onClick={() => navigate("/school-create-campaign")}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Campaign
              </button>
            </div>
            <div className="space-y-4">
              {campaigns && campaigns.length > 0 ? (
                campaigns.map((c, idx) => {
                  const percent = c.amount ? Math.round(((c.raised || 0) / c.amount) * 100) : 0;
                  return (
                    <div key={idx} className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-102">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold text-gray-900">{c.campaignName || c.name || "Campaign"}</h4>
                        <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                          {c.status || "Active"}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600 font-medium">Progress</span>
                          <span className="text-gray-800 font-bold">{percent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-gray-600 text-sm font-medium">
                        Rs {(c.raised || 0).toLocaleString()} raised of Rs.{(c.amount || 0).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-gray-500 font-medium text-lg">No active campaigns</p>
                  <p className="text-gray-400 text-sm mt-1">Create your first campaign to get started</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">

              <h3 className="text-xl font-bold text-gray-800">Recent Expenses</h3>
            </div>
            <div className="space-y-3">
              {expenses && expenses.length > 0 ? (
                expenses.map((e, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{e.title || e.name || "Expense"}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${e.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                        }`}>
                        {e.status || "Status"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 font-medium text-lg">Coming Soon</p>
                  <p className="text-gray-400 text-sm mt-1">Expense tracking will be available soon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#18104B] to-[#2d1b6b] text-white py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="font-bold mb-3 text-lg">Connecting donors with schools</div>
            <div className="mb-3 text-gray-300">In need to create better educational opportunities for all students.</div>
          </div>
          <div>
            <div className="font-bold mb-3 text-lg">Quick Links</div>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Browse Campaigns</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Start a Campaign</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">How it works</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Success Stories</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">About Us</li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-3 text-lg">Resources</div>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Help Center</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Blog</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Contact Support</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Donation Policy</li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-3 text-lg">Contact Us</div>
            <div className="space-y-2 text-gray-300">
              <div>123 Kottawa, Athurugiriya Road, Pannipitiya</div>
              <div>support@schoolfundraising.org</div>
              <div>+94 112 889 844</div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-8 pt-6 border-t border-gray-700">
          2023 School Fundraising Platform. All rights reserved. | Privacy Policy | Terms Of Service | Cookie Policy
        </div>
      </footer>
    </div>
  );
} 