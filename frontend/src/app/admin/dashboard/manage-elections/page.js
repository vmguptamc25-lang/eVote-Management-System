"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ManageElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchElections = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/elections",
        { withCredentials: true }
      );

      setElections(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const deleteElection = async (id) => {
    if (!confirm("Delete this election permanently?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/elections/${id}`,
        { withCredentials: true }
      );

      setElections((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) return <p>Loading elections...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="admin-content">
      <h3>Manage Elections</h3>
      <p className="text-muted">
        View, edit or delete all elections
      </p>

      <div className="table-responsive mt-4">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light text-center">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Result Publish</th>
              <th>Expected Votes</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {elections.length > 0 ? (
              elections.map((e) => (
                <tr key={e.id}>
                  <td className="text-center">{e.id}</td>

                  <td>
                    <strong>{e.title}</strong>
                  </td>

                  <td className="text-muted">
                    {e.description || "—"}
                  </td>

                  <td className="text-center">
                    <span
                      className={`badge ${
                        e.status === "ACTIVE"
                          ? "bg-success"
                          : e.status === "CREATED"
                          ? "bg-secondary"
                          : e.status === "CLOSED"
                          ? "bg-warning text-dark"
                          : "bg-dark"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>

                  <td>
                    {e.start_time
                      ? new Date(e.start_time).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    {e.end_time
                      ? new Date(e.end_time).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    {e.result_published_at
                      ? new Date(
                          e.result_published_at
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td className="text-center">
                    {e.total_votes ?? 0}
                  </td>

                  <td className="text-center">
                    Admin #{e.created_by}
                  </td>

                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() =>
                          router.push(
                            `/admin/dashboard/manage-elections/edit/${e.id}`
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-outline-danger"
                        onClick={() => deleteElection(e.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="text-center text-muted"
                >
                  No elections found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
