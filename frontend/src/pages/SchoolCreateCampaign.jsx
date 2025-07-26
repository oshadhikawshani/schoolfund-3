import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from '../images/logoskl.jpg';

const categories = [
  { id: "cat1", name: "Infrastructure" },
  { id: "cat2", name: "Books & Supplies" },
  { id: "cat3", name: "Health & Nutrition" },
  { id: "cat4", name: "Events" },
];

export default function SchoolCreateCampaign() {
  const [selectedType, setSelectedType] = useState("Monetary");
  // Monetary form state
  const [titleM, setTitleM] = useState("");
  const [descriptionM, setDescriptionM] = useState("");
  const [goal, setGoal] = useState("");
  const [imageM, setImageM] = useState(null);
  const [categoryIDM, setCategoryIDM] = useState("");
  const [deadlineM, setDeadlineM] = useState("");
  const [allowDonorUpdatesM, setAllowDonorUpdatesM] = useState(false);
  const [messageM, setMessageM] = useState("");
  const [submittingM, setSubmittingM] = useState(false);
  // Non-Monetary form state
  const [titleN, setTitleN] = useState("");
  const [descriptionN, setDescriptionN] = useState("");
  const [quantityN, setQuantityN] = useState("");
  const [imageN, setImageN] = useState(null);
  const [categoryIDN, setCategoryIDN] = useState("");
  const [deadlineN, setDeadlineN] = useState("");
  const [allowDonorUpdatesN, setAllowDonorUpdatesN] = useState(false);
  const [messageN, setMessageN] = useState("");
  const [submittingN, setSubmittingN] = useState(false);
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);

  // Get schoolID from logged-in schoolData
  const schoolData = JSON.parse(localStorage.getItem("schoolData") || "{}");
  const schoolID = schoolData.SchoolRequestID;
  const schoolUsername = schoolData.Username || "School Username";

  useEffect(() => {
    async function fetchCampaigns() {
      if (!schoolID) return;
      try {
        const res = await fetch(`https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/campaigns/school/${schoolID}`);
        const data = await res.json();
        setCampaigns(Array.isArray(data) ? data : []);
      } catch (err) {
        setCampaigns([]);
      }
    }
    fetchCampaigns();
  }, [schoolID]);

  function generateCampaignID() {
    return (
      "CAMP_" +
      Math.random().toString(36).substring(2, 8).toUpperCase() +
      Date.now().toString().slice(-4)
    );
  }

  const handleImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve("");
      
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        reject(new Error("File size must be less than 5MB"));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Monetary form submit
  const handleSubmitM = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!titleM.trim()) {
      setMessageM("Please fill in the campaign title.");
      return;
    }
    if (!descriptionM.trim()) {
      setMessageM("Please fill in the campaign description.");
      return;
    }
    if (!goal || parseInt(goal, 10) <= 0) {
      setMessageM("Please enter a valid funding goal.");
      return;
    }
    if (!categoryIDM) {
      setMessageM("Please select a category.");
      return;
    }
    if (!deadlineM) {
      setMessageM("Please select a deadline.");
      return;
    }
    
    setSubmittingM(true);
    setMessageM("");
    try {
      const base64Image = await handleImageToBase64(imageM);
      const campaignID = generateCampaignID();
      const payload = {
        campaignID,
        campaignName: titleM.trim(),
        description: descriptionM.trim(),
        amount: parseInt(goal, 10),
        image: base64Image,
        schoolID,
        categoryID: categoryIDM,
        deadline: deadlineM,
        monetaryType: "Monetary",
      };
      const res = await fetch("https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/campaigns/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessageM("Campaign created!");
        setTimeout(() => navigate("/school-main"), 1800);
      } else {
        setMessageM(data.message || "Failed to create campaign.");
      }
    } catch (err) {
      setMessageM("Error: " + err.message);
    }
    setSubmittingM(false);
  };

  // Non-Monetary form submit
  const handleSubmitN = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!titleN.trim()) {
      setMessageN("Please fill in the campaign title.");
      return;
    }
    if (!descriptionN.trim()) {
      setMessageN("Please fill in the campaign description.");
      return;
    }
    if (!quantityN || parseInt(quantityN, 10) <= 0) {
      setMessageN("Please enter a valid quantity needed.");
      return;
    }
    if (!categoryIDN) {
      setMessageN("Please select a category.");
      return;
    }
    if (!deadlineN) {
      setMessageN("Please select a deadline.");
      return;
    }
    
    setSubmittingN(true);
    setMessageN("");
    try {
      const base64Image = await handleImageToBase64(imageN);
      const campaignID = generateCampaignID();
      const payload = {
        campaignID,
        campaignName: titleN.trim(),
        description: descriptionN.trim(),
        amount: parseInt(quantityN, 10),
        image: base64Image,
        schoolID,
        categoryID: categoryIDN,
        deadline: deadlineN,
        monetaryType: "Non-Monetary",
      };
      const res = await fetch("https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/campaigns/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessageN("Campaign created!");
        setTimeout(() => navigate("/school-main"), 1800);
      } else {
        setMessageN(data.message || "Failed to create campaign.");
      }
    } catch (err) {
      setMessageN("Error: " + err.message);
    }
    setSubmittingN(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-2">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-8 py-2 bg-white border-b border-gray-200 shadow-sm mb-8" style={{ minHeight: 60 }}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="School Fund Logo" className="h-10 w-auto object-contain" />
        </div>
        {/* Menu */}
        <div className="flex-1 flex justify-center">
          <ul className="flex gap-8 items-center text-base font-medium">
            <li className="text-black cursor-pointer hover:text-blue-600">Dashboard</li>
            <li className="text-blue-600 cursor-pointer font-semibold">Create Campaigns</li>
            <li className="text-black cursor-pointer hover:text-blue-600">Manage Expenses</li>
            <li className="text-black cursor-pointer hover:text-blue-600">Generate Reports</li>
          </ul>
        </div>
        {/* Right icons */}
        <div className="flex items-center gap-6">
          {/* Bell icon */}
          <span className="inline-flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </span>
          {/* User icon and info */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4v1H4v-1z" />
              </svg>
            </span>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-medium text-black">{schoolUsername}</span>
              <span className="text-xs text-gray-400">Administrator</span>
            </div>
          </div>
        </div>
      </nav>
      {/* Toggle */}
      <div className="flex mb-8 gap-2">
        <button
          type="button"
          className={`px-6 py-2 rounded-full font-semibold border transition-colors duration-200 ${selectedType === "Monetary" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-600"}`}
          onClick={() => setSelectedType("Monetary")}
        >
          Monetary
        </button>
        <button
          type="button"
          className={`px-6 py-2 rounded-full font-semibold border transition-colors duration-200 ${selectedType === "Non-Monetary" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-600"}`}
          onClick={() => setSelectedType("Non-Monetary")}
        >
          Non-Monetary
        </button>
      </div>
      {/* Forms side by side */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl justify-center">
        {/* Forms */}
        <div className="flex flex-col md:flex-row gap-8 flex-1">
          {/* Monetary Form */}
          <div className={`flex-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-300 transition-all duration-300 ${selectedType === "Monetary" ? "" : "opacity-50 blur-md pointer-events-none"}`}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-left">Create Monetary Campaign</h2>
            <form onSubmit={handleSubmitM} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Upgrade Classroom Furniture"
                  value={titleM}
                  onChange={e => setTitleM(e.target.value)}
                  required
                  maxLength={80}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Campaign Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide details about your campaign and its purpose..."
                  value={descriptionM}
                  onChange={e => setDescriptionM(e.target.value)}
                  required
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-400 text-right">{descriptionM.length}/500 Words</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Funding Goal (LKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rs. 50,000"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  required
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Campaign Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-6 px-2 text-center cursor-pointer hover:border-blue-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a1 1 0 01-1-1v-4h6v4a1 1 0 01-1 1z" /></svg>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                    id="campaign-image-upload-m"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        // Check file size
                        const maxSize = 5 * 1024 * 1024; // 5MB
                        if (file.size > maxSize) {
                          alert("File size must be less than 5MB. Please choose a smaller file.");
                          e.target.value = ''; // Clear the input
                          setImageM(null);
                          return;
                        }
                        setImageM(file);
                      } else {
                        setImageM(null);
                      }
                    }}
                  />
                  <label htmlFor="campaign-image-upload-m" className="block cursor-pointer text-gray-500 text-sm">
                    Drag and drop files here or click to browse<br />
                    <span className="text-xs text-gray-400">Supports: JPG, PNG, PDF</span><br />
                    <span className="text-xs text-red-500 font-semibold">Maximum file size: 5MB</span>
                  </label>
                  {imageM && <div className="mt-2 text-xs text-green-600">{imageM.name}</div>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={categoryIDM}
                  onChange={e => setCategoryIDM(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    value={deadlineM}
                    onChange={e => setDeadlineM(e.target.value)}
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </span>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="allowDonorUpdatesM"
                  checked={allowDonorUpdatesM}
                  onChange={e => setAllowDonorUpdatesM(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="allowDonorUpdatesM" className="ml-2 text-xs text-gray-600">
                  Allow donors to receive updates about this campaign<br />
                  <span className="text-gray-400">Donors will be able to opt-in to receive progress updates via email</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full text-base transition-colors duration-200 disabled:opacity-60 mt-2"
                disabled={submittingM}
              >
                {submittingM ? "Submitting..." : "Create Campaign"}
              </button>
            </form>
            {messageM && (
              <div className="mt-6 text-center text-lg font-medium text-green-600 animate-pulse">{messageM}</div>
            )}
          </div>
          {/* Non-Monetary Form */}
          <div className={`flex-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-300 transition-all duration-300 ${selectedType === "Non-Monetary" ? "" : "opacity-50 blur-md pointer-events-none"}`}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-left">Create Non-Monetary Campaign</h2>
            <form onSubmit={handleSubmitN} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Upgrade Classroom Furniture"
                  value={titleN}
                  onChange={e => setTitleN(e.target.value)}
                  required
                  maxLength={80}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Campaign Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide details about your campaign and its purpose..."
                  value={descriptionN}
                  onChange={e => setDescriptionN(e.target.value)}
                  required
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-400 text-right">{descriptionN.length}/500 Words</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Quantity Needed <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 50 books, 20 chairs, 100 uniforms"
                  value={quantityN}
                  onChange={e => setQuantityN(e.target.value)}
                  required
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Campaign Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-6 px-2 text-center cursor-pointer hover:border-blue-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a1 1 0 01-1-1v-4h6v4a1 1 0 01-1 1z" /></svg>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                    id="campaign-image-upload-n"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        // Check file size
                        const maxSize = 5 * 1024 * 1024; // 5MB
                        if (file.size > maxSize) {
                          alert("File size must be less than 5MB. Please choose a smaller file.");
                          e.target.value = ''; // Clear the input
                          setImageN(null);
                          return;
                        }
                        setImageN(file);
                      } else {
                        setImageN(null);
                      }
                    }}
                  />
                  <label htmlFor="campaign-image-upload-n" className="block cursor-pointer text-gray-500 text-sm">
                    Drag and drop files here or click to browse<br />
                    <span className="text-xs text-gray-400">Supports: JPG, PNG, PDF</span><br />
                    <span className="text-xs text-red-500 font-semibold">Maximum file size: 5MB</span>
                  </label>
                  {imageN && <div className="mt-2 text-xs text-green-600">{imageN.name}</div>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={categoryIDN}
                  onChange={e => setCategoryIDN(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    value={deadlineN}
                    onChange={e => setDeadlineN(e.target.value)}
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </span>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="allowDonorUpdatesN"
                  checked={allowDonorUpdatesN}
                  onChange={e => setAllowDonorUpdatesN(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="allowDonorUpdatesN" className="ml-2 text-xs text-gray-600">
                  Allow donors to receive updates about this campaign<br />
                  <span className="text-gray-400">Donors will be able to opt-in to receive progress updates via email</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full text-base transition-colors duration-200 disabled:opacity-60 mt-2"
                disabled={submittingN}
              >
                {submittingN ? "Submitting..." : "Create Campaign"}
              </button>
            </form>
            {messageN && (
              <div className="mt-6 text-center text-lg font-medium text-green-600 animate-pulse">{messageN}</div>
            )}
          </div>
        </div>
        {/* Sidebar: Recent Campaigns & Campaigns Tips */}
        <div className="w-full md:w-[350px] flex flex-col gap-8">
          {/* Recent Campaigns */}
          <div className="bg-white rounded-2xl shadow p-5 border border-gray-300 mb-4">
            <h3 className="text-lg font-bold mb-4">Recent Campaigns</h3>
            {campaigns.length === 0 ? (
              <div className="text-gray-400 text-sm">No campaigns found.</div>
            ) : (
              campaigns.slice(0, 3).map((c, i) => {
                const percent = c.amount ? Math.round(((c.raised || 0) / c.amount) * 100) : 0;
                const status = percent >= 100 ? "Completed" : "Ongoing";
                const color = percent >= 100 ? "bg-green-500" : percent >= 90 ? "bg-blue-700" : percent >= 40 ? "bg-blue-400" : "bg-blue-300";
                return (
                  <div key={i} className="mb-5 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 text-base">{c.campaignName}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{status}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">Progress</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mb-1">
                      <div className={`${color} h-2 rounded-full`} style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Rs.{(c.raised || 0).toLocaleString()} raised of Rs.{(c.amount || 0).toLocaleString()}</span>
                      {/* <span className="text-blue-500 cursor-pointer hover:underline">Edit</span> */}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Campaigns Tips */}
          <div className="bg-white rounded-2xl shadow p-5 border border-gray-300">
            <h3 className="text-lg font-bold mb-4">Campaigns Tips</h3>
            <ul className="space-y-4">
              {[
                "Use a clear, Specific title that describes your funding need.",
                "Include detailed information about how the funds will be used.",
                "Add high-quality images that show the need or project.",
                "Set a realistic funding goal and dealine"
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                  <span className="mt-0.5 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 