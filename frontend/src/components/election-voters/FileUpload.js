"use client";

import * as XLSX from "xlsx";
import axios from "axios";
import { useState } from "react";

export default function FileUpload({ voters, setVoters }) {
  const [duplicates, setDuplicates] = useState([]);
  const [invalidvoters, setInvalidvoters] = useState([]);
  const [insertedCount, setInsertedCount] = useState(0);
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      setVoters(jsonData);

      // Extract voter IDs (column must be VoterId)
      const voterIds = jsonData.map((row) => row.VoterId);

      // Detect duplicates inside Excel
      const seen = new Set();
      const duplicateList = [];

      voterIds.forEach((id) => {
        if (seen.has(id)) {
          duplicateList.push(id);
        } else {
          seen.add(id);
        }
      });

      setDuplicates(duplicateList);

      // Remove duplicates before sending to backend
      const uniqueVoterIds = [...new Set(voterIds)];
      const electionId = localStorage.getItem("verifiedElectionId");

      try {
        const res = await axios.post(
          "http://localhost:5000/api/election-voters/bulk-insert",
          {
            election_id: electionId,
            voter_ids: uniqueVoterIds,
          },
          { withCredentials: true }
        );
        setInvalidvoters(res.data.invalid_voters)
        setInsertedCount(res.data.inserted || 0);
      } catch (error) {
        console.error(error);
        alert("Error inserting voters");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="vm-upload-card shadow-sm mt-4">
      <h4>Upload Voter List</h4>

      <div className="vm-upload-box">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
        />
        <p>Drop your Excel file here or browse</p>
      </div>

      {/* Show Uploaded Table */}
      {voters.length > 0 && (
        <div className="mt-4">
          <h5>Uploaded Voters</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                {Object.keys(voters[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {voters.map((voter, index) => (
                <tr key={index}>
                  {Object.values(voter).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Show Inserted Count */}
      {insertedCount > 0 && (
        <div className="alert alert-success mt-3">
          ✅ {insertedCount} voters inserted successfully.
        </div>
      )}

      {/* Show Duplicate Entries */}
      {duplicates.length > 0 && (
        <div className="alert alert-warning mt-3">
          ⚠ Duplicate Voter IDs found in Excel:
          <ul>
            {duplicates.map((dup, index) => (
              <li key={index}>{dup}</li>
            ))}
          </ul>
        </div>
        
      )}
      {invalidvoters.length > 0 && (
        <div className="alert alert-danger mt-3">
          ⚠ Invalid Voter IDs found in Excel:
          <ul>
            {invalidvoters.map((dup, index) => (
              <li key={index}>{dup}</li>
            ))}
          </ul>
        </div>
        
      )}
    </div>
  );
}