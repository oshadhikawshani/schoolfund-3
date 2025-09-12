import React, { useState } from 'react';
import api from '../lib/api';

export default function SpendingForm({ campaignId, schoolId, onSubmitted }) {
  const [dateOfSpending, setDateOfSpending] = useState('');
  const [transactionDestination, setTransactionDestination] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setNote('');
    try {
      const form = new FormData();
      form.append('dateOfSpending', dateOfSpending);
      form.append('transactionDestination', transactionDestination);
      form.append('amountSpent', amountSpent);
      form.append('description', description);
      form.append('schoolID', schoolId);
      for (const f of files) form.append('documents', f);
      await api.post(`/api/schools/${campaignId}/spending`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setNote('✅ Spending recorded');
      setDateOfSpending('');
      setTransactionDestination('');
      setAmountSpent('');
      setDescription('');
      setFiles([]);
      onSubmitted && onSubmitted();
    } catch (e) {
      const msg = e?.response?.data?.error || e.message;
      setNote(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Date of Spending</label>
        <input type="date" value={dateOfSpending} onChange={(e) => setDateOfSpending(e.target.value)} className="mt-1 block w-full border rounded-lg p-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Transaction Destination (Vendor)</label>
        <input type="text" value={transactionDestination} onChange={(e) => setTransactionDestination(e.target.value)} className="mt-1 block w-full border rounded-lg p-2" placeholder="e.g., ABC Bookshop" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Amount Spent (Rs.)</label>
        <input type="number" min="0" value={amountSpent} onChange={(e) => setAmountSpent(e.target.value)} className="mt-1 block w-full border rounded-lg p-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full border rounded-lg p-2" rows={3} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Transaction Slip (PDF/JPG, up to 5) - drag & drop or click</label>
        <div
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => { e.preventDefault(); setFiles(Array.from(e.dataTransfer.files || [])); }}
          className="mt-1 border-2 border-dashed rounded-lg p-4 text-center text-gray-600"
        >
          {files.length > 0 ? (
            <div className="text-sm">{files.length} file(s) ready</div>
          ) : (
            <div className="text-sm">Drop files here or click to select</div>
          )}
          <input type="file" multiple accept="application/pdf,image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="mt-2 block w-full" />
        </div>
      </div>
      <button type="submit" disabled={loading} className={`px-4 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{loading ? 'Saving...' : 'Save Spending'}</button>
      {note && (
        <div className={`text-sm p-2 rounded ${note.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{note}</div>
      )}
    </form>
  );
}


