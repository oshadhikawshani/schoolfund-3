import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logoskl.jpg";
import landingBg from "../images/landing-bg.jpg";
import bagdash from "../images/bagdash.jpg";
import classroomdash from "../images/classroomdash.jpg";
import disabilitiesdash from "../images/disabilitiesdash.jpg";
import healthcheckdash from "../images/healthcheckdash.jpg";


export default function SchoolMain() {
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedSchoolData = localStorage.getItem("schoolData");
    if (storedSchoolData) {
      setSchoolData(JSON.parse(storedSchoolData));
    } else {
      navigate("/");
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("schoolData");
    localStorage.removeItem("schoolToken");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!schoolData) {
    return null;
  }

  // Hardcoded campaigns for this school (replace with API later)
  const campaigns = [
    {
      img: bagdash,
      title: "Backpack Drive",
      desc: "Provide backpacks to students in need.",
      raised: 3500,
      goal: 10000,
      days: 10
    },
    {
      img: classroomdash,
      title: "Classroom Renovation",
      desc: "Renovate and equip classrooms for better learning.",
      raised: 8000,
      goal: 20000,
      days: 20
    },
    {
      img: healthcheckdash,
      title: "Health Check Camp",
      desc: "Organize free health checkups for students.",
      raised: 4200,
      goal: 8000,
      days: 5
    },
    {
      img: disabilitiesdash,
      title: "Support for Disabled Students",
      desc: "Assist differently-abled students with resources and support.",
      raised: 2500,
      goal: 7000,
      days: 7
    },


  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-64 md:h-80 flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${landingBg})` }}
      >
        <div className="absolute inset-0 bg-[#0091d9] bg-opacity-40"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <img
            src={logo}
            alt="School Logo"
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg mb-4"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {schoolData.SchoolName || "School Name"}
          </h1>
          <p className="mt-2 text-lg md:text-xl text-blue-100 italic font-medium drop-shadow">
            "Empowering Minds, Shaping Futures"
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 z-20"
        >
          Logout
        </button>
        <button
          onClick={() => navigate('/principal-login')}
          className="absolute top-4 right-28 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 z-20"
        >
          Principal Login
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* School Info Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">About Our School</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">School Name</label>
                <p className="mt-1 text-base text-gray-900 font-semibold">{schoolData.SchoolName || schoolData.PrincipalName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Principal</label>
                <p className="mt-1 text-base text-gray-900">{schoolData.PrincipalName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-base text-gray-900">{schoolData.Email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <p className="mt-1 text-base text-gray-900">{schoolData.ContactNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-base text-gray-900">{schoolData.Address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-base text-gray-900">{schoolData.Username}</p>
              </div>
            </div>
          </div>
          {/* School Motto/Description */}
          <div className="mt-8 text-center">
            <p className="text-lg text-gray-700 italic">
              Our mission is to nurture every student to reach their full potential and become responsible citizens of tomorrow.
            </p>
          </div>
        </div>

        {/* Campaigns Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center w-full md:w-auto">Our Campaigns</h2>
            <button
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-base font-medium shadow transition-colors duration-200"
              onClick={() => navigate('/school-create-campaign')}
            >
              + Add Campaign
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((c, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img src={c.img} alt={c.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{c.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{c.desc}</p>
                  <div className="mb-3">
                    <p className="text-gray-800">
                      <strong>Rs {c.raised.toLocaleString()}</strong> raised
                    </p>
                    <p className="text-gray-500 text-sm">of Rs {c.goal.toLocaleString()} goal</p>
                  </div>
                  <p className="text-blue-600 font-medium text-sm mb-2">{c.days} days left</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (c.raised / c.goal) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4">
          <button
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            onClick={() => navigate("/school/profile")}
          >
            Manage Profile
          </button>
        </div>
      </main>
    </div>
  );
} 