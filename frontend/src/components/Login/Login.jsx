import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { loginUser, sendOtp, verifyOtp } from '../../services/api';
import './Login.css';

const Login = ({ setUser }) => {
  const [loginMode, setLoginMode] = useState('password');
  const [passwordForm, setPasswordForm] = useState({ email: '', password: '' });
  const [otpForm, setOtpForm] = useState({ phoneNumber: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
      const path =
        user.userType?.toLowerCase() === 'ngo'
          ? '/Dashboard/Ngo'
          : '/Dashboard/Home';
      if (typeof setUser === 'function') setUser(user);
      navigate(path, { replace: true });
    }
  }, [navigate, setUser]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const extractAuthData = (responseData) => {
    const payload = responseData?.data ?? responseData;
    const token = payload?.token;
    const user = payload?.user;
    return { token, user };
  };

  const completeLogin = (responseData, successMessage) => {
    const { token, user } = extractAuthData(responseData);
    if (!token || !user) {
      throw new Error('Invalid authentication response');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (typeof setUser === 'function') setUser(user);

    toast.success(successMessage);
    const path =
      user.userType?.toLowerCase() === 'ngo'
        ? '/Dashboard/Ngo'
        : '/Dashboard/Home';
    navigate(path, { replace: true });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtpForm({ ...otpForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginUser(passwordForm);
      completeLogin(response.data, 'Login successful!');
    } catch (error) {
      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid email or password',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Something went wrong. Try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSendingOtp(true);

    try {
      const response = await sendOtp({ phoneNumber: otpForm.phoneNumber });
      const resendAvailableInSeconds =
        response?.data?.data?.resendAvailableInSeconds ?? 30;
      setCooldown(resendAvailableInSeconds);
      setOtpSent(true);
      toast.success(response?.data?.message || 'OTP sent successfully');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'OTP Send Failed',
        text: error.response?.data?.message || 'Unable to send OTP right now.',
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await verifyOtp({
        phoneNumber: otpForm.phoneNumber,
        otp: otpForm.otp,
      });
      completeLogin(response.data, 'OTP verified. Login successful!');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'OTP Verification Failed',
        text: error.response?.data?.message || 'Invalid OTP or it has expired.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (mode) => {
    setLoginMode(mode);
    setOtpSent(false);
    setOtpForm({ phoneNumber: '', otp: '' });
    setCooldown(0);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <h1>DonateHope</h1>
        <h3>Donation & Crowdfunding Platform</h3>
        <p>Empowering causes. Supporting NGOs. Changing lives.</p>
      </div>

      <div className="auth-right">
        <h2>Sign in</h2>
        <p className="sub-text">Choose your preferred login method</p>

        <div className="login-mode-toggle">
          <button
            type="button"
            className={`mode-btn ${loginMode === 'password' ? 'active' : ''}`}
            onClick={() => switchMode('password')}
          >
            Login with Password
          </button>
          <button
            type="button"
            className={`mode-btn ${loginMode === 'otp' ? 'active' : ''}`}
            onClick={() => switchMode('otp')}
          >
            Login with OTP
          </button>
        </div>

        {loginMode === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={passwordForm.email}
              onChange={handlePasswordChange}
              required
            />

            <input
              type="password"
              placeholder="Password"
              name="password"
              value={passwordForm.password}
              onChange={handlePasswordChange}
              required
            />

            <button type="submit" className="login-main-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {loginMode === 'otp' && (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
            <input
              type="tel"
              placeholder="Phone Number (e.g. +14155552671)"
              name="phoneNumber"
              value={otpForm.phoneNumber}
              onChange={handleOtpChange}
              required
              disabled={otpSent}
            />

            {otpSent && (
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                name="otp"
                value={otpForm.otp}
                onChange={handleOtpChange}
                pattern="\d{6}"
                maxLength={6}
                required
              />
            )}

            {!otpSent ? (
              <button type="submit" className="login-main-btn" disabled={isSendingOtp}>
                {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
              </button>
            ) : (
              <>
                <button type="submit" className="login-main-btn" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || cooldown > 0}
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                </button>
              </>
            )}
          </form>
        )}

        <div className="auth-links">
          <Link to="/forgot-password">Forgot Password</Link>
          <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
