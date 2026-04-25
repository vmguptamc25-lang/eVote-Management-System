const express = require("express");
const router = express.Router();
const db = require("../config/pooldb");
const auth = require("../middlewares/authMiddleware.js");

// 🔥 Euclidean Distance Function
function getEuclideanDistance(arr1, arr2) {
  if (arr1.length !== arr2.length) return 1;

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
}

// ✅ REGISTER FACE WITH DUPLICATE CHECK
router.post("/register", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { descriptor } = req.body;

    if (!descriptor) {
      return res.status(400).json({ message: "Descriptor required" });
    }

    // 🔥 1️⃣ Get ALL stored descriptors
    const [rows] = await db.execute(
      "SELECT user_id, face_descriptor FROM face_verifications"
    );

    // 🔥 2️⃣ Compare with all users
    for (let row of rows) {
      if (!row.face_descriptor) continue;

      const stored = row.face_descriptor;

      const distance = getEuclideanDistance(stored, descriptor);

      console.log(`Comparing with user ${row.user_id}, distance:`, distance);

      // ⚠️ Threshold (IMPORTANT)
      if (distance < 0.5 && row.user_id !== userId) {
        return res.status(409).json({
          success: false,
          message: "❌ Duplicate face detected! This face is already registered.",
        });
      }
    }

    // 🔥 3️⃣ Save or Update
    const query = `
      INSERT INTO face_verifications (user_id, face_descriptor)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE face_descriptor = ?
    `;

    await db.execute(query, [
      userId,
      JSON.stringify(descriptor),
      JSON.stringify(descriptor),
    ]);

    res.json({
      success: true,
      message: "✅ Face registered successfully",
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET FACE
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(
      "SELECT face_descriptor FROM face_verifications WHERE user_id = ?",
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Face not registered" });
    }

    res.json({
      descriptor: rows[0].face_descriptor,
    });

  } catch (err) {
    console.error("FACE FETCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;