"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalVotes: 0,
    totalVoters: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/stats",
          { withCredentials: true }
        );

        setStats({
          totalElections: res.data.totalElections,
          activeElections: res.data.activeElections,
          totalVotes: res.data.totalVotes,
          totalVoters: res.data.totalVoters,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="row g-4 mb-4">
      <StatCard
        title="Total Elections"
        value={stats.totalElections}
        note="All elections"
      />

      <StatCard
        title="Active Elections"
        value={stats.activeElections}
        note="Live now"
      />

      <StatCard
        title="Total Votes"
        value={stats.totalVotes.toLocaleString()}
        note="Votes casted"
      />

      <StatCard
        title="Registered Voters"
        value={stats.totalVoters.toLocaleString()}
        note="Total users"
      />
    </div>
  );
}

function StatCard({ title, value, note }) {
  return (
    <div className="col-md-3">
      <div className="stat-card">
        <p>{title}</p>
        <h3>{value}</h3>
        <span className="note">{note}</span>
      </div>
    </div>
  );
}