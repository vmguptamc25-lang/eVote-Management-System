"use client";

import { useEffect, useState } from "react";
import * as faceapi from "face-api.js";

export default function FaceCompare() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [img1, setImg1] = useState(null);
  const [img2, setImg2] = useState(null);
  const [result, setResult] = useState("");

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      setModelsLoaded(true);
    };

    loadModels();
  }, []);

  // Convert file to image element
  const loadImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => resolve(img);
    });
  };

  // Get descriptor
  const getDescriptor = async (file) => {
    const img = await loadImage(file);

    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return null;

    return detection.descriptor;
  };

  // Compare images
  const compareFaces = async () => {
    if (!img1 || !img2) {
      setResult("⚠️ Please upload both images");
      return;
    }

    const desc1 = await getDescriptor(img1);
    const desc2 = await getDescriptor(img2);

    if (!desc1 || !desc2) {
      setResult("❌ Face not detected in one image");
      return;
    }

    const distance = faceapi.euclideanDistance(desc1, desc2);

    console.log("Distance:", distance);

    if (distance < 0.5) {
      setResult(`✅ Same Person (Distance: ${distance.toFixed(3)})`);
    } else {
      setResult(`❌ Different Person (Distance: ${distance.toFixed(3)})`);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Compare Two Images</h2>

      {!modelsLoaded ? (
        <p>Loading models...</p>
      ) : (
        <>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImg1(e.target.files[0])}
            />
          </div>

          <div style={{ marginTop: "10px" }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImg2(e.target.files[0])}
            />
          </div>

          <button
            onClick={compareFaces}
            style={{ marginTop: "20px" }}
          >
            Compare Faces
          </button>

          <p style={{ marginTop: "20px", fontWeight: "bold" }}>
            {result}
          </p>
        </>
      )}
    </div>
  );
}


