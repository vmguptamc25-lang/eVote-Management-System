"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import "../../assets/css/voterenroll.css"

export default function VoterEnrollment() {

    const { user, loading } = useAuth();
    const [form, setForm] = useState({
        name: "",
        dob: "",
        email: "",
        mobile: "",
        aadhaar: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                "http://localhost:5000/api/voter/enroll",
                form,
                { withCredentials: true }
            );

            alert("Enrollment Successful! Your Voter ID will be generated after verification.");
        } catch (err) {
            if (err.response && err.response.data?.message) {
                alert(err.response.data.message);
            } else {
                alert("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div className="container enroll-container">
            <div className="enroll-card mx-auto">
                <h2 className="text-center mb-2">Voter Enrollment</h2>
                <p className="text-center subtitle">
                    Register to receive your Voter ID and participate in elections
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Personal Info */}
                    <h5 className="section-title">Personal Information</h5>

                    <div className="mb-3">
                        <label>Full Name (as per Aadhaar)</label>
                        <input
                            type="text"
                            className="form-control "
                            name="name"
                            value={user.name}
                            required
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            className="form-control"
                            name="dob"
                            required
                            onChange={handleChange}
                        />
                    </div>

                    {/* Contact */}
                    <h5 className="section-title">Contact Information</h5>

                    <div className="mb-3">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={user.email}
                            required
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label>Mobile Number</label>
                        <input
                            type="text"
                            className="form-control"
                            name="mobile"
                            placeholder="10-digit mobile number"
                            required
                            onChange={handleChange}
                        />
                    </div>

                    {/* Aadhaar */}
                    <h5 className="section-title">Identity Verification</h5>

                    <div className="mb-3">
                        <label>Aadhaar Number</label>
                        <input
                            type="password"
                            className="form-control"
                            name="aadhaar"
                            placeholder="12-digit Aadhaar number"
                            required
                            onChange={handleChange}
                        />
                        <small className="form-text text-secondary">
                            Your Aadhaar will be used for secure verification only
                        </small>
                    </div>



                    {/* Actions */}
                    <div className="d-flex justify-content-between mt-4">
                        <button type="button" className="btn btn-outline-light">
                            Back to Info
                        </button>
                        <button type="submit" className="btn enroll-btn">
                            Complete Enrollment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
