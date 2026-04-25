const express = require("express");
const db = require("../config/pooldb.js");
const requireAuth = require("../middlewares/authMiddleware");
const crypto = require("crypto");

const router = express.Router();

router.post("/cast", requireAuth, async (req, res) => {
  let conn;

  try {
    const { election_id, candidate_id } = req.body;
    const userId = req.user.id;

    // ✅ 1. Validate input
    if (!election_id || !candidate_id) {
      return res.status(400).json({ message: "Invalid input" });
    }

    // ✅ 2. Get voter ID
    const [voter] = await db.query(
      "SELECT id FROM voters WHERE user_id=?",
      [userId]
    );

    if (voter.length === 0) {
      return res.status(404).json({ message: "Voter not found" });
    }

    const voterId = voter[0].id;

    // ✅ 3. Validate candidate belongs to election
    const [candidate] = await db.query(
      "SELECT id FROM candidates WHERE id=? AND election_id=?",
      [candidate_id, election_id]
    );

    if (candidate.length === 0) {
      return res.status(400).json({ message: "Invalid candidate for this election" });
    }

    // ✅ 4. Generate secure voter hash
    const secret = process.env.VOTE_SECRET || "fallback_secret";
    const voterHash = crypto
      .createHash("sha256")
      .update(`${voterId}_${election_id}_${secret}`)
      .digest("hex");

    // ✅ 5. Start transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 🔒 Lock row to prevent race condition
    const [existing] = await conn.query(
      "SELECT id FROM votes WHERE voter_hash=? AND election_id=? FOR UPDATE",
      [voterHash, election_id]
    );

    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: "You already voted" });
    }

    // ✅ 6. Insert vote
    await conn.query(
      "INSERT INTO votes (election_id, candidate_id, voter_hash) VALUES (?,?,?)",
      [election_id, candidate_id, voterHash]
    );

    // ✅ 7. Count total votes
    const [countResult] = await conn.query(
      "SELECT COUNT(*) AS totalVotes FROM votes WHERE election_id=?",
      [election_id]
    );

    const totalVotes = countResult[0].totalVotes;

    // ✅ Commit transaction
    await conn.commit();

    // ✅ 8. Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("vote-update", {
        electionId: election_id,
        totalVotes: totalVotes,
      });
    }

    // ✅ 9. Response
    res.json({
      message: "Vote cast successfully",
      totalVotes: totalVotes
    });

  } catch (err) {
    console.error("Vote Error:", err);

    if (conn) await conn.rollback();

    res.status(500).json({ message: "Server error" });

  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;