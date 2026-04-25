"use client";

import { useState ,useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import "@/assets/css/election-verify.css";

export default function ElectionVerification() {
  const [electionId, setElectionId] = useState("");
  const [error, setError] = useState("");
  // const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { user, loading ,setLoading } = useAuth();
    // const router = useRouter();
  
    // 🔐 AUTH + ROLE GUARD
    useEffect(() => {
      if (!loading) {
        // Not logged in
        if (!user) {
          router.replace("/login");
        }
        // Logged in but not ADMIN
        else if (user.role !== "ADMIN") {
          router.replace("/"); // or "/unauthorized"
        }
      }
    }, [loading, user, router]);
  
    // ⏳ While checking auth
    if (loading) {
      return <p>Loading...</p>;
    }
  
    // 🚫 If not logged in or not admin → don't render
    if (!user || user.role !== "ADMIN") {
      return null;
    }
  
  const handleVerify = async (e) => {
    e.preventDefault();

    if (!electionId.trim()) {
      setError("Election ID is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await axios.get(
        `http://localhost:5000/api/elections/${electionId}`,
        { withCredentials: true }
      );
      if (res.data.election) {
        // Save election info
        localStorage.setItem("verifiedElectionId", res.data.election.id);
        localStorage.setItem("verifiedElectionName", res.data.election.title);

        router.push("/admin/dashboard/election-verify/election-voters");
      } else {
        setError("Election ID not found in database");
      }

    } catch (err) {
      console.error(err);
      setError("Election ID not found in database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ev-verification-wrapper">
      <div className="ev-verification-card shadow-lg p-4">
        <div className="text-center mb-4">
          <div className="ev-verify-icon">✔</div>
          <h2>Election Verification</h2>
          <p>Enter the Election ID to verify and proceed</p>
        </div>

        <form onSubmit={handleVerify}>
          <label className="ev-label">Election ID</label>
          <input
            type="number"
            className="form-control mb-3"
            placeholder="e.g., 7"
            value={electionId}
            onChange={(e) => setElectionId(e.target.value)}
            required
          />

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Verifying..." : "Verify Election"}
          </button>
        </form>

        {error && (
          <div className="alert alert-danger mt-3">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}