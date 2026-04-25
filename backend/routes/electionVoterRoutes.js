const express = require("express");
const router = express.Router();
const db = require("../config/pooldb");
const crypto = require("crypto");

const hashAadhaar = (aadhaar) =>
  crypto.createHash("sha256").update(aadhaar.toString()).digest("hex");


// GET all voters of an election
router.get("/:id/voters", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT 
      v.id AS voter_id,
      u.name,
      u.email,
      v.mobile,
      v.dob,
      ev.is_eligible,
      ev.has_voted,
      ev.assigned_at
   FROM election_voters ev
   JOIN voters v ON ev.voter_id = v.id
   JOIN users u ON v.user_id = u.id
   WHERE ev.election_id = ?`,
      [id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//add voters of election 

router.post("/bulk-insert", async (req, res) => {
  const { election_id, voter_ids } = req.body;

  if (!election_id || !Array.isArray(voter_ids) || voter_ids.length === 0) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    // 🔹 1️⃣ Hash Aadhaar
    const hashMap = {};
    const hashed = voter_ids.map((aadhaar) => {
      const h = hashAadhaar(aadhaar);
      hashMap[h] = aadhaar;
      return h;
    });

    // 🔹 2️⃣ Find existing voters
    const [voters] = await db.query(
      "SELECT id, aadhaar_hash FROM voters WHERE aadhaar_hash IN (?)",
      [hashed]
    );

    const foundHashes = voters.map(v => v.aadhaar_hash);

    const invalidVoters = voter_ids.filter(
      aadhaar => !foundHashes.includes(hashAadhaar(aadhaar))
    );

    if (voters.length === 0) {
      return res.json({
        success: false,
        invalid_voters: invalidVoters,
      });
    }

    const voterIds = voters.map(v => v.id);

    // 🔹 3️⃣ Check already assigned voters
    const [alreadyAssigned] = await db.query(
      "SELECT voter_id FROM election_voters WHERE election_id = ? AND voter_id IN (?)",
      [election_id, voterIds]
    );

    const alreadyAssignedIds = alreadyAssigned.map(v => v.voter_id);

    // 🔹 4️⃣ Filter new voters only
    const newVoters = voters.filter(
      v => !alreadyAssignedIds.includes(v.id)
    );

    const values = newVoters.map(v => [
      election_id,
      v.id,
      1,
      0,
    ]);

    if (values.length > 0) {
      await db.query(
        `INSERT INTO election_voters 
         (election_id, voter_id, is_eligible, has_voted)
         VALUES ?`,
        [values]
      );
    }

    // 🔹 5️⃣ Prepare detailed response
    const alreadyAssignedAadhaar = voters
      .filter(v => alreadyAssignedIds.includes(v.id))
      .map(v => hashMap[v.aadhaar_hash]);

    res.json({
      success: true,
      requested: voter_ids.length,
      inserted: newVoters.length,
      invalid_voters: invalidVoters,
      already_assigned: alreadyAssignedAadhaar,
    });

  } catch (error) {
    console.error("Insert Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;