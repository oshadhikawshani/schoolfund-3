import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";          // <-- use shared axios instance
import AuthShell from "../components/AuthShell";

export default function DonorRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (form.password !== form.confirm) {
      setMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      const { data } = await api.post("/api/donors/register", payload, { withCredentials: true });

      // store token/user for immediate auth (optional; your flow can also redirect to login)
      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.donor) localStorage.setItem("donorData", JSON.stringify(data.donor));

      setMsg("Registration successful. Redirecting…");
      setTimeout(() => navigate("/donor/login"), 900);
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed. Try again.";
      setMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create Account" subtitle="Join up to support school campaigns">
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Enter your full name"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="donor@example.com"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Create password"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={onChange}
              placeholder="Confirm password"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="checkbox" required className="mt-1 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          I agree to the{" "}
          <a className="text-blue-600 hover:underline" href="#">
            Terms & Conditions
          </a>
        </label>

        {/* Message */}
        {msg && (
          <div
            className={`rounded-xl px-4 py-2 text-sm ${
              msg.toLowerCase().includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}
          >
            {msg}
          </div>
        )}

        {/* Primary CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>

        
     

        {/* Link */}
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/donor/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
