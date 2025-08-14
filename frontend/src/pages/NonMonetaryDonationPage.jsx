import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api"; // <-- use shared axios with Authorization header

export default function NonMonetaryDonationPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [file, setFile] = useState(null); // single file, backend expects "photo"
  const [quantity, setQuantity] = useState(1); // Added quantity state
  const [deliveryMethod, setDeliveryMethod] = useState("handover");
  const [courierRef, setCourierRef] = useState("");
  const [deadlineDate, setDeadlineDate] = useState(""); // backend field name
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/api/campaigns/${id}`);
        if (mounted) setCampaign(res.data);
      } catch {
        if (mounted) setNote("Could not load campaign.");
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setNote("At least one photo is required");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);               // <-- must be "photo"
    formData.append("campaignID", id);            // <-- capital ID
    formData.append("quantity", quantity);        // Added quantity
    formData.append("deliveryMethod", deliveryMethod);
    if (deliveryMethod === "courier" && courierRef) {
      formData.append("courierRef", courierRef);
    }
    if (deadlineDate) formData.append("deadlineDate", deadlineDate);
    if (notes) formData.append("notes", notes);

    setLoading(true);
    setNote("");
    try {
      const { data } = await api.post(`/api/donations/nonmonetary`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setNote(`✅ ${data.message}${data.collectionDeadline ? ` — Collect by: ${new Date(data.collectionDeadline).toLocaleString()}` : ""}`);
    } catch (err) {
      setNote(err?.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!campaign) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-2">{campaign.campaignName || campaign.title}</h1>
      <p className="text-gray-600 mb-4">{campaign.description}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Upload Item Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 rounded w-full"
            required
          />
          <p className="text-xs text-slate-500 mt-1">Max 5MB; PNG/JPG/WEBP</p>
        </div>

        <div>
          <label className="block font-semibold">Quantity of Items</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="border p-2 rounded w-full"
            min="1"
            required
            placeholder="How many items are you donating?"
          />
          <p className="text-xs text-slate-500 mt-1">Enter the number of items you're donating</p>
        </div>

        <div>
          <label className="block font-semibold">Delivery Method</label>
          <select
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="handover">Handover to school</option>
            <option value="courier">Courier to school address</option>
            <option value="pickup">Request school pickup</option>
          </select>
        </div>

        {deliveryMethod === "courier" && (
          <div>
            <label className="block font-semibold">Courier reference / tracking</label>
            <input
              value={courierRef}
              onChange={(e) => setCourierRef(e.target.value)}
              className="border p-2 rounded w-full"
              placeholder="Tracking number or courier name"
            />
          </div>
        )}

        <div>
          <label className="block font-semibold">Preferred / Deadline Date & Time</label>
          <input
            type="datetime-local"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
            placeholder="Leave a note..."
          />
        </div>

        {note && (
          <div
            className={`rounded px-4 py-2 text-sm ${
              note.startsWith("✅")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {note}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
        >
          {loading ? "Submitting…" : "Submit Donation"}
        </button>
      </form>
    </div>
  );
}
