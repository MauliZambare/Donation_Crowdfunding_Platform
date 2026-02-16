import axios from "axios";

const CHATBOT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const CHATBOT_ENDPOINT = `${CHATBOT_API_BASE_URL}/api/chatbot`;

export const sendChatbotMessage = async (message) => {
  const response = await axios.post(
    `${CHATBOT_ENDPOINT}/message`,
    { message },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const fetchChatHistory = async () => {
  const response = await axios.get(`${CHATBOT_ENDPOINT}/history`);
  return response.data;
};
