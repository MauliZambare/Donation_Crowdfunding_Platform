import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { fetchChatHistory, sendChatbotMessage } from "./ChatbotService";

const suggestedPrompts = [
  "Show me urgent healthcare campaigns",
  "How can I get a donation receipt?",
  "Suggest a campaign under INR 1000",
  "How do NGOs improve campaign success?",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        setInputText((prev) => `${prev} ${transcript}`.trim());
      }
    };

    recognitionRef.current = recognition;
    setVoiceSupported(true);

    return () => {
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    if (isOpen && !isHistoryLoaded) {
      loadHistory();
    }
  }, [isOpen, isHistoryLoaded]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const canSend = useMemo(() => inputText.trim().length > 0 && !isLoading, [inputText, isLoading]);

  const loadHistory = async () => {
    try {
      const history = await fetchChatHistory();
      const formatted = [];
      history.forEach((item, index) => {
        if (item.userMessage) {
          formatted.push({ id: `history-u-${item.id || index}`, sender: "user", text: item.userMessage, timestamp: item.timestamp || new Date().toISOString() });
        }
        if (item.botReply) {
          formatted.push({ id: `history-b-${item.id || index}`, sender: "bot", text: item.botReply, timestamp: item.timestamp || new Date().toISOString() });
        }
      });
      setMessages(formatted);
      setIsHistoryLoaded(true);
      setLoadError("");
    } catch (error) {
      setLoadError(error.message || "Could not load previous chat.");
      setIsHistoryLoaded(true);
    }
  };

  const handleSend = async (customText) => {
    const text = (customText ?? inputText).trim();
    if (!text || isLoading) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: "user", text, timestamp: new Date().toISOString() }]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await sendChatbotMessage(text);
      setMessages((prev) => [...prev, {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: response.reply || "I could not generate a response right now.",
        timestamp: new Date().toISOString(),
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: `e-${Date.now()}`,
        sender: "bot",
        text: error.message || "Something went wrong while contacting AI assistant.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 md:bottom-6 md:right-6">
      <Motion.button
        type="button"
        className="pointer-events-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xl text-white shadow-2xl shadow-cyan-500/35"
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        <i className={isOpen ? "bi bi-x-lg" : "bi bi-chat-dots"} />
      </Motion.button>

      <AnimatePresence>
        {isOpen && (
          <Motion.div
            className="pointer-events-auto absolute bottom-16 right-0 h-[520px] w-[min(92vw,380px)] overflow-hidden rounded-3xl border border-white/15 bg-slate-950/80 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
          >
            <div className="border-b border-white/10 bg-white/5 px-4 py-3">
              <p className="text-sm font-semibold text-slate-100">AI Assistant</p>
              <p className="text-xs text-slate-400">Campaign guidance, donation help, and platform support</p>
            </div>

            <div className="h-[calc(100%-150px)] overflow-y-auto px-3 py-3">
              {loadError && <div className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs text-rose-200">{loadError}</div>}

              {!loadError && messages.length === 0 && (
                <div className="rounded-xl bg-white/5 px-3 py-3 text-sm text-slate-300">
                  Ask me anything about donations, campaigns, receipts, or NGOs.
                </div>
              )}

              <div className="space-y-2">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.sender === "user" ? "bg-cyan-500 text-slate-900" : "bg-white/8 text-slate-100"}`}>
                      <p>{message.text}</p>
                      <p className="mt-1 text-[10px] opacity-70">{formatTime(message.timestamp)}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white/8 px-3 py-2 text-sm text-slate-100">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 bg-black/25 px-3 py-3">
              <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">Suggested prompts</p>
              <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 hover:bg-white/20"
                    onClick={() => handleSend(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={1}
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  className="focus-ring min-h-10 w-full resize-none rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
                  disabled={isLoading}
                />
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`rounded-xl px-3 text-sm ${isListening ? "bg-rose-500/25 text-rose-100" : "bg-white/10 text-slate-200"}`}
                    aria-label="Voice input"
                  >
                    <i className="bi bi-mic" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!canSend}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 text-sm font-medium text-white disabled:opacity-60"
                >
                  Send
                </button>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function formatTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default Chatbot;
