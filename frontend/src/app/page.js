"use client";
import "../assets/css/body.css";
import ChatBox from "@/components/ai-chats/ChatBox";
import MessageInfo from "@/components/messageInfo/message";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const counters = document.querySelectorAll(".counter");

    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-target");
      const speed = 200;

      const updateCount = () => {
        const current = +counter.innerText.replace(/[^\d.]/g, "");
        const increment = target / speed;

        if (current < target) {
          counter.innerText = Math.ceil(current + increment);
          setTimeout(updateCount, 20);
        } else {
          counter.innerText = target;
        }
      };

      updateCount();
    });
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Decision's at Your <br />
            <span>Fingertips</span>
          </h1>

          <p>
            Experience the future of voting with <strong>ME2Vote</strong> – a
            secure, transparent, and efficient digital voting platform powered
            by advanced authentication and real-time results.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Start Voting Now</button>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>
      </section>

      <MessageInfo />

      {/* WHY CHOOSE */}
      <section className="why-choose">

        <div className="why-header">
          <h2>
            Why Choose <span>ME2Vote?</span>
          </h2>
          <p>Cutting-edge technology meets democratic principles</p>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="icon">🔐</div>
            <h3>Bank-Grade Security</h3>
            <p>
              Multi-factor authentication with OAuth2, JWT tokens, and
              end-to-end encryption.
            </p>
          </div>

          <div className="why-card">
            <div className="icon">🪪</div>
            <h3>Aadhaar Integration</h3>
            <p>
              Secure voter verification using Aadhaar authentication for
              trusted identity.
            </p>
          </div>

          <div className="why-card">
            <div className="icon">⚡</div>
            <h3>Real-Time Updates</h3>
            <p>
              Live election status and instant result broadcasting using
              WebSocket technology.
            </p>
          </div>

          <div className="why-card">
            <div className="icon">👥</div>
            <h3>Role-Based Access</h3>
            <p>
              Separate interfaces for voters and administrators with granular
              permissions.
            </p>
          </div>

          <div className="why-card">
            <div className="icon">📊</div>
            <h3>Analytics & Audit</h3>
            <p>
              Comprehensive logs, voting analytics, and transparent audit
              trails.
            </p>
          </div>

          <div className="why-card">
            <div className="icon">⛓️</div>
            <h3>One Vote Per Person</h3>
            <p>
              Blockchain-verified voting ensures each voter can cast only one
              secure vote.
            </p>
          </div>
        </div>
      </section>
      <ChatBox />

      {/* STATS */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <i className="bi bi-bar-chart-fill stat-icon"></i>
              <h2 className="counter" data-target="10">0</h2>
              <span className="plus">M+</span>
              <p>Votes Cast</p>
            </div>

            <div className="stat-card">
              <i className="bi bi-clock-history stat-icon"></i>
              <h2 className="counter" data-target="99.9">0</h2>
              <span className="percent">%</span>
              <p>Uptime</p>
            </div>

            <div className="stat-card">
              <i className="bi bi-shield-lock-fill stat-icon"></i>
              <h2>256-bit</h2>
              <p>Encryption</p>
            </div>

            <div className="stat-card">
              <i className="bi bi-headset stat-icon"></i>
              <h2>24/7</h2>
              <p>Support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}