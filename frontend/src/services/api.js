import axios from "axios";

// Base URL of your backend
const API_URL = "http://localhost:8080/api/users";

// Register user
export const registerUser = (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

// Login user
export const loginUser = (loginData) => {
  return axios.post(`${API_URL}/login`, loginData);
};

// Razorpay Key (Public - safe to use in frontend)
export const RAZORPAY_KEY_ID = "rzp_test_RALd8Iai4u6gPg";

