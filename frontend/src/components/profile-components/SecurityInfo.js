"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function SecurityInfo({ data }) {
  const [faceStatus, setFaceStatus] = useState("loading"); 
  // loading | verified | not-registered

  useEffect(() => {
    const checkFace = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/face/me",
          { withCredentials: true }
        );

        if (res.data?.descriptor) {
          setFaceStatus("verified");
        } else {
          setFaceStatus("not-registered");
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setFaceStatus("not-registered");
        } else {
          console.error("Face check error:", err);
          setFaceStatus("not-registered");
        }
      }
    };

    checkFace();
  }, []);

  if (!data) return null;

  return (
    <div className="card p-3 shadow card-box">
      <h6 className="section-title">Authentication & Security</h6>

      <p>👤 Role: {data.role}</p>
      <p>🔐 Login Method: {data.loginMethod}</p>

      <p>
        ✅ Verification: {data.verified ? "Verified" : "Not Verified"}
      </p>

      <p>
        🕒 Last Login:{" "}
        {data?.lastLogin
          ? new Date(data.lastLogin).toLocaleString()
          : "N/A"}
      </p>

      {/* 🔥 FACE STATUS */}
      <hr />

      <p>
        🧠 Face Verification:{" "}
        {faceStatus === "loading" && "Checking..."}

        {faceStatus === "verified" && (
          <span style={{ color: "green", fontWeight: "bold" }}>
            ✅ Registered
          </span>
        )}

        {faceStatus === "not-registered" && (
          <span style={{ color: "red", fontWeight: "bold" }}>
            ❌ Not Registered
          </span>
        )}
      </p>

      {/* 🔥 ACTION BUTTON */}
      {faceStatus === "verified" ? (
        <Link href="/face-register" target="_blank" rel="noopener noreferrer">
          <button className="btn btn-warning btn-sm mt-2">
            🔄 Update Face
          </button>
        </Link>
      ) : (
        <Link href="/face-register">
          <button className="btn btn-primary btn-sm mt-2">
            ➕ Register Face
          </button>
        </Link>
      )}
    </div>
  );
}