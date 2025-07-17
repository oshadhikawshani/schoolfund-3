import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ include useNavigate
import "../index.css";
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
  const navigate = useNavigate(); // ✅ initialize
  const campaignsPerPage = 9;
  const start = (page - 1) * campaignsPerPage;
  const end = start + campaignsPerPage;
  const campaigns = campaignsData.slice(start, end);

  const handleDonate = () => {
    navigate("/payment"); // ✅ redirect to payment page
  };

  return (
    <div className="dash-container">
      <div className="dash-sidebar">
        <h3 className="dash-sidebar-title">Filter Campaigns</h3>
        <p className="dash-filter-heading">CATEGORIES</p>
        {categories.map((cat, idx) => (
          <label key={idx} className="dash-filter-checkbox">
            <input type="checkbox" /> {cat}
          </label>
        ))}

        <p className="dash-filter-heading">TIME REMAINING</p>
        {times.map((t, idx) => (
          <label key={idx} className="dash-filter-checkbox">
            <input type="checkbox" /> {t}
          </label>
        ))}
      </div>

      <div className="dash-main-content">
        <div className="dash-header">
          <img src={logoskl} alt="School Fund Logo" className="dash-logo" />
          <nav className="dash-nav">
            <Link to="/browse" className="dash-nav-link">Browse Campaigns</Link>
            <Link to="/donhistoryta" className="dash-nav-link">My Donations</Link>
            <Link to="/dashboard" className="dash-nav-link">Dashboard</Link>
          </nav>
        </div>

        <div className="dash-banner">
          <p><strong>3,500+</strong> donors contributed this month! Join them in making a difference.</p>
        </div>

        <input
          type="text"
          placeholder="Search by school name, campaign, or location..."
          className="dash-search-bar"
        />

        <h2 className="dash-campaign-heading">Active Campaigns</h2>
        <div className="dash-campaign-grid">
          {campaigns.map((c, i) => (
            <div className="dash-campaign-card" key={i}>
              <img src={c.img} alt={c.title} className="dash-campaign-img" />
              <h3>{c.title}</h3>
              <p className="dash-desc">{c.desc}</p>
              <p><strong>Rs. {c.raised}</strong> raised<br /><span className="dash-goal">of Rs. {c.goal} goal</span></p>
              <p className="dash-days-left">{c.days} days left</p>
              <button onClick={handleDonate} className="dash-donate-button">Donate Now</button>
            </div>
          ))}
        </div>

        <div className="dash-pagination">
          {[1, 2, 3].map((num) => (
            <button key={num} onClick={() => setPage(num)} className={page === num ? "dash-page-btn active" : "dash-page-btn"}>
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
