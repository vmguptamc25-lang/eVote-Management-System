const express = require("express");
const router = express.Router();
const db = require("../config/pooldb.js");
const crypto = require("crypto");

// 🔍 GET USER PROFILE
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // 🔹 Step 1: Get user + voter details
    const [rows] = await db.execute(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.profile_picture,
        u.role,
        u.auth_provider,
        u.is_active,
        u.last_login,
        u.created_at,

        v.id AS voter_id,
        v.mobile,
        v.dob,
        v.is_verified,
        v.aadhaar_hash

      FROM users u
      LEFT JOIN voters v ON u.id = v.user_id
      WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // 🔥 Step 2: Find LAST VOTE + ELECTION NAME
    let lastVote = null;

    if (user.voter_id) {
      const secret = process.env.VOTE_SECRET || "fallback_secret";

      // 👉 Join votes + elections
      const [votes] = await db.execute(
        `SELECT 
          v.election_id,
          v.voter_hash,
          v.voted_at,
          e.title AS election_name
        FROM votes v
        JOIN elections e ON v.election_id = e.id`
      );

      for (let vote of votes) {
        const generatedHash = crypto
          .createHash("sha256")
          .update(`${user.voter_id}_${vote.election_id}_${secret}`)
          .digest("hex");

        if (generatedHash === vote.voter_hash) {
          // pick latest vote
          if (
            !lastVote ||
            new Date(vote.voted_at) > new Date(lastVote.time)
          ) {
            lastVote = {
              time: vote.voted_at,
              election: vote.election_name
            };
          }
        }
      }
    }

    // 🎯 Final response
    const profile = {
      header: {
        name: user.name,
        profileImage: user.profile_picture
          ? user.profile_picture.startsWith("http")
            ? user.profile_picture
            : `http://localhost:5000/uploads/${user.profile_picture}`
          : "https://randomuser.me/api/portraits/men/75.jpg",
        status: user.is_active ? "Active" : "Inactive",
        voterId: `VOTE-${user.id}`,
        description: "Registered voter actively participating in elections"
      },

      personal: {
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        location: "Mumbai, India",
        aadhaarLinked: !!user.aadhaar_hash
      },

      security: {
        role: user.role,
        loginMethod: user.auth_provider,
        verified: !!user.is_verified,
        lastLogin: user.last_login
      },

      activity: {
        registeredOn: user.created_at,
        lastVote: lastVote, // ✅ NOW OBJECT
        status: user.is_verified ? "Eligible" : "Not Eligible"
      }
    };

    res.json(profile);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;