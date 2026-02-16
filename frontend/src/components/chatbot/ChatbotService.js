import axios from "axios";

const CHATBOT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const CHATBOT_ENDPOINT = `${CHATBOT_API_BASE_URL}/api/chatbot`;

const chatbotClient = axios.create({
  baseURL: CHATBOT_ENDPOINT,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.code === "ECONNABORTED") return "Chatbot request timed out. Please try again.";
  if (error?.message) return error.message;
  return fallbackMessage;
};

export const sendChatbotMessage = async (message) => {
  try {
    const payload = { message: (message || "").trim() };
    const response = await chatbotClient.post("", payload);

    if (!response?.data?.reply) {
      throw new Error("Invalid chatbot response format.");
    }
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Chatbot service temporarily unavailable."));
  }
};

export const fetchChatHistory = async () => {
  try {
    const response = await chatbotClient.get("/history");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load chat history."));
  }
};
