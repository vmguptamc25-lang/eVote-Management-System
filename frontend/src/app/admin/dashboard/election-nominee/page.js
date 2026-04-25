"use client";
import { useState ,useEffect} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export default function NominationForm() {
    const [electionId, setElectionId] = useState("");
    const [election, setElection] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const { user, loading ,setLoading } = useAuth();
  const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        party: "",
        image: null,
    });

    const [preview, setPreview] = useState(null);
    // const [loading, setLoading] = useState(false);

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

    const BASE_URL = "http://localhost:5000";

    // 🔍 Verify Election (Axios)
    const verifyElection = async () => {
        if (!electionId) return alert("Please enter Election ID");

        setVerifying(true);

        try {
            const res = await axios.get(
                `${BASE_URL}/api/candidates/verify/${electionId}`,
                {
                    withCredentials: true, // important for cookies (JWT)
                }
            );
            setElection(res.data);

        } catch (error) {
            setElection(null);
            alert("Election Not Found ❌");
        }

        setVerifying(false);
    };
    // Handle Input Change
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            const file = files[0];
            if (file) {
                setFormData({ ...formData, image: file });
                setPreview(URL.createObjectURL(file));
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.image) {
            return alert("Please upload an image");
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("party", formData.party);
            data.append("image", formData.image);
            data.append("election_id", electionId);

            const res = await axios.post(
                `${BASE_URL}/api/candidates/add`,
                data,
                {
                    withCredentials: true, // for cookies (JWT)
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert(res.data.message || "Candidate Registered Successfully 🎉");

            // Reset form
            setFormData({ name: "", party: "", image: null });
            setPreview(null);
            setElection(null);
            setElectionId("");

        } catch (error) {
            console.log("Error:", error.response);

            if (error.response) {
                alert(error.response.data.message || "Server error");
            } else {
                alert("Something went wrong");
            }
        }

        setLoading(false);
    };


    return (
        <div className="admin-wrapper">
            <div className="admin-card">
                <h2 className="text-center fw-bold mb-4">
                    Nomination Registration Panel
                </h2>

                {/* Election Verify Section */}
                <div className="verify-box mb-4">
                    <label className="form-label fw-semibold">
                        Enter Election ID
                    </label>

                    <div className="d-flex gap-3">
                        <input
                            type="number"
                            className="form-control modern-input"
                            value={electionId}
                            onChange={(e) => setElectionId(e.target.value)}
                            placeholder="Election ID"
                        />
                        <button
                            className="btn btn-primary px-4"
                            onClick={verifyElection}
                            disabled={verifying}
                        >
                            {verifying ? "Verifying..." : "Verify"}
                        </button>
                    </div>
                </div>

                {/* Election Info */}
                {election && (
                    <div className="election-info mb-4">
                        <h5 className="badge bg-danger">Election Id:-  {election.id}</h5>
                        <br></br>
                        <span className="badge bg-secondary">
                            Title:- {election.title}
                        </span>
                        <br></br>
                        <span className="badge bg-secondary">
                            Begin:- {election.start_time}
                        </span>
                        <br></br>
                        <span className="badge bg-secondary">
                            Status:- {election.status}
                        </span>
                        <br></br>
                        <span className="badge bg-success">
                            Result Date:- {election.result_published_at}
                        </span>
                    </div>
                )}

                {/* Candidate Form */}
                <form onSubmit={handleSubmit}>
                    <fieldset disabled={!election}>
                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control modern-input"
                                name="name"
                                placeholder="Candidate Name"
                                onChange={handleChange}
                                required
                            />
                            <label>Candidate Name</label>
                        </div>

                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control modern-input"
                                name="party"
                                placeholder="Party Name"
                                onChange={handleChange}
                            />
                            <label>Party Name</label>
                        </div>

                        <div className="upload-box text-center mb-3">
                            <input
                                type="file"
                                hidden
                                id="imageUpload"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="imageUpload">
                                {preview ? (
                                    <img src={preview} className="preview-img" alt="preview" />
                                ) : (
                                    <>
                                        <div className="upload-icon">📤</div>
                                        <p>Upload Candidate Image</p>
                                    </>
                                )}
                            </label>
                        </div>

                        <button
                            className="btn-submit w-100"
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register Candidate"}
                        </button>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}
