import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCampaigns as apiFetchCampaigns } from "../api/campaigns";

// 👇 use the single image you put in /frontend/public
const FALLBACK = "/placeholder.jpeg";

export default function BrowseCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(""); // "monetary" | "non-monetary" | ""
  const [categoryFilter, setCategoryFilter] = useState([]);
  const navigate = useNavigate();

  const categories = [
    "Books",
    "School Meals",
    "Sanitation",
    "Sports",
    "Technology",
    "Infrastructure",
  ];

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter.length > 0) params.categories = categoryFilter.join(",");
      const data = await apiFetchCampaigns(params);
      setCampaigns(data);
    } catch (err) {
      console.error("Error fetching campaigns", err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTypeChange = (value) => {
    setTypeFilter((prev) => (prev === value ? "" : value));
  };

  const handleCheckbox = (category) => {
    setCategoryFilter((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-4">
      {/* Left Sidebar Filters */}
      <div className="w-1/4 bg-white p-4 rounded shadow">
        <h2 className="font-bold text-lg mb-3">Filter Campaigns</h2>
        <div className="mb-4">
          <label className="font-semibold block mb-1">Type</label>
          <label className="block">
            <input
              type="checkbox"
              checked={typeFilter === "monetary"}
              onChange={() => handleTypeChange("monetary")}
            />
            <span className="ml-2">Monetary</span>
          </label>
          <label className="block">
            <input
              type="checkbox"
              checked={typeFilter === "non-monetary"}
              onChange={() => handleTypeChange("non-monetary")}
            />
            <span className="ml-2">Non‑Monetary</span>
          </label>
        </div>
        <div>
          <label className="font-semibold block mb-1">Categories</label>
          {categories.map((cat) => (
            <label key={cat} className="block">
              <input
                type="checkbox"
                checked={categoryFilter.includes(cat)}
                onChange={() => handleCheckbox(cat)}
              />
              <span className="ml-2">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Right Campaigns Grid */}
      <div className="w-3/4 pl-6">
        {loading ? (
          <div className="text-center text-gray-600 p-10">Loading…</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center text-gray-600 p-10">
            No campaigns match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <div key={c._id} className="bg-white p-4 rounded shadow">
                <img
                  // 👇 try real fields, else fallback to the one local image
                  src={c.imageUrl || c.image || c.banner || FALLBACK}
                  alt={c.campaignName || c.title || "Campaign"}
                  onError={(e) => {
                    // swap to fallback once if the URL is broken
                    if (e.currentTarget.dataset.fallback !== "1") {
                      e.currentTarget.src = FALLBACK;
                      e.currentTarget.dataset.fallback = "1";
                    }
                  }}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <h3 className="text-lg font-bold mb-1">
                  {c.campaignName || c.title}
                </h3>
                <p className="text-sm text-gray-600">{c.description}</p>
                <div className="mt-2 text-blue-600 font-semibold">
                  Goal: Rs. {c.amount || c.goal || 0}
                </div>
                <button
                  onClick={() => navigate(`/donor/donate/${c._id}`)}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                >
                  Donate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
