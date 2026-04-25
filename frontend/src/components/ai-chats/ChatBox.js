"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/context/AuthContext";
import "../../assets/css/chatbot.css";

export default function ChatBox() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const suggestions = [
    "How to Vote?",
    "Am I eligible?",
    "Upcoming Election",
    "My last voted",
    "Enrolled elections",
    "Last login",
    "Active Elections",
    "Result"
  ];

  // ✅ AUTO SCROLL TO LATEST MESSAGE
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ WELCOME MESSAGE ON OPEN
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "ai",
          text: `👋 Welcome to eVote AI ChatBot!

How can I help you today?

You can ask things like:
- Check eligibility
- View upcoming elections
- See your last vote
- Check results`
        }
      ]);
    }
  }, [open]);

  const sendMessage = async (customMsg) => {
    const userMessage = customMsg || input;
    if (!userMessage) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai-chat", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply || "⚠️ Please Login to use AI ChatBot",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Error connecting to AI" },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="chatbot-button" onClick={() => setOpen(!open)}>
        💬
      </div>

      {/* Chat Card */}
      {open && (
        <div className="chatbot-container">
          
          {/* Header */}
          <div className="chatbot-header">
            eVote AI 🤖
            <span onClick={() => setOpen(false)}>✖</span>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`message ${m.role === "user" ? "user" : "ai"}`}
              >
                <div className="message-name">
                  {m.role === "user" ? "You" : "eVoteAI"}
                </div>

                <div className="message-text">
                  {m.role === "ai" ? (
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message ai">
                <div className="message-name">eVoteAI</div>
                <div className="message-text">Typing...</div>
              </div>
            )}

            {/* ✅ SCROLL TARGET */}
            <div ref={messagesEndRef} />
          </div>

          {/* ✅ SUGGESTIONS (ALWAYS SHOW) */}
          <div className="suggestions">
            {suggestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."

              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={() => sendMessage()}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}