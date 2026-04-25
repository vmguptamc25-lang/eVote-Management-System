"use client";

import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function FaceVerifyPage() {
  const videoRef = useRef();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    startVideo();
    loadModels();
  }, []);

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      });
  };

  const verifyFace = async () => {
    // 1. Get stored descriptor
    const res = await axios.get("http://localhost:5000/api/face/me", {
      withCredentials: true,
    });

    const storedDescriptor = new Float32Array(res.data.descriptor);

    // 2. Capture current face
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("No face detected");
      return;
    }

    const liveDescriptor = detection.descriptor;

    // 3. Compare
    const distance = faceapi.euclideanDistance(
      storedDescriptor,
      liveDescriptor
    );

    console.log("Distance:", distance);

    if (distance < 0.5) {
      setVerified(true);

      alert("✅ Face Verified!");

      const urlParams = new URLSearchParams(window.location.search);
      const electionId = urlParams.get("electionId");

      window.location.href = `/get-elections/vote-casting?electionId=${electionId}`;
    } else {
      alert("❌ Face Not Matched");
    }
  };

  return (
    <div className="container text-center mt-5">
      <h2>Face Verification</h2>

      <video ref={videoRef} autoPlay width="400" height="400" style={{
        borderRadius: "50%",
        border: "2px solid #ddd",
        objectFit: "cover"
      }} />

      <br />

      <button className="btn btn-primary mt-3" onClick={verifyFace}>
        Verify Face
      </button>
    </div>
  );
}