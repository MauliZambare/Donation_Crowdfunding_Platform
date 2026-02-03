import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import './Login.css';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/users/login',
        formData
      );

      if (response.status === 200) {
        const user = response.data.user || response.data;
        const token = response.data.token;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        if (typeof setUser === 'function') setUser(user);

        toast.success('Login successful!');
        const path =
          user.userType?.toLowerCase() === 'ngo'
            ? '/Dashboard/Ngo'
            : '/Dashboard/Home';
        navigate(path, { replace: true });
      }
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
          text: 'Something went wrong. Try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <h1>DonateHope</h1>
        <h3>Donation & Crowdfunding Platform</h3>
        <p>Empowering causes. Supporting NGOs. Changing lives.</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <h2>Sign in</h2>
        <p className="sub-text">Enter your details below</p>

        <button className="google-btn">Access your profile</button>
        <button className="facebook-btn">Verify identity</button>

        <div className="divider">or</div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="login-main-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password">Forgot Password</Link>
          <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
