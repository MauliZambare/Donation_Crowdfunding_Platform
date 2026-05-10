import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { registerUser } from "../../services/api";
import { extractErrorMessage } from "../../utils/errorHandler";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    userType: "donor",
    bankAccount: "",
    bankIFSC: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "Passwords do not match" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = { ...formData };
      delete payload.confirmPassword;
      if (!payload.phoneNumber) {
        delete payload.phoneNumber;
      }

      await registerUser(payload);
      toast.success("Registration successful. Please login to continue.");
      navigate("/login", { replace: true });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: extractErrorMessage(error, "Could not create account. Please try again."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-9rem)] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <Motion.section className="glass-card p-6 sm:p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-cyan-300">Join the Impact Network</p>
        <h1 className="text-4xl font-bold text-slate-100">Create your donor or NGO profile</h1>
        <p className="mt-3 text-sm text-slate-300">Start fundraising with transparent tools or support verified causes with one-click secure giving.</p>

        <div className="mt-6 space-y-3 text-sm text-slate-200">
          <div className="rounded-xl bg-white/5 px-3 py-2">? Multi-language support (English, Hindi, Marathi)</div>
          <div className="rounded-xl bg-white/5 px-3 py-2">? AI-powered campaign guidance</div>
          <div className="rounded-xl bg-white/5 px-3 py-2">? Instant donation receipts and analytics</div>
        </div>
      </Motion.section>

      <Motion.section className="glass-card p-6 sm:p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-semibold text-slate-100">Create Account</h2>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>

          <InputField label="Phone Number (Optional)" name="phoneNumber" placeholder="+919876543210" value={formData.phoneNumber} onChange={handleChange} />

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
            <InputField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">I am joining as</p>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
              <button
                type="button"
                className={`rounded-lg px-3 py-2 text-sm ${formData.userType === "donor" ? "bg-cyan-500 text-slate-900" : "text-slate-200 hover:bg-white/10"}`}
                onClick={() => setFormData((prev) => ({ ...prev, userType: "donor" }))}
              >
                Donor
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-2 text-sm ${formData.userType === "ngo" ? "bg-cyan-500 text-slate-900" : "text-slate-200 hover:bg-white/10"}`}
                onClick={() => setFormData((prev) => ({ ...prev, userType: "ngo" }))}
              >
                NGO
              </button>
            </div>
          </div>

          {formData.userType === "ngo" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Bank Account Number" name="bankAccount" value={formData.bankAccount} onChange={handleChange} required />
              <InputField label="Bank IFSC" name="bankIFSC" value={formData.bankIFSC} onChange={handleChange} required />
            </div>
          )}

          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-300">
          Already have an account? <Link className="font-semibold text-cyan-200 hover:text-cyan-100" to="/login">Login</Link>
        </p>
      </Motion.section>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text", placeholder, required }) => (
  <label className="space-y-2 text-sm">
    <span className="font-medium text-slate-200">{label}</span>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="focus-ring w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-slate-100 placeholder:text-slate-400"
    />
  </label>
);

export default Register;
