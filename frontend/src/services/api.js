import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = (userData) => api.post("/users/register", userData);
export const loginUser = (loginData) => api.post("/users/login", loginData);

export const getCampaigns = () => api.get("/campaigns");
export const createCampaign = (campaignData) => api.post("/campaigns", campaignData);
export const deleteCampaign = (campaignId) => api.delete(`/campaigns/${campaignId}`);

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
