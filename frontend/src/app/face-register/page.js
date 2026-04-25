"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function FaceRegisterPage() {
    const videoRef = useRef(null);

    const { user } = useAuth();

    const [faceapi, setFaceapi] = useState(null);
    const [loadingModels, setLoadingModels] = useState(true);
    const [registering, setRegistering] = useState(false);

    // ✅ Load face-api + models
    useEffect(() => {
        const loadFaceAPI = async () => {
            try {
                const module = await import("face-api.js");
                const api = module.default || module;

                setFaceapi(api);

                const MODEL_URL = "/models";

                await api.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await api.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await api.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

                setLoadingModels(false);

                startVideo();
            } catch (err) {
                console.error("Face API load error:", err);
            }
        };

        loadFaceAPI();
    }, []);

    // ✅ Start webcam
    const startVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "user" } })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error("Camera error:", err);
                alert("❌ Unable to access camera");
            });
    };

    // ✅ Register Face
    const registerFace = async () => {
        if (!user?.id) {
            alert("❌ User not logged in");
            return;
        }

        if (!faceapi) {
            alert("Face API not loaded yet");
            return;
        }

        setRegistering(true);

        try {
            const detection = await faceapi
                .detectSingleFace(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 320,
                        scoreThreshold: 0.5,
                    })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                alert("❌ No face detected. Try again.");
                setRegistering(false);
                return;
            }

            const descriptor = Array.from(detection.descriptor);

            console.log("Descriptor:", descriptor);

            await axios.post(
                "http://localhost:5000/api/face/register",
                { descriptor },
                { withCredentials: true }
            );

            alert("✅ Face Registered Successfully!");
            window.close();

        } catch (error) {
            if (error.response?.status === 409) {
                alert("❌ Duplicate Face Detected! Try another user.");
            } else {
                alert("❌ Registration failed");
            }
        }

        setRegistering(false);
    };

    return (
        <div className="container text-center mt-5">

            <h2>Face Registration</h2>
            <p>Register your face for secure voting</p>

            {loadingModels ? (
                <p>Loading AI models...</p>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        width="400"
                        height="400"
                        style={{
                            borderRadius: "50%",
                            border: "2px solid #ddd",
                            objectFit: "cover"
                        }}
                    />

                    <br />

                    <button
                        className="btn btn-primary mt-3"
                        onClick={registerFace}
                        disabled={registering}
                    >
                        {registering ? "Registering..." : "Register Face"}
                    </button>
                </>
            )}

        </div>
    );
}