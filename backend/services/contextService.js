const db = require("../config/pooldb");

async function getContext(userId) {

  const [voterRes] = await db.query(
    "SELECT * FROM voters WHERE user_id = ?",
    [userId]
  );

  const voter = voterRes[0];

  if (!voter) {
    throw new Error("Voter not found");
  }

  const [elections] = await db.query(`
    SELECT 
      e.id,
      e.title,
      e.status,
      e.start_time,
      e.end_time,
      ev.is_eligible,
      ev.has_voted
    FROM election_voters ev
    JOIN elections e ON ev.election_id = e.id
    WHERE ev.voter_id = ?
  `, [voter.id]);

  return { voter, elections };
}

// candidates
async function getCandidates(electionId) {
  const [rows] = await db.query(
    "SELECT name, party FROM candidates WHERE election_id = ?",
    [electionId]
  );

  return rows;
}

module.exports = { getContext, getCandidates };