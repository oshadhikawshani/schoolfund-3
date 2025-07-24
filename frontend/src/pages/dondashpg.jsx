import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bagdash from "../images/bagdash.jpg";
import classroomdash from "../images/classroomdash.jpg";
import disabilitiesdash from "../images/disabilitiesdash.jpg";
import healthcheckdash from "../images/healthcheckdash.jpg";
import hungerdash from "../images/hungerdash.jpg";
import nochairdash from "../images/nochairdash.jpg";
import nowaterdash from "../images/nowaterdash.png";
import seminardash from "../images/seminardash.jpg";
import uniformdash from "../images/uniformdash.png";
import logoskl from "../images/logoskl.jpg";

const campaignsData = [
  { img: bagdash, title: "Backpack Donation", desc: "Provide backpacks to underprivileged children.", raised: 5800, goal: 10000, days: 6 },
  { img: classroomdash, title: "Classroom Upgrade", desc: "Renovate old classrooms for better learning.", raised: 12540, goal: 25000, days: 18 },
  { img: disabilitiesdash, title: "Support for Disabled Students", desc: "Assist differently-abled students.", raised: 3200, goal: 10000, days: 3 },
  { img: healthcheckdash, title: "Health Check Program", desc: "Monthly health screenings in schools.", raised: 5200, goal: 8000, days: 12 },
  { img: hungerdash, title: "Nutrition for All", desc: "Provide daily meals to children in need.", raised: 18750, goal: 30000, days: 25 },
  { img: nochairdash, title: "Chair Drive", desc: "Purchase chairs for overcrowded classrooms.", raised: 14200, goal: 20000, days: 6 },
  { img: nowaterdash, title: "Water for Schools", desc: "Install clean water systems.", raised: 9800, goal: 15000, days: 9 },
  { img: seminardash, title: "Education Seminars", desc: "Train teachers with modern teaching techniques.", raised: 12200, goal: 16000, days: 14 },
  { img: uniformdash, title: "Uniform Distribution", desc: "Provide uniforms to students in rural schools.", raised: 7200, goal: 12000, days: 4 }
];

const categories = ["Books & Education", "School Meals", "Sanitation", "Sports Equipment", "Technology", "Infrastructure"];
const times = ["Urgent (<7 days)", "This Month", "Long-term"];

export default function DonorDashboard() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const campaignsPerPage = 9;
  const start = (page - 1) * campaignsPerPage;
  const end = start + campaignsPerPage;
  const campaigns = campaignsData.slice(start, end);

  const handleDonate = () => {
    navigate("/payment");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar - Filter Campaigns */}
      <div className="w-80 bg-white shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Filter Campaigns</h3>

        {/* Categories */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">CATEGORIES</p>
          {categories.map((cat, idx) => (
            <label key={idx} className="flex items-center mb-2 cursor-pointer">
              <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-gray-700">{cat}</span>
            </label>
          ))}
        </div>

        {/* Time Remaining */}
        <div>
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">TIME REMAINING</p>
          {times.map((t, idx) => (
            <label key={idx} className="flex items-center mb-2 cursor-pointer">
              <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-gray-700">{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Back Button */}
        <div className="mb-4 mt-4">
          <BackButton />
        </div>
        {/* Header Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
          <div className="flex flex-col items-center space-y-4">
            <img src={logoskl} alt="School Fund Logo" className="h-16 w-auto" />
            <nav className="flex space-x-8">
              <Link to="/browse" className="text-gray-700 hover:text-blue-600 font-medium">Browse Campaigns</Link>
              <Link to="/donhistoryta" className="text-gray-700 hover:text-blue-600 font-medium">My Donations</Link>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
            </nav>
          </div>
        </div>

        {/* Blue Banner */}
        <div className="bg-[#1642f284] text-[#0300ce] px-8 py-3">
          <p className="text-center font-medium">
            <strong>3,500+</strong> donors contributed this month! Join them in making a difference.
          </p>
        </div>

        {/* Main Content */}
        <div className="px-8 py-6">
          {/* Search Bar */}
          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-2xl">
              <input
                type="text"
                placeholder="Search by school name, campaign, or location..."
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Campaigns Section */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Campaigns</h2>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {campaigns.map((c, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img src={c.img} alt={c.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{c.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{c.desc}</p>
                  <div className="mb-3">
                    <p className="text-gray-800">
                      <strong>Rs. {c.raised.toLocaleString()}</strong> raised
                    </p>
                    <p className="text-gray-500 text-sm">of Rs. {c.goal.toLocaleString()} goal</p>
                  </div>
                  <p className="text-orange-600 font-medium text-sm mb-4">{c.days} days left</p>
                  <button
                    onClick={handleDonate}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Donate Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === num
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
