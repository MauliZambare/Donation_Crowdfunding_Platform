import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import axios from 'axios';

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Passwords do not match',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for API - remove confirmPassword as it's not needed in the backend
      const {  ...apiData } = formData;
      
      const response = await axios.post('http://localhost:8080/api/users/register', apiData);
      
      if (response.status === 201) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast.success('Registration successful!');
        
        // Redirect based on user type
        if (response.data.user.userType === 'ngo') {
          navigate('/ngo-dashboard');
        } else {
          navigate('/donor-dashboard');
        }
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
          <div style={{
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'white'
          }}>
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-4">Create an Account</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="userType" className="form-label">I am a</label>
                  <select
                    className="form-select"
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #ddd'
                    }}
                  >
                    <option value="donor">Donor</option>
                    <option value="ngo">NGO</option>
                  </select>
                </div>
                
                {formData.userType === 'ngo' && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="bankAccount" className="form-label">Bank Account Number</label>
                      <input
                        type="text"
                        className="form-control"
                        id="bankAccount"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                        required
                        style={{
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd'
                        }}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="bankIFSC" className="form-label">Bank IFSC Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="bankIFSC"
                        name="bankIFSC"
                        value={formData.bankIFSC}
                        onChange={handleChange}
                        required
                        style={{
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd'
                        }}
                      />
                    </div>
                  </>
                )}
                
                <button 
                  type="submit" 
                  className="btn w-100"
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#4361ee',
                    borderColor: '#4361ee',
                    padding: '10px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    color: 'white'
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : 'Register'}
                </button>
              </form>
              <p className="text-center mt-3">
                Already have an account? <Link to="/login">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;