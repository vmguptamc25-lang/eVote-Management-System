"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function ActiveElections() {
  const [elections, setElections] = useState([]);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/active-elections",
          { withCredentials: true }
        );

        setElections(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchElections();
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h5 className="section-title">Active Elections</h5>
          <p className="text-muted mb-0">
            Elections currently accepting votes
          </p>
        </div>

        <span className="badge bg-success px-3 py-2">
          Live Elections
        </span>
      </div>

      <div className="row g-4 mt-1">
        {elections.length === 0 ? (
          <p>No active elections</p>
        ) : (
          elections.map((election) => (
            <ElectionCard
              key={election.id}
              title={election.title}
              description={election.description}
              votes={election.total_votes || 0}
              turnout={calculateTurnout(election)}
              candidates={election.candidate_count || 0}
              endDate={formatDate(election.end_time)}
            />
          ))
        )}
      </div>
    </>
  );
}

// 🔢 turnout calculation
function calculateTurnout(election) {
  if (!election.total_voters || election.total_voters === 0) return 0;
  return Math.round((election.total_votes / election.total_voters) * 100);
}

// 📅 format date
function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
}

function ElectionCard({
  title,
  description,
  votes,
  turnout,
  candidates,
  endDate,
}) {
  return (
    <div className="col-md-6">
      <div className="active-election-card h-100">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="fw-semibold mb-0">{title}</h6>
          <span className="badge bg-success">Live</span>
        </div>

        {/* Description */}
        <p className="text-muted small mb-3">{description}</p>

        {/* Stats */}
        <div className="row text-center mb-3">
          <div className="col">
            <strong>{votes.toLocaleString()}</strong>
            <div className="stat-label">Votes</div>
          </div>
          <div className="col">
            <strong>{turnout}%</strong>
            <div className="stat-label">Turnout</div>
          </div>
          <div className="col">
            <strong>{candidates}</strong>
            <div className="stat-label">Candidates</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="progress" style={{ height: "6px" }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${turnout}%` }}
            />
          </div>
          <small className="text-muted">
            {turnout}% voter participation
          </small>
        </div>

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <small className="text-muted">
            Ends on <strong>{endDate}</strong>
          </small>

          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-primary">
              View
            </button>
            <button className="btn btn-outline-secondary">
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}