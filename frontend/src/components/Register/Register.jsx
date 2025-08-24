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

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);

    try {
      // Remove confirmPassword before sending to backend
      const apiData = { ...formData };
      delete apiData.confirmPassword;

      const response = await axios.post('http://localhost:8080/api/users/register', apiData);

      // Assuming backend returns only the created user object
      const user = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Registration successful!');

      // Redirect based on userType
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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="register-form-container card p-4 shadow">
            <h2 className="card-title text-center mb-4">Create an Account</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input type="password" className="form-control" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label htmlFor="userType" className="form-label">I am a</label>
                <select className="form-select" id="userType" name="userType" value={formData.userType} onChange={handleChange}>
                  <option value="donor">Donor</option>
                  <option value="ngo">NGO</option>
                </select>
              </div>

              {formData.userType === 'ngo' && (
                <>
                  <div className="mb-3">
                    <label htmlFor="bankAccount" className="form-label">Bank Account Number</label>
                    <input type="text" className="form-control" id="bankAccount" name="bankAccount" value={formData.bankAccount} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="bankIFSC" className="form-label">Bank IFSC Code</label>
                    <input type="text" className="form-control" id="bankIFSC" name="bankIFSC" value={formData.bankIFSC} onChange={handleChange} required />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                {isLoading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : null}
                {isLoading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
            <p className="text-center mt-3">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
