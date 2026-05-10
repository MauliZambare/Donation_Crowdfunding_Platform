import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { loginUser, sendOtp, verifyOtp } from "../../services/api";
import { extractErrorMessage } from "../../utils/errorHandler";

const Login = ({ setUser }) => {
  const [loginMode, setLoginMode] = useState("password");
  const [passwordForm, setPasswordForm] = useState({ email: "", password: "" });
  const [otpForm, setOtpForm] = useState({ phoneNumber: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (token && user) {
      if (typeof setUser === "function") setUser(user);
      navigate(user.userType?.toLowerCase() === "ngo" ? "/Dashboard/Ngo" : "/Dashboard/Home", { replace: true });
    }
  }, [navigate, setUser]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const completeLogin = (responseData, successMessage) => {
    const payload = responseData?.data ?? responseData;
    const token = payload?.token;
    const user = payload?.user;

    if (!token || !user) {
      throw new Error("Invalid authentication response");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    if (typeof setUser === "function") setUser(user);

    toast.success(successMessage);
    navigate(user.userType?.toLowerCase() === "ngo" ? "/Dashboard/Ngo" : "/Dashboard/Home", { replace: true });
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await loginUser(passwordForm);
      completeLogin(response.data, "Login successful");
    } catch (error) {
      Swal.fire({ icon: "error", title: "Login Failed", text: extractErrorMessage(error, "Invalid email or password") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setIsSendingOtp(true);
    try {
      const response = await sendOtp({ phoneNumber: otpForm.phoneNumber });
      const waitSeconds = response?.data?.data?.resendAvailableInSeconds ?? 30;
      setCooldown(waitSeconds);
      setOtpSent(true);
      toast.success(response?.data?.message || "OTP sent successfully");
    } catch (error) {
      Swal.fire({ icon: "error", title: "OTP Send Failed", text: extractErrorMessage(error, "Unable to send OTP") });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await verifyOtp({ phoneNumber: otpForm.phoneNumber, otp: otpForm.otp });
      completeLogin(response.data, "OTP verified and login successful");
    } catch (error) {
      Swal.fire({ icon: "error", title: "OTP Verification Failed", text: extractErrorMessage(error, "Invalid OTP") });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (mode) => {
    setLoginMode(mode);
    setOtpSent(false);
    setOtpForm({ phoneNumber: "", otp: "" });
    setCooldown(0);
  };

  return (
    <div className="grid min-h-[calc(100vh-9rem)] items-center gap-8 lg:grid-cols-[1fr_1fr]">
      <Motion.section
        className="glass-card p-6 sm:p-8"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <p className="mb-3 text-xs uppercase tracking-[0.23em] text-cyan-300">Welcome Back</p>
        <h1 className="text-4xl font-bold text-slate-100">Premium Giving Experience</h1>
        <p className="mt-3 text-sm text-slate-300">Secure auth, transparent campaigns, and AI assistance for every donation decision.</p>

        <div className="mt-6 space-y-3">
          <Feature iconClass="bi bi-shield-check" text="Secure JWT + OTP Authentication" />
          <Feature iconClass="bi bi-stars" text="AI-powered donor recommendations" />
          <Feature iconClass="bi bi-graph-up-arrow" text="Real-time impact analytics" />
        </div>
      </Motion.section>

      <Motion.section
        className="glass-card p-6 sm:p-8"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h2 className="text-2xl font-semibold text-slate-100">Sign in to continue</h2>
        <p className="mt-1 text-sm text-slate-300">Choose password or OTP-based authentication</p>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium ${loginMode === "password" ? "bg-cyan-500 text-slate-900" : "text-slate-200 hover:bg-white/10"}`}
            onClick={() => switchMode("password")}
          >
            Password
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium ${loginMode === "otp" ? "bg-cyan-500 text-slate-900" : "text-slate-200 hover:bg-white/10"}`}
            onClick={() => switchMode("otp")}
          >
            OTP
          </button>
        </div>

        {loginMode === "password" ? (
          <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit}>
            <InputField
              label="Email"
              type="email"
              value={passwordForm.email}
              onChange={(value) => setPasswordForm((prev) => ({ ...prev, email: value }))}
              required
            />
            <InputField
              label="Password"
              type="password"
              value={passwordForm.password}
              onChange={(value) => setPasswordForm((prev) => ({ ...prev, password: value }))}
              required
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
            <InputField
              label="Phone Number"
              type="tel"
              value={otpForm.phoneNumber}
              onChange={(value) => setOtpForm((prev) => ({ ...prev, phoneNumber: value }))}
              placeholder="+919876543210"
              disabled={otpSent}
              required
            />
            {otpSent && (
              <InputField
                label="OTP"
                type="text"
                value={otpForm.otp}
                onChange={(value) => setOtpForm((prev) => ({ ...prev, otp: value }))}
                placeholder="Enter 6-digit OTP"
                required
              />
            )}
            {!otpSent ? (
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white" disabled={isSendingOtp}>
                {isSendingOtp ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <div className="space-y-2">
                <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  className="w-full rounded-xl bg-white/10 px-4 py-2.5 text-sm text-slate-200"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || cooldown > 0}
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            )}
          </form>
        )}

        <p className="mt-5 text-sm text-slate-300">
          New to the platform? <Link to="/register" className="font-semibold text-cyan-200 hover:text-cyan-100">Create an account</Link>
        </p>
      </Motion.section>
    </div>
  );
};

const Feature = ({ iconClass, text }) => (
  <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
    <i className={`${iconClass} text-cyan-200`} aria-hidden="true" />
    <span>{text}</span>
  </div>
);

const InputField = ({ label, value, onChange, type, placeholder, required, disabled }) => (
  <label className="space-y-2 text-sm">
    <span className="font-medium text-slate-200">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="focus-ring w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-slate-100 placeholder:text-slate-400 disabled:opacity-60"
    />
  </label>
);

export default Login;
