import React from "react";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-200">
          {/* Header */}
          <div className="px-6 pt-6 text-center">
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            )}
          </div>

          {/* Body */}
          <div className="px-6 pb-6 pt-5">
            {/* give the inner form space to breathe */}
            <div className="space-y-5">{children}</div>
          </div>

          {/* Trust row */}
          <div className="px-6 pb-5">
            <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="i">🔒</span> Secure Donations
              </span>
              <span className="inline-flex items-center gap-1">
                ✅ PCI Compliant
              </span>
              <span className="inline-flex items-center gap-1">
                🎧 24/7 Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
