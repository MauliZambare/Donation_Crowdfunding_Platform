import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'donor',
    bankAccount: '',
    bankIFSC: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);

    try {
      const apiData = { ...formData };
      delete apiData.confirmPassword;

      const response = await axios.post('http://localhost:8080/api/users/register', apiData);
      const user = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Registration successful!');

      if (user.userType === 'ngo') {
        navigate('/Dashboard/ngo');
      } else {
        navigate('/Dashboard/home');
      }

    } catch (error) {
      console.error('Registration error:', error);
      if (error.response && error.response.status === 400) {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: error.response.data.message || 'User with this email already exists',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred during registration. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="register-shape register-shape-1"></div>
        <div className="register-shape register-shape-2"></div>
        <div className="register-shape register-shape-3"></div>
      </div>
      
      <div className="register-content">
        <div className="register-card">
          <div className="register-header">
            <h2>Join Our Community</h2>
            <p>Create your account and make a difference</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                <div className="input-icon">
                  <i className="icon-user"></i>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                <div className="input-icon">
                  <i className="icon-email"></i>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                <div className="input-icon">
                  <i className="icon-lock"></i>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                <div className="input-icon">
                  <i className="icon-lock"></i>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="userType" className="form-label">I am a</label>
              <div className="user-type-selector">
                <button
                  type="button"
                  className={`user-type-btn ${formData.userType === 'donor' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, userType: 'donor'})}
                >
                  Donor
                </button>
                <button
                  type="button"
                  className={`user-type-btn ${formData.userType === 'ngo' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, userType: 'ngo'})}
                >
                  NGO
                </button>
              </div>
            </div>

            {formData.userType === 'ngo' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bankAccount" className="form-label">Bank Account Number</label>
                  <input type="text" id="bankAccount" name="bankAccount" value={formData.bankAccount} onChange={handleChange} required />
                  <div className="input-icon">
                    <i className="icon-bank"></i>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bankIFSC" className="form-label">Bank IFSC Code</label>
                  <input type="text" id="bankIFSC" name="bankIFSC" value={formData.bankIFSC} onChange={handleChange} required />
                  <div className="input-icon">
                    <i className="icon-code"></i>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="register-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="spinner"></div>
              ) : null}
              {isLoading ? 'Creating Account...' : 'Register Now'}
            </button>
          </form>

          <div className="register-footer">
            <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;