import { Link } from "react-router-dom";

export default function PaymentCancel() {
  return (
    <div className="container" style={{ padding: 24 }}>
      <h1>Payment canceled</h1>
      <p>No charge was made. You can try again anytime.</p>
      <div style={{ marginTop: 16 }}>
        <Link to="/campaigns">Back to campaigns</Link>
      </div>
    </div>
  );
}
