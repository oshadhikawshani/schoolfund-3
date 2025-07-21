import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SchoolCreateCampaign() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    // Mock API logic
    const fundingGoal = parseInt(goal, 10);
    setTimeout(() => {
      if (fundingGoal < 50000) {
        setMessage("Campaign auto-approved and added!");
      } else {
        setMessage("Campaign submitted for principal approval.");
      }
      setSubmitting(false);
      setTimeout(() => {
        navigate("/school-main");
      }, 1800);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create New Campaign</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={80}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={4}
              maxLength={500}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Funding Goal (Rs)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              required
              min={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={e => setImage(e.target.files[0])}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Create Campaign"}
          </button>
        </form>
        {message && (
          <div className="mt-6 text-center text-lg font-medium text-green-600 animate-pulse">{message}</div>
        )}
      </div>
    </div>
  );
} 