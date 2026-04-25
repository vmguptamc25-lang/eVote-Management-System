"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function CreateElection() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    result_published_at: "",
    total_votes: "",
  });

  // 🔐 AUTH + ROLE GUARD
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [loading, user, router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        result_published_at: form.result_published_at || null,
        created_by: user,
        total_votes: form.total_votes || 0,
      };

      const res = await axios.post(
        "http://localhost:5000/api/elections/create",
        payload,
        {
          withCredentials: true,
        }
      );

      setSuccess("Election created successfully (saved as draft).");

      setForm({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        result_published_at: "",
        total_votes: "",
      });
      console.log("crated response ",res);

    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="election-bg min-vh-100 py-5">
      <div className="container">

        <div className="election-card mx-auto">
          <h2 className="title text-center mb-2 text-dark">
            Create New Election
          </h2>

          <p className="subtitle text-center mb-4">
            Set up a new election with voting & result parameters
          </p>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label">Election Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="e.g., General Assembly Elections 2026"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

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

            <div className="row">

              <div className="col-md-6 mb-3">
                <label className="form-label">Voting Start Time</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  className="form-control"
                  value={form.start_time}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Voting End Time</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  className="form-control"
                  value={form.end_time}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="mb-3">
              <label className="form-label">
                Result Publish Date & Time
              </label>

              <input
                type="datetime-local"
                name="result_published_at"
                className="form-control"
                value={form.result_published_at}
                onChange={handleChange}
              />

              <small className="helper-text">
                Results will be automatically published at this time.
              </small>
            </div>

            <div className="mb-4">
              <label className="form-label">Expected Total Votes</label>

              <input
                type="number"
                name="total_votes"
                className="form-control"
                placeholder="e.g., 10000"
                value={form.total_votes}
                onChange={handleChange}
              />
            </div>

            <button
              className="btn btn-primary w-100"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Election"}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}