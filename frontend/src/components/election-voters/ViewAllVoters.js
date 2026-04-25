"use client";

import { useEffect, useState } from "react";
import '@/assets/css/view-all-voters.css'
import axios from "axios";

export default function ViewAllVoter() {
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const electionId = localStorage.getItem("verifiedElectionId");

    const fetchVoters = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/election-voters/${electionId}/voters`,
          { withCredentials: true }
        );
        setVoters(res.data);
        setFilteredVoters(res.data);
      } catch (err) {
        setError("Failed to fetch voters");
      } finally {
        setLoading(false);
      }
    };

    if (electionId) fetchVoters();
  }, []);

  // 🔍 Search Filter
  useEffect(() => {
    const filtered = voters.filter((v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.mobile.includes(search)
    );
    setFilteredVoters(filtered);
  }, [search, voters]);

  if (loading) return <div className="vm-loading">Loading voters...</div>;
  if (error) return <div className="vm-error">{error}</div>;

  return (
    <div className="vm-container">
      <div className="vm_header">
        <h2>Enrolled Voters</h2>
        <input
          type="text"
          placeholder="Search by name, email, mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="vm-search"
        />
      </div>

      {filteredVoters.length === 0 ? (
        <div className="vm-empty">No voters found.</div>
      ) : (
        <div className="vm-table-wrapper">
          <table className="vm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>DOB</th>
              </tr>
            </thead>
            <tbody>
              {filteredVoters.map((voter, index) => (
                <tr key={voter.voter_id}>
                  <td>{index + 1}</td>
                  <td>{voter.name}</td>
                  <td>{voter.email}</td>
                  <td>{voter.mobile}</td>
                  <td>{new Date(voter.dob).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}