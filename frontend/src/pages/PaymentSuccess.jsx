import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../lib/api";
import React from "react";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id"); // derive once
  const [msg, setMsg] = useState("Verifying payment…");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setMsg("Missing session ID.");
      return;
    }
    let isMounted = true;

    api
      .get(`/api/payments/verify`, { params: { session_id: sessionId } })
      .then(() => {
        if (!isMounted) return;
        setOk(true);
        setMsg("Payment confirmed! 🎉");
      })
      .catch(() => {
        if (!isMounted) return;
        setOk(false);
        setMsg("Returned from Stripe. If you were charged, your history will update shortly.");
      });

    return () => {
      isMounted = false; // avoid setState after unmount
    };
  }, [sessionId]); // ✅ satisfies the linter

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>{msg}</h1>
      {ok ? (
        <p>Thank you for your donation! You can view it in your history.</p>
      ) : (
        <p>If this seems wrong, refresh in a moment or check your history.</p>
      )}
      <div style={{ marginTop: 16 }}>
        <Link to="/dashboard">Go to Dashboard</Link>{" · "}
        <Link to="/campaigns">Browse more campaigns</Link>
      </div>
    </div>
  );
}
