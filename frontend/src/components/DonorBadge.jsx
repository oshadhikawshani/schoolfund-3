// src/components/DonorBadge.jsx
import React from "react";

const DonorBadge = ({ icon, label }) => {
  return (
    <div className="flex flex-col items-center text-center space-y-1 p-2 bg-gray-100 rounded-lg shadow-sm">
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
};

export default DonorBadge;
