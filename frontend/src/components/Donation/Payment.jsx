import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import "./payment.css";

const RAZORPAY_KEY_ID = sanitizeRazorpayKey(import.meta.env.VITE_RAZORPAY_KEY_ID) || "rzp_test_SGSGChkzIpBp8i";

const Payment = ({ campaignId, campaignTitle, userId, user }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const effectiveCampaignId = campaignId || location.state?.campaignId || "";
  const effectiveCampaignTitle = campaignTitle || location.state?.campaignTitle || "Campaign";
  const effectiveUser = user || storedUser;
  const effectiveUserId = userId || location.state?.userId || storedUser?.id || "";

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  useEffect(() => {
    if (!document.querySelector("#razorpay-sdk")) {
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!effectiveCampaignId || !effectiveUserId) {
        throw new Error("Missing campaign or user context. Open payment from a campaign card.");
      }

      const donationAmount = Number(amount);
      if (!Number.isFinite(donationAmount) || donationAmount < 1) {
        throw new Error("Please enter a valid amount.");
      }

      const { data } = await api.post("/payments/create-order", {
        campaignId: effectiveCampaignId,
        userId: effectiveUserId,
        amount: Math.floor(donationAmount),
      });

      const orderId = data?.order_id || data?.id;
      if (!orderId) {
        throw new Error(data?.message || "Order ID was not returned by backend.");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Refresh page.");
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Crowdfunding Platform",
        description: `Donation for ${effectiveCampaignTitle}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post("/payments", {
              campaignId: effectiveCampaignId,
              donorName: effectiveUser?.name || "Anonymous",
              donorEmail: effectiveUser?.email || "unknown@example.com",
              amount: donationAmount,
            });
            setMessage(`Payment successful. Payment ID: ${response.razorpay_payment_id}`);
            setAmount("");
          } catch (saveError) {
            const saveMsg = extractErrorMessage(saveError, "Payment succeeded, but saving payment record failed.");
            setMessage(saveMsg);
          }
        },
        prefill: {
          name: effectiveUser?.name || "Guest User",
          email: effectiveUser?.email || "guest@example.com",
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: () => setMessage("Payment cancelled."),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setMessage(extractErrorMessage(error, "Something went wrong while creating payment order."));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmountSelect = (selectedAmount) => setAmount(selectedAmount);

  return (
    <div className="payment-container">
      <div className="card payment-card shadow-lg">
        <div className="card-header bg-primary text-white text-center py-4">
          <h2 className="mb-0">Support {effectiveCampaignTitle}</h2>
        </div>
        <div className="card-body p-4">
          {!effectiveCampaignId && (
            <div className="alert alert-warning mb-3">
              Campaign not selected. Go back and click Donate from a campaign.
              <div className="mt-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate("/Dashboard/Home")}>
                  Back to campaigns
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handlePayment}>
            <div className="form-group mb-4">
              <label className="form-label fw-semibold">Donation Amount (INR)</label>
              <div className="quick-amounts d-flex flex-wrap gap-2 mb-3">
                {quickAmounts.map((selectedAmount) => (
                  <button
                    key={selectedAmount}
                    type="button"
                    className={`btn btn-outline-primary ${Number(amount) === selectedAmount ? "active" : ""}`}
                    onClick={() => handleQuickAmountSelect(selectedAmount)}
                  >
                    INR {selectedAmount}
                  </button>
                ))}
              </div>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                placeholder="Enter custom amount"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100 py-3 fw-semibold" disabled={loading}>
              {loading ? "Processing..." : `Donate INR ${amount && Number(amount) > 0 ? amount : "0"}`}
            </button>
          </form>
          {message && (
            <div className={`alert ${message.toLowerCase().includes("successful") ? "alert-success" : "alert-danger"} mt-4`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;

function sanitizeRazorpayKey(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (trimmed.length >= 2 && ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function extractErrorMessage(error, fallback) {
  const backendMessage = error?.response?.data?.message;
  const backendDetails = error?.response?.data?.details;
  const backendCode = error?.response?.data?.errorCode;
  const status = error?.response?.status;

  if (backendMessage && backendDetails) {
    return `${backendMessage}: ${backendDetails}${backendCode ? ` (${backendCode})` : ""}`;
  }
  if (backendMessage) {
    return `${backendMessage}${backendCode ? ` (${backendCode})` : ""}`;
  }
  if (error?.message) {
    return status ? `${error.message} (HTTP ${status})` : error.message;
  }
  return fallback;
}
