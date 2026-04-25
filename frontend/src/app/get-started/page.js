"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import VoterEnrollment from "@/components/voter-enroll/voterenroll";
import { CheckCircleFill, ShieldCheck, PersonBadge } from "react-bootstrap-icons";
import "../../assets/css/get-started.css"
import { useState, useEffect } from "react";

export default function GetStarted() {
    const [activeTab, setActiveTab] = useState("info");
    const [voter, setVoter] = useState(null);
    const { user, loading, setLoading } = useAuth();
    const [error, setError] = useState("");
    const router = useRouter();

    // 🔐 AUTH GUARD
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);


    useEffect(() => {
        const fetchVoter = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/voter/me",
                    { withCredentials: true } // 🔥 sends JWT cookie
                );
                // console.log(res.data);
                setVoter(res.data.voter);
                console.log(voter)

            } catch (err) {
                if (err.response?.status === 404) {
                    // setError("You are not enrolled as a voter yet.");
                } else {
                    const message =
                        err.response?.data?.message ||
                        err.message ||
                        "Something went wrong";

                    setError(message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVoter();
    }, [loading, user]);

    if (loading) return <p>Loading voter data...</p>;

    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container my-5">
            {/* HERO SECTION */}
            <div className="text-center mb-5">
                <h1 className="main-title">Get Started with <span>ME2Vote</span></h1>
                <p className="subtitle">
                    Join the democratic revolution — enroll as a voter or login to cast your vote
                </p>
            </div>

            {/* TOGGLE TABS */}
            <div className="toggle-container mb-4">
                <button
                    className={`toggle-btn ${activeTab === "info" ? "active" : ""}`}
                    onClick={() => setActiveTab("info")}
                >
                    Information
                </button>
                <button
                    className={`toggle-btn ${activeTab === "enroll" ? "active" : ""}`}
                    onClick={() => setActiveTab("enroll")}
                >
                    Voter Enrollment
                </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === "info" && (
                <div className="card custom-card p-4 mb-5">
                    <h2 className="section-title">Welcome to ME2Vote</h2>
                    <p className="section-text">
                        Your gateway to secure, transparent, and efficient digital voting.
                    </p>

                    <p className="section-text">
                        ME2Vote is India&apos;s premier digital voting platform, designed to make
                        democracy accessible to everyone. Whether you&apos;re voting in national
                        elections, local governance, or organizational decisions, ME2Vote ensures
                        your voice is heard securely and anonymously.
                    </p>

                    <div className="note-box">
                        <strong>Note:</strong> To participate in elections, you must be a registered
                        voter. Complete the enrollment process to receive your unique Voter ID.
                    </div>
                </div>
            )}

            {activeTab === "enroll" && (
                <div className="card custom-card p-4 mb-5">
                    <h2 className="section-title">Voter Enrollment</h2>
                    <p className="section-text">
                        {
                            voter && voter.is_verified ? "Your Aadhaar Number Will be used as Unique Identity for Your Digital Voter ID" :
                                "Enroll yourself using Aadhaar and personal details to become a verified voteron ME2Vote."
                        }
                    </p>
                    {voter && voter.is_verified ?
                        <div className="voter-bg min-vh-100 py-5 ">
                            <div className="container">

                                {/* Digital Voter Card */}
                                <div className="card voter-card mb-4">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="text-primary fw-bold">
                                                <PersonBadge size={26} /> Digital Voter Card
                                            </h4>
                                            {voter.verified && (
                                                <span className="verified-badge">
                                                    <CheckCircleFill /> Verified
                                                </span>
                                            )}
                                        </div>

                                        <hr />

                                        <div className="row">
                                            <div className="col-md-6">
                                                <p className="label text-light">Voter ID Number</p>
                                                <p className="value text-secondary">{voter.aadhaar}</p>

                                                <p className="label text-light">Full Name</p>
                                                <p className="value text-secondary">{voter.name}</p>
                                            </div>

                                            <div className="col-md-6">
                                                <p className="label text-light">Date of Birth</p>
                                                <p className="value text-secondary">{voter.dob}</p>

                                                <p className="label text-light">Enrolled</p>
                                                <p className="value text-secondary">{voter.role}</p>
                                            </div>
                                        </div>

                                        <div className="aadhaar-verified">
                                            <ShieldCheck size={20} /> Aadhaar Verified
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div className="card info-card mb-4">
                                    <div className="card-body">
                                        <h5 className="section-title">Personal Information</h5>

                                        <p className="label text-light">Full Name</p>
                                        <p className="value text-secondary">{voter.name}</p>

                                        <p className="label text-light">Date of Birth</p>
                                        <p className="value text-secondary">{voter.dob}</p>

                                        <h6 className="sub-title">Contact Information</h6>

                                        <p className="label text-light">Email Address</p>
                                        <p className="value text-secondary">{voter.email}</p>

                                        <p className="label text-light">Mobile Number</p>
                                        <p className="value text-secondary">{voter.mobile}</p>
                                    </div>
                                </div>

                                {/* Verification & Address */}
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="card info-card mb-4">
                                            <div className="card-body">
                                                <h5 className="section-title">Verification Details</h5>

                                                <p className="label text-light">Aadhaar Number</p>
                                                <p className="value text-secondary">{voter.aadhaar}</p>

                                                <p className="label text-light">Verification Status</p>
                                                <p className="value text-success">Verified</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className="col-md-6">
                                        <div className="card info-card mb-4">
                                            <div className="card-body">
                                                <h5 className="section-title">Address Information</h5>
                                                <p className="value">{voter.address}</p>
                                            </div>
                                        </div>
                                    </div> */}
                                </div>

                                {/* Important Info */}
                                <div className="card important-card">
                                    <div className="card-body">
                                        <h5 className="section-title">Important Information</h5>
                                        <ul className="text-secondary">
                                            <li>Your Voter ID <strong>{voter.voterId}</strong> is your unique identifier for all elections</li>
                                            <li>Save or download your voter card for future reference</li>
                                            <li>You can now login and participate in active elections</li>
                                            <li>Your vote will be completely anonymous and secure</li>
                                        </ul>
                                    </div>
                                </div>

                            </div>
                        </div>
                        : <VoterEnrollment />
                    }

                </div>
            )}

            {/* HOW IT WORKS */}
            <div className="mb-5">
                <h2 className="section-title text-center mb-4">How It Works</h2>
                <div className="row g-4">
                    {[
                        {
                            step: "1",
                            title: "Enroll as Voter",
                            desc: "Register with your Aadhaar and personal details to get your Voter ID",
                        },
                        {
                            step: "2",
                            title: "Verify Identity",
                            desc: "Complete Aadhaar-based authentication for secure access",
                        },
                        {
                            step: "3",
                            title: "Browse Elections",
                            desc: "View active elections and learn about candidates",
                        },
                        {
                            step: "4",
                            title: "Cast Your Vote",
                            desc: "Make your choice securely — one vote per person guaranteed",
                        },
                    ].map((item) => (
                        <div key={item.step} className="col-md-6 col-lg-3">
                            <div className="step-card">
                                <div className="step-number">{item.step}</div>
                                <h5>{item.title}</h5>
                                <p>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* WHY CHOOSE */}
            <div className="why-section text-center">
                <h2 className="section-title mb-4">Why Choose ME2Vote?</h2>
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="why-card">
                            <h5>Bank-Grade Security</h5>
                            <p>End-to-end encryption & blockchain verification</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="why-card">
                            <h5>One Person, One Vote</h5>
                            <p>Aadhaar-based authentication prevents fraud</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="why-card">
                            <h5>Anonymous Voting</h5>
                            <p>Your vote is secret and cannot be traced back to you</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
