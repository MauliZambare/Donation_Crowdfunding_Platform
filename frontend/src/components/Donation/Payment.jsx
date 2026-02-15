import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./payment.css";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const Payment = ({ campaignId, campaignTitle, userId, user }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
      const donationAmount = Number(amount);
      if (!donationAmount || donationAmount < 1) {
        setMessage("Please enter a valid amount.");
        setLoading(false);
        return;
      }

      const { data } = await api.post("/payments/create-order", {
        campaignId,
        userId,
        amount: donationAmount,
      });

      if (!data?.id) throw new Error("Failed to create order.");

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Crowdfunding Platform",
        description: `Donation for ${campaignTitle || "campaign"}`,
        order_id: data.id,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              campaignId,
              userId,
              amount: donationAmount,
              donorName: user?.name || "Anonymous",
              donorEmail: user?.email || "unknown@example.com",
            });
            setMessage(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
            setAmount("");
          } catch {
            setMessage("Payment captured but verification failed.");
          }
        },
        prefill: {
          name: user?.name || "Guest User",
          email: user?.email || "guest@example.com",
        },
        theme: { color: "#3399cc" },
        modal: { ondismiss: () => setMessage("Payment cancelled.") },
      };

      if (window.Razorpay) {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        setMessage("Razorpay SDK failed to load. Refresh page.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmountSelect = (selectedAmount) => setAmount(selectedAmount);

  return (
    <div className="payment-container">
      <div className="card payment-card shadow-lg">
        <div className="card-header bg-primary text-white text-center py-4">
          <h2 className="mb-0">Support {campaignTitle}</h2>
        </div>
        <div className="card-body p-4">
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
