"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import FileUpload from "./FileUpload";
import AddManually from "./AddManually";
import ViewAllVoter from "./ViewAllVoters";
import "@/assets/css/election-verify.css"
import "@/assets/css/election-voters.css"

export default function VoterManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upload");

  const [electionId, setElectionId] = useState("");
  const [electionName, setElectionName] = useState("");
  const [votersno, setVotersno] = useState(0);


  useEffect(() => {
  const id = localStorage.getItem("verifiedElectionId");
  const name = localStorage.getItem("verifiedElectionName");

  if (!id) return;

  setElectionId(id);
  setElectionName(name);

  const fetchVoters = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/election-voters/${id}/voters`,
        { withCredentials: true }
      );

      setVotersno(res.data);
    } catch (err) {
      console.error(err);
      setVotersno([]);
    }
  };

  fetchVoters();
}, []);

  const handleLogout = () => {
    localStorage.removeItem("verifiedElectionId");
    localStorage.removeItem("verifiedElectionName");
    router.push("/admin/dashboard/election-verify");
  };

  return (
    <div className="vm-wrapper">
      <div className="container py-4">

        {/* Header */}
        <div className="vm-header shadow-sm">
          <div className="d-flex justify-content-between">

            <div>
              <button onClick={handleLogout} className="vm-back-btn">
                ← Back to Verification
              </button>

              <h2 className="mt-3">Voter Management</h2>
              <p>{electionName}</p>
              <p>Election ID: {electionId}</p>
            </div>

            <div className="vm-total-card">
              <small>Total Voters</small>
              <h2>{votersno.length}</h2>
            </div>

          </div>
        </div>
        {/* Top Tab Options */}
        <div className="voter-tabs">
          <button
            className={activeTab === "upload" ? "active" : ""}
            onClick={() => setActiveTab("upload")}
          >
            Upload Excel File
          </button>

          <button
            className={activeTab === "manual" ? "active" : ""}
            onClick={() => setActiveTab("manual")}
          >
            Add Manually
          </button>

          <button
            className={activeTab === "list" ? "active" : ""}
            onClick={() => setActiveTab("list")}
          >
            View All Voters ({votersno.length})
          </button>
        </div>

        {/* Render Component Based on Tab */}
        <div className="tab-content">
          {activeTab === "upload" && <FileUpload voters={votersno} setVoters={setVotersno} />}
          {activeTab === "manual" && <AddManually />}
          {activeTab === "list" && <ViewAllVoter />}
        </div>




      </div>
    </div>
  );
}