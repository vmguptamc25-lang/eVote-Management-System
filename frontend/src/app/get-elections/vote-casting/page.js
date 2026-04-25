"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import "@/assets/css/cast-vote.css";
import axios from "axios";

export default function VotePage() {

    const params = useSearchParams();
    const electionId = params.get("electionId");

    const SERVER_URL = "http://localhost:5000/uploads/";

    const [selected, setSelected] = useState(null);
    const [time, setTime] = useState(120);
    const [candidates, setCandidates] = useState([]);
    const [election, setElection] = useState(null);
    const [loadingElection, setLoadingElection] = useState(true);

    // FETCH ELECTION DETAILS
    useEffect(() => {

        const fetchElection = async () => {

            try {

                const res = await axios.get(
                    `http://localhost:5000/api/elections/detail/${electionId}`
                );

                const electionData = res.data?.election;

                if (!electionData || electionData.status !== "ACTIVE") {

                    alert("Voting is not active for this election.");

                    window.close();
                    window.location.href = "/";
                    return;
                }

                setElection(electionData);

                // fetch candidates only if election active
                fetchCandidates();

            } catch (err) {

                console.error("Error fetching election details", err);

            } finally {

                setLoadingElection(false);

            }

        };

        const fetchCandidates = async () => {

            try {

                const res = await axios.get(
                    `http://localhost:5000/api/candidates/election/${electionId}`,
                    { withCredentials: true }
                );

                setCandidates(res.data);

            } catch (err) {

                console.error("Error fetching candidates", err);

            }

        };

        if (electionId) {
            fetchElection();
        }

    }, [electionId]);



    // countdown timer
    useEffect(() => {

        if (time <= 0) {

            alert("Voting time expired.");

            window.close();
            window.location.href = "/";
            return;
        }

        const timer = setInterval(() => {
            setTime(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);

    }, [time]);



    const minutes = Math.floor(time / 60);
    const seconds = time % 60;



    // Cast Vote
    const castVote = async () => {

        if (!selected) return;

        try {

            await axios.post(
                "http://localhost:5000/api/votes/cast",
                {
                    election_id: electionId,
                    candidate_id: selected,
                },
                { withCredentials: true }
            );

            alert("Vote cast successfully");

            window.close();
            window.location.href = "/";

        } catch (err) {

            console.error(err);
            alert(err.response?.data?.message || "Vote failed");

        }

    };



    // BLOCK PAGE UNTIL CHECK COMPLETE
    if (loadingElection) {

        return (
            <div style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <h4>Checking election status...</h4>
            </div>
        );

    }



    return (

        <div className="vote-page">

            {/* HEADER */}
            <div className="vote-header">

                <div className="header-left">

                    <div className="logo-box">✓</div>

                    <div>
                        <h4>{election?.title}</h4>
                        <p>{election?.description}</p>
                    </div>

                </div>

                <div className="header-right">

                    <span className="candidate-count">
                        👥 {candidates.length} Candidates
                    </span>

                    <span className="secure">
                        🛡 Secure Voting
                    </span>

                </div>

            </div>


            {/* TIMER */}
            <div className="timer-box text-center">

                <h6>Voting Time Remaining</h6>

                <h2 className="timer">
                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </h2>

            </div>


            {/* HOW TO VOTE */}
            <div className="how-vote">

                <div className="row text-white">

                    <div className="col-md-4 step">
                        <span>1</span>
                        <h6>Review Candidates</h6>
                        <p>Read about each candidate's information</p>
                    </div>

                    <div className="col-md-4 step">
                        <span>2</span>
                        <h6>Select Your Choice</h6>
                        <p>Click candidate card to select</p>
                    </div>

                    <div className="col-md-4 step">
                        <span>3</span>
                        <h6>Cast Your Vote</h6>
                        <p>Confirm your vote below</p>
                    </div>

                </div>

            </div>


            {/* CANDIDATES */}
            <div className="container mt-4">

                <h5 className="mb-4">Select Your Candidate</h5>

                <div className="row">

                    {candidates.map(candidate => (

                        <div className="col-md-3" key={candidate.id}>

                            <div
                                className={`candidate-card ${selected === candidate.id ? "active" : ""}`}
                                onClick={() => setSelected(candidate.id)}
                            >

                                <div className="select-circle">
                                    {selected === candidate.id && "✓"}
                                </div>

                                <img src={`${SERVER_URL}${candidate.image}`} />

                                <h6>{candidate.name}</h6>

                                <p className="id">
                                    ID: {candidate.id}
                                </p>

                                <span className="badge bg-secondary">
                                    {candidate.party}
                                </span>

                            </div>

                        </div>

                    ))}

                </div>


                {/* VOTE BUTTON */}
                <div className="text-center mt-4">

                    <button
                        disabled={!selected}
                        className="btn vote-btn"
                        onClick={castVote}
                    >
                        🗳 Cast My Vote
                    </button>

                </div>

            </div>

        </div>

    );

}