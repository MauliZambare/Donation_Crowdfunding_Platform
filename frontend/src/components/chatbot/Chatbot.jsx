import { useEffect, useMemo, useRef, useState } from "react";
import { fetchChatHistory, sendChatbotMessage } from "./ChatbotService";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isHistoryLoaded) {
      loadHistory();
    }
  }, [isOpen, isHistoryLoaded]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const canSend = useMemo(() => inputText.trim().length > 0 && !isLoading, [inputText, isLoading]);

  const loadHistory = async () => {
    try {
      const history = await fetchChatHistory();
      const formatted = [];

      history.forEach((item, index) => {
        if (item.userMessage) {
          formatted.push({
            id: `history-user-${item.id || index}`,
            sender: "user",
            text: item.userMessage,
            timestamp: item.timestamp || new Date().toISOString(),
          });
        }
        if (item.botReply) {
          formatted.push({
            id: `history-bot-${item.id || index}`,
            sender: "bot",
            text: item.botReply,
            timestamp: item.timestamp || new Date().toISOString(),
          });
        }
      });

      setMessages(formatted);
      setIsHistoryLoaded(true);
      setLoadError("");
    } catch (error) {
      setLoadError("Could not load previous chat.");
      setIsHistoryLoaded(true);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) {
      return;
    }

    const now = new Date().toISOString();
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await sendChatbotMessage(text);
      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.reply || "I could not generate a response right now.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: "bot",
        text: "Something went wrong while contacting the chatbot service.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="chatbot-root">
      <button
        type="button"
        className={`chatbot-float-btn ${isOpen ? "open" : ""}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? (
          "x"
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 4v-4a3 3 0 0 1-3-3V5z"></path>
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div>
              <h4>AI Assistant</h4>
              <p>Donation & Crowdfunding support</p>
            </div>
            <button type="button" onClick={toggleChat} className="chatbot-close-btn" aria-label="Close">
              x
            </button>
          </div>

          <div className="chatbot-messages">
            {loadError && <div className="chatbot-status">{loadError}</div>}

            {!loadError && messages.length === 0 && (
              <div className="chatbot-status">Ask me anything about donations, campaigns, or platform help.</div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`chatbot-message-row ${message.sender === "user" ? "user" : "bot"}`}>
                <div className="chatbot-message">
                  <p>{message.text}</p>
                  <span>{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message-row bot">
                <div className="chatbot-message typing">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>{formatTime(new Date().toISOString())}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef}></div>
          </div>

          <div className="chatbot-input-area">
            <textarea
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button type="button" onClick={handleSend} disabled={!canSend}>
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function formatTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default Chatbot;
