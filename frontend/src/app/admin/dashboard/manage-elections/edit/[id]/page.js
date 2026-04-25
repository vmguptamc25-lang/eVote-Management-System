"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export default function EditElection() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    result_published_at: "",
    status: "CREATED",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔹 Fetch election by ID
  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/elections/${id}`,
          { withCredentials: true }
        );

        const e = res.data.election;

        setForm({
          title: e.title || "",
          description: e.description || "",
          start_time: e.start_time
            ? e.start_time.slice(0, 16)
            : "",
          end_time: e.end_time
            ? e.end_time.slice(0, 16)
            : "",
          result_published_at: e.result_published_at
            ? e.result_published_at.slice(0, 16)
            : "",
          status: e.status || "CREATED",
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load election"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchElection();
  }, [id]);

  // 🔹 Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Update election
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await axios.put(
        `http://localhost:5000/api/elections/${id}`,
        form,
        { withCredentials: true }
      );

      setSuccess("Election updated successfully");
    } catch (err) {
      setError(
        err.response?.data?.message || "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading election...</p>;

  return (
    <div className="admin-content">
      <h3>Edit Election</h3>
      <p className="text-muted">
        Modify election details and status
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="edit-election-form">
        {/* Title */}
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {/* Dates */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Start Time</label>
            <input
              type="datetime-local"
              name="start_time"
              className="form-control"
              value={form.start_time}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">End Time</label>
            <input
              type="datetime-local"
              name="end_time"
              className="form-control"
              value={form.end_time}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">
              Result Publish Time
            </label>
            <input
              type="datetime-local"
              name="result_published_at"
              className="form-control"
              value={form.result_published_at}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-select"
            value={form.status}
            onChange={handleChange}
          >
            <option value="CREATED">CREATED (Draft)</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CLOSED">CLOSED</option>
            <option value="RESULT_PUBLISHED">
              RESULT_PUBLISHED
            </option>
          </select>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Election"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              router.push("/admin/dashboard/manage-elections")
            }
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
