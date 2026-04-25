"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/assets/css/results.css";

export default function ResultsPage() {

    const [elections, setElections] = useState([]);
    const [search, setSearch] = useState("");

    // 🔥 Fetch real data
    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/admin/results",
                    { withCredentials: true }
                );
                setElections(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchResults();
    }, []);

    // 🔍 search filter
    const filtered = elections.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase())
    );

    console.log("elections:-", elections);

    return (
        <div className="container-fluid p-0">

            {/* HEADER */}
            <div className="result-header text-white text-center py-2">
                <h2>Election Results Dashboard</h2>
                <p>Declared Results for All Elections</p>
            </div>

            <div className="container mt-4">

                <input
                    type="text"
                    className="form-control mb-4"
                    placeholder="Search election..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {filtered.map((election) => (
                    <div key={election.id} className="result-card mb-4">

                        {/* HEADER */}
                        <div className="card-header-custom p-3 text-white d-flex justify-content-between">
                            <div>
                                <h5 className="mb-1">{election.title}</h5>

                                <small className="d-block mb-2">
                                    {election.description}
                                </small>

                                <div className="small">
                                    Published:{" "}
                                    {election.publishedDate
                                        ? new Date(election.publishedDate).toLocaleDateString()
                                        : "N/A"}
                                </div>

                                <div className="small">
                                    Total Votes:{" "}
                                    {election.totalVotes?.toLocaleString()}
                                </div>
                            </div>

                            <span className="badge bg-success align-self-start">
                                RESULT_PUBLISHED
                            </span>
                        </div>
                        {/* WINNER */}
                        {election.winner && (
                            <div className="winner-box p-3">
                                <h6>🏆 Winner</h6>

                                <div className="winner-card d-flex justify-content-between p-3">
                                    <div className="d-flex gap-2 align-items-center">
                                        <img
                                            src={`http://localhost:5000/uploads/${election.winner.image}`}
                                            width="50"
                                            className="rounded-circle"
                                        />
                                        <div>
                                            <strong>{election.winner.name}</strong>
                                            <div className="badge bg-warning text-dark">
                                                {election.winner.party}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        <h5>{election.winner.votes}</h5>
                                        <small>{election.winner.percent}%</small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CANDIDATES */}
                        <div className="p-3">
                            {election.candidates.map((c, i) => (
                                <div key={i} className="candidate-card p-3 mb-2">

                                    <div className="d-flex justify-content-between">

                                        <div className="d-flex gap-2 align-items-center">
                                            <span className="rank">{i + 1}</span>

                                            <img
                                                src={`http://localhost:5000/uploads/${c.image}`}
                                                width="40"
                                                className="rounded-circle"
                                            />

                                            <div>
                                                <strong>{c.name}</strong>
                                                <div className="small text-muted">
                                                    {c.party}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-end">
                                            <strong>{c.votes}</strong>
                                            <div>{c.percent}%</div>
                                        </div>

                                    </div>

                                    <div className="progress mt-2" style={{ height: "6px" }}>
                                        <div
                                            className="progress-bar bg-warning"
                                            style={{ width: `${c.percent}%` }}
                                        />
                                    </div>

                                </div>
                            ))}
                        </div>

                    </div>
                ))}

            </div>
        </div>
    );
}