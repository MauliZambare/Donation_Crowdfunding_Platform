import axios from "axios";
import { useState } from "react";
import "./payment.css";

const Payment = ({ campaignId, campaignTitle }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  // Predefined donation amounts
  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:8080/api/payments/create", {
        campaignId,
        amount,
        paymentMethod,
      });

      if (response.data.status === "SUCCESS") {
        setTransactionId(response.data.transactionId);
        setShowSuccess(true);
        setMessage(`✅ Payment Successful! Transaction ID: ${response.data.transactionId}`);
      } else {
        setMessage("❌ Payment Failed! Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("⚠️ Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmountSelect = (amount) => {
    setAmount(amount);
  };

  const resetForm = () => {
    setAmount("");
    setPaymentMethod("CARD");
    setShowSuccess(false);
    setMessage("");
  };

  return (
    <div className="payment-container">
      <div className="card payment-card shadow-lg">
        <div className="card-header bg-primary text-white text-center py-4">
          <h2 className="mb-0">Support {campaignTitle}</h2>
          <p className="mb-0 mt-2">Your contribution makes a difference</p>
        </div>
        
        <div className="card-body p-4">
          {!showSuccess ? (
            <>
              <div className="donation-progress mb-4">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Raised: ₹42,500</span>
                  <span className="text-muted">Goal: ₹100,000</span>
                </div>
                <div className="progress mt-2">
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{width: '42.5%'}}
                    aria-valuenow="42.5" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>

              <form onSubmit={handlePayment}>
                <div className="form-group mb-4">
                  <label className="form-label fw-semibold">Donation Amount (₹)</label>
                  <div className="quick-amounts d-flex flex-wrap gap-2 mb-3">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className={`btn btn-outline-primary ${amount === amt.toString() ? 'active' : ''}`}
                        onClick={() => handleQuickAmountSelect(amt)}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
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
                </div>

                <div className="form-group mb-4">
                  <label className="form-label fw-semibold">Payment Method</label>
                  <div className="payment-methods">
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="card"
                        value="CARD"
                        checked={paymentMethod === "CARD"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="card">
                        <i className="bi bi-credit-card me-2"></i> Credit/Debit Card
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="upi"
                        value="UPI"
                        checked={paymentMethod === "UPI"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="upi">
                        <i className="bi bi-phone me-2"></i> UPI
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="netbanking"
                        value="NETBANKING"
                        checked={paymentMethod === "NETBANKING"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="netbanking">
                        <i className="bi bi-bank me-2"></i> Net Banking
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    `Donate ₹${amount || '0'}`
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="success-checkmark">
                <i className="bi bi-check-circle-fill text-success" style={{fontSize: '4rem'}}></i>
              </div>
              <h3 className="mt-4 text-success">Thank You for Your Donation!</h3>
              <p className="text-muted">Your support is helping make a real difference.</p>
              <div className="alert alert-info mt-4">
                <strong>Transaction ID:</strong> {transactionId}
              </div>
              <p className="mt-3">A receipt has been sent to your email.</p>
              <button className="btn btn-outline-primary mt-3 me-2">Download Receipt</button>
              <button className="btn btn-primary mt-3" onClick={resetForm}>Make Another Donation</button>
            </div>
          )}

          {message && !showSuccess && (
            <div className={`alert ${message.includes('Successful') ? 'alert-success' : 'alert-danger'} mt-4`}>
              {message}
            </div>
          )}

          <div className="security-note mt-4 pt-3 border-top text-center">
            <p className="text-muted small">
              <i className="bi bi-shield-check me-1"></i> Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;