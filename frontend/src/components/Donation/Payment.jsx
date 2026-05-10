import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { usePlatform } from "../../context/PlatformContext";
import { extractErrorMessage } from "../../utils/errorHandler";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const quickAmounts = [100, 250, 500, 1000, 2000, 5000, 10000];

const Payment = ({ campaignId, campaignTitle, userId, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addDonationRecord } = usePlatform();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [thankYouPopup, setThankYouPopup] = useState(false);
  const [checkoutPulse, setCheckoutPulse] = useState(false);

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

  const milestone = useMemo(() => {
    const value = Number(amount);
    if (value >= 10000) return "Champion Supporter";
    if (value >= 5000) return "Impact Maker";
    if (value >= 1000) return "Momentum Builder";
    return "Hope Starter";
  }, [amount]);

  useEffect(() => {
    if (!donorName && effectiveUser?.name) setDonorName(effectiveUser.name);
    if (!donorEmail && effectiveUser?.email) setDonorEmail(effectiveUser.email);
    if (!donorPhone && effectiveUser?.phoneNumber) setDonorPhone(effectiveUser.phoneNumber);
  }, [effectiveUser, donorName, donorEmail, donorPhone]);

  useEffect(() => {
    if (!document.querySelector("#razorpay-sdk")) {
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!thankYouPopup) return undefined;
    const timer = setTimeout(() => setThankYouPopup(false), 2500);
    return () => clearTimeout(timer);
  }, [thankYouPopup]);

  const handlePayment = async (event) => {
    event.preventDefault();
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
      if (!donorName.trim() || !donorEmail.trim() || !donorPhone.trim()) {
        throw new Error("Please complete donor details before checkout.");
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

      setCheckoutPulse(true);

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "DonateHope AI",
        description: `Donation for ${effectiveCampaignTitle}`,
        order_id: orderId,
        handler: async (response) => {
          const visibleDonorName = anonymous ? "Anonymous Supporter" : donorName.trim();
          let paymentRecordSaved = false;

          try {
            await api.post("/payments", {
              campaignId: effectiveCampaignId,
              donorName: visibleDonorName,
              donorEmail: donorEmail.trim(),
              amount: donationAmount,
            });
            paymentRecordSaved = true;
          } catch {
            // The verification path below still keeps the primary donation flow functional.
          }

          try {
            const { data: verificationResponse } = await api.post("/payments/verify", {
              campaignId: effectiveCampaignId,
              userId: effectiveUserId,
              donorName: visibleDonorName,
              donorEmail: donorEmail.trim(),
              donorPhone: donorPhone.trim(),
              amount: donationAmount,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            addDonationRecord({
              campaignId: effectiveCampaignId,
              campaignTitle: effectiveCampaignTitle,
              amount: donationAmount,
              recurring,
              anonymous,
              timestamp: Date.now(),
              paymentId: response.razorpay_payment_id,
            });

            setSuccessData({
              campaignTitle: effectiveCampaignTitle,
              amount: donationAmount,
              recurring,
              anonymous,
              paymentId: response.razorpay_payment_id,
              receiptUrl: verificationResponse?.receiptDownloadUrl || `/api/receipt/download/${response.razorpay_payment_id}`,
              emailSent: verificationResponse?.emailSent,
              milestone,
              message: generateThankYouMessage({ donorName, campaignTitle: effectiveCampaignTitle, amount: donationAmount }),
            });

            setShowSuccessModal(true);
            setThankYouPopup(true);
            setAmount("");

            triggerConfetti();

            if (donationAmount >= 5000) {
              setMessage(`Milestone unlocked: ${milestone}. Thank you for the incredible contribution.`);
            } else {
              setMessage(`Payment successful. ID: ${response.razorpay_payment_id}.`);
            }

            if (!paymentRecordSaved) {
              setMessage((prev) => `${prev} Payment record was partially delayed but receipt verification is complete.`);
            }
          } catch (verifyError) {
            setMessage(extractErrorMessage(verifyError, "Payment succeeded, but receipt verification failed."));
          } finally {
            setCheckoutPulse(false);
          }
        },
        prefill: {
          name: donorName.trim() || effectiveUser?.name || "Guest User",
          email: donorEmail.trim() || effectiveUser?.email || "guest@example.com",
          contact: donorPhone.trim(),
        },
        theme: { color: "#14b8a6" },
        modal: {
          ondismiss: () => {
            setCheckoutPulse(false);
            setMessage("Payment cancelled.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setCheckoutPulse(false);
      setMessage(extractErrorMessage(error, "Something went wrong while creating payment order."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <AnimatePresence>
        {thankYouPopup && (
          <Motion.div
            className="fixed right-5 top-24 z-50 rounded-2xl border border-emerald-300/40 bg-emerald-500/20 px-4 py-3 text-sm text-emerald-100 backdrop-blur-lg"
            initial={{ opacity: 0, y: -12, x: 10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -8, x: 10 }}
          >
            Thank you! Your donation is creating real impact.
          </Motion.div>
        )}
      </AnimatePresence>

      <Motion.section
        className="glass-card overflow-hidden p-6 sm:p-8"
        animate={checkoutPulse ? { boxShadow: ["0 0 0 rgba(45,212,191,0)", "0 0 35px rgba(45,212,191,0.35)", "0 0 0 rgba(45,212,191,0)"] } : {}}
        transition={{ duration: 1.4, repeat: checkoutPulse ? Infinity : 0 }}
      >
        <h1 className="text-3xl font-bold text-slate-100">Support {effectiveCampaignTitle}</h1>
        <p className="mt-2 text-sm text-slate-300">Secure checkout, instant receipt, and AI-crafted gratitude notes.</p>

        {!effectiveCampaignId && (
          <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
            Campaign not selected. Go back and click Donate from a campaign card.
            <button className="ml-3 rounded-lg bg-white/15 px-3 py-1 text-xs" onClick={() => navigate("/Dashboard/Home")}>Back to campaigns</button>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handlePayment}>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Full Name" value={donorName} onChange={setDonorName} type="text" placeholder="Enter full name" required />
            <InputField label="Email" value={donorEmail} onChange={setDonorEmail} type="email" placeholder="Enter email" required />
          </div>

          <InputField label="Phone" value={donorPhone} onChange={setDonorPhone} type="tel" placeholder="Enter phone number" required />

          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">Suggested Amounts</p>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${Number(amount) === preset ? "border-cyan-300 bg-cyan-500/25 text-cyan-100" : "border-white/20 bg-white/10 text-slate-200 hover:bg-white/20"}`}
                  onClick={() => setAmount(preset)}
                >
                  INR {preset}
                </button>
              ))}
            </div>
          </div>

          <InputField
            label="Donation Amount (INR)"
            value={amount}
            onChange={setAmount}
            type="number"
            min="1"
            placeholder="Enter custom amount"
            required
          />

          <div className="grid gap-3 rounded-xl border border-white/15 bg-white/5 p-4 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={recurring} onChange={(event) => setRecurring(event.target.checked)} />
              Make this a monthly recurring donation
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
              Donate anonymously
            </label>
          </div>

          <div className="rounded-xl border border-cyan-300/25 bg-cyan-500/10 p-3 text-sm text-cyan-100">
            <p className="font-semibold">Milestone Badge: {milestone}</p>
            <p className="text-cyan-200/90">Higher donations unlock stronger impact badges and streak rewards.</p>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-lg font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:brightness-110 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Processing..." : `Donate INR ${amount && Number(amount) > 0 ? amount : "0"}`}
          </button>
        </form>

        {message && (
          <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${message.toLowerCase().includes("successful") || message.toLowerCase().includes("milestone") ? "border-emerald-300/40 bg-emerald-500/10 text-emerald-100" : "border-rose-300/40 bg-rose-500/10 text-rose-100"}`}>
            {message}
          </div>
        )}
      </Motion.section>

      <AnimatePresence>
        {showSuccessModal && successData && (
          <Motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Motion.div
              className="w-full max-w-lg rounded-3xl border border-emerald-300/30 bg-slate-900/90 p-6 text-slate-100"
              initial={{ scale: 0.94, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
            >
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-emerald-300">Donation Successful</p>
              <h3 className="text-2xl font-bold">Thank You for Supporting {successData.campaignTitle}</h3>
              <p className="mt-3 text-sm text-slate-300">{successData.message}</p>

              <div className="mt-5 space-y-2 rounded-xl bg-white/5 p-4 text-sm">
                <p><span className="text-slate-400">Amount:</span> INR {Number(successData.amount).toLocaleString()}</p>
                <p><span className="text-slate-400">Payment ID:</span> {successData.paymentId}</p>
                <p><span className="text-slate-400">Mode:</span> {successData.recurring ? "Monthly Recurring" : "One-time"}</p>
                <p><span className="text-slate-400">Visibility:</span> {successData.anonymous ? "Anonymous" : "Public"}</p>
                <p><span className="text-slate-400">Milestone:</span> {successData.milestone}</p>
                <p><span className="text-slate-400">Receipt Email:</span> {successData.emailSent ? "Sent" : "Pending"}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}${successData.receiptUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-emerald-500/25 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/35"
                >
                  Download Receipt
                </a>
                <button
                  type="button"
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm text-slate-100 hover:bg-white/20"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Close
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({ label, value, onChange, type, placeholder, required, min }) => (
  <label className="space-y-2 text-sm">
    <span className="font-medium text-slate-200">{label}</span>
    <input
      type={type}
      value={value}
      min={min}
      required={required}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="focus-ring w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-slate-100 placeholder:text-slate-400"
    />
  </label>
);

function triggerConfetti() {
  confetti({ particleCount: 120, spread: 75, origin: { y: 0.7 } });
  setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 65, origin: { x: 0 } }), 160);
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 65, origin: { x: 1 } }), 160);
}

function generateThankYouMessage({ donorName, campaignTitle, amount }) {
  const name = donorName?.trim() || "Friend";
  const impact = Number(amount) >= 5000
    ? "Your generous support can unlock a major milestone for this campaign."
    : "Every contribution brings this campaign closer to real-world change.";

  return `Dear ${name}, thank you for donating to ${campaignTitle}. ${impact}`;
}

export default Payment;
