"use client";

import { useState } from "react";
import axios from "axios";
import "@/assets/css/voter-consent.css";

export default function VoterConsentForm() {
  const [voterId, setVoterId] = useState("");
  const [invalidVoters, setInvalidVoters] = useState([]);
  const [insertedCount, setInsertedCount] = useState(0);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!voterId.trim()) {
      setMessage({ type: "error", text: "Voter ID is required." });
      return;
    }

    if (!consent) {
      setMessage({
        type: "error",
        text: "You must agree to the consent before proceeding.",
      });
      return;
    }

    const electionId = localStorage.getItem("verifiedElectionId");

    try {
      setLoading(true);
      setMessage(null);

      const res = await axios.post(
        "http://localhost:5000/api/election-voters/bulk-insert",
        {
          election_id: electionId,
          voter_ids: [voterId], // ✅ FIXED
        },
        { withCredentials: true }
      );

      setInvalidVoters(res.data.invalid_voters || []);
      setInsertedCount(res.data.inserted || 0);

      if (res.data.inserted > 0) {
        setMessage({
          type: "success",
          text: "Voter successfully added to election!",
        });
      } else {
        setMessage({
          type: "error",
          text: "Invalid or already registered voter.",
        });
      }

      setVoterId("");
      setConsent(false);

    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: "Error inserting voter.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consent-wrapper">
      <div className="consent-card">

        <h2>Manual Voter Entry</h2>
        <p className="description">
          Enter a voter ID to register them for this election.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Voter ID *</label>
            <input
              type="text"
              placeholder="e.g., V123456"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              required
            />
          </div>

          <div className="consent-group">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <label htmlFor="consent">
              I confirm that this voter is eligible and approved.
            </label>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Voter"}
          </button>
        </form>

        {message && (
          <div className={`alert ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Optional Info Display */}
        {insertedCount > 0 && (
          <p className="success-info">
            Inserted: {insertedCount}
          </p>
        )}

        {invalidVoters.length > 0 && (
          <p className="error-info">
            Invalid Voters: {invalidVoters.join(", ")}
          </p>
        )}

      </div>
    </div>
  );
}