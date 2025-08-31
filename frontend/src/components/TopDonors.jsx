// src/components/TopDonors.jsx
import React, { useEffect, useState } from "react";

// Mock fetch function – replace with real API call
const fetchTopDonors = async () => {
  return [
    { name: "Alice", totalAmount: 15000 },
    { name: "Bob", totalAmount: 12000 },
    { name: "Charlie", totalAmount: 11000 },
    { name: "David", totalAmount: 10000 },
    { name: "Eve", totalAmount: 9000 },
    { name: "Frank", totalAmount: 8000 },
    { name: "Grace", totalAmount: 7000 },
    { name: "Hannah", totalAmount: 6000 },
    { name: "Ivy", totalAmount: 5000 },
    { name: "Jack", totalAmount: 4000 },
  ];
};

const TopDonors = () => {
  const [topDonors, setTopDonors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTopDonors();
      setTopDonors(data);
    };
    fetchData();
  }, []);

  return (
    <section className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Top 10 Donors</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Donations</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topDonors.map((donor, index) => (
              <tr key={donor.name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donor.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs. {donor.totalAmount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TopDonors;
