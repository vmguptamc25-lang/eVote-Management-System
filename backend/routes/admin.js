const express = require("express");
const router = express.Router();
const db = require("../config/pooldb");

// 📊 DASHBOARD STATS
router.get("/stats", async (req, res) => {
  try {
    const [totalElections] = await db.query("SELECT COUNT(*) as count FROM elections");
    const [activeElections] = await db.query("SELECT COUNT(*) as count FROM elections WHERE status='ACTIVE'");
    const [totalVotes] = await db.query("SELECT COUNT(*) as count FROM votes");
    const [totalVoters] = await db.query("SELECT COUNT(*) as count FROM voters");

    res.json({
      totalElections: totalElections[0].count,
      activeElections: activeElections[0].count,
      totalVotes: totalVotes[0].count,
      totalVoters: totalVoters[0].count,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// 🏆 RESULTS API (MAIN LOGIC)
router.get("/results", async (req, res) => {
  try {

    // 1. Get all published elections
    const [elections] = await db.query(`
      SELECT * FROM elections
      WHERE status = 'RESULT_PUBLISHED'
      ORDER BY result_published_at DESC
    `);

    const finalData = [];

    for (let election of elections) {

      // 2. Get candidates + votes
      const [candidates] = await db.query(`
        SELECT 
          c.id,
          c.name,
          c.party,
          c.image,
          COUNT(v.id) AS votes
        FROM candidates c
        LEFT JOIN votes v 
          ON c.id = v.candidate_id
        WHERE c.election_id = ?
        GROUP BY c.id
        ORDER BY votes DESC
      `, [election.id]);

      // 3. Total votes
      const totalVotes = candidates.reduce(
        (sum, c) => sum + c.votes,
        0
      );
      console.log("this is my candidate", candidates);

      // 4. Add percentage
      const candidatesWithPercent = candidates.map(c => ({
        ...c,
        percent: totalVotes
          ? ((c.votes / totalVotes) * 100).toFixed(1)
          : 0
      }));

      // 5. Winner
      const winner = candidatesWithPercent[0] || null;

      finalData.push({
        id: election.id,
        title: election.title,
        description: election.description,
        totalVotes,
        publishedDate: election.result_published_at,
        winner,
        candidates: candidatesWithPercent
      });
    }

    res.json(finalData);

  } catch (err) {
    console.error("Results API Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;