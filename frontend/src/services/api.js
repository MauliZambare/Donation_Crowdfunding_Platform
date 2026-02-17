import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (userData) => api.post("/users/register", userData);
export const loginUser = (loginData) => api.post("/users/login", loginData);
export const sendOtp = (payload) => api.post("/auth/send-otp", payload);
export const verifyOtp = (payload) => api.post("/auth/verify-otp", payload);

export const getCampaigns = () => api.get("/campaigns");
export const createCampaign = (campaignData) => api.post("/campaigns", campaignData);
export const deleteCampaign = (campaignId) => api.delete(`/campaigns/${campaignId}`);
export const getSocialPostCaptions = (campaignId) => api.get(`/social/posts/${campaignId}`);

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  // Use raw axios so browser sets multipart boundary automatically.
  return axios.post(`${API_BASE_URL}/api/images/upload`, formData, {
    headers: {
      Accept: "application/json",
    },
  });
};
