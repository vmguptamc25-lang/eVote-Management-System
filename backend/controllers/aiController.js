const { getAIResponse } = require("../services/groqService");
const db = require("../config/pooldb");
const { detectIntent } = require("../services/intentService");

async function aiChat(req, res) {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    const intent = detectIntent(message);

    // 🔥 GET USER DATA
    const [userData] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );
    const user = userData[0];

    // 🔥 GET VOTER
    const [voterData] = await db.query(
      "SELECT * FROM voters WHERE user_id = ?",
      [userId]
    );
    const voter = voterData[0];

    // 🔥 GET ELECTIONS (ENROLLED)
    const [elections] = await db.query(`
      SELECT e.*, ev.is_eligible, ev.has_voted
      FROM election_voters ev
      JOIN elections e ON ev.election_id = e.id
      WHERE ev.voter_id = ?
    `, [voter?.id]);

    // 🔥 GET LAST VOTED ELECTION
    const [lastVote] = await db.query(`
      SELECT e.title, v.voted_at
      FROM votes v
      JOIN elections e ON v.election_id = e.id
      ORDER BY v.voted_at DESC
      LIMIT 1
    `);

    // ============================
    // 🎯 INTENT BASED RESPONSES
    // ============================

    // ✅ ELIGIBILITY
    if (intent === "eligibility") {
      const eligible = elections.some(e => e.is_eligible);

      return res.json({
        reply: eligible
          ? "✅ You are eligible for at least one election."
          : "❌ You are not eligible for any election.",
      });
    }

    // ✅ RESULT PUBLISHED (STRICT USER BASED)
    if (intent === "result") {

      if (!voter || !voter.id) {
        return res.json({ reply: "❌ Voter profile not found." });
      }

      const [results] = await db.query(`
    SELECT 
      e.id,
      e.title,
      e.result_published_at,
      e.total_votes,
      ev.has_voted
    FROM election_voters ev
    JOIN elections e ON ev.election_id = e.id
    WHERE ev.voter_id = ?
      AND e.status = 'RESULT_PUBLISHED'
    ORDER BY e.result_published_at DESC
  `, [voter.id]);

      if (!results.length) {
        return res.json({
          reply: "❌ No results available for your elections."
        });
      }

      const list = results.map(e => `
📌 ${e.title}
📊 Total Votes: ${e.total_votes}
🗳️ You Voted: ${e.has_voted ? "Yes" : "No"}
📅 Result Date: ${e.result_published_at
          ? new Date(e.result_published_at).toLocaleString()
          : "Not available"
        }
  `).join("\n");

      return res.json({
        reply: `🏆 Your Election Results:\n${list}`
      });
    }

    //ACTIVE ELECTION
    if (intent === "active") {
      const [active] = await db.query(`
    SELECT title, end_time
    FROM elections
    WHERE status = 'ACTIVE'
  `);

      if (!active.length) {
        return res.json({ reply: "❌ No active elections." });
      }

      return res.json({
        reply: "🟢 Active Elections:\n" +
          active.map(e => `- ${e.title} (Ends: ${new Date(e.end_time).toLocaleString()})`).join("\n")
      });
    }

    // ✅ UPCOMING ELECTIONS (ONLY USER ASSOCIATED)
    if (intent === "upcoming") {

      if (!voter) {
        return res.json({ reply: "❌ Voter profile not found." });
      }

      const [upcoming] = await db.query(`
    SELECT e.title, e.start_time, e.end_time, e.status
    FROM election_voters ev
    JOIN elections e ON ev.election_id = e.id
    WHERE ev.voter_id = ?
      AND e.start_time > NOW()
    ORDER BY e.start_time ASC
  `, [voter.id]);

      if (!upcoming.length) {
        return res.json({
          reply: "❌ No upcoming elections assigned to you."
        });
      }

      const list = upcoming.map(e => `
📌 ${e.title}
🕒 Starts: ${new Date(e.start_time).toLocaleString()}
🕒 Ends: ${new Date(e.end_time).toLocaleString()}
📊 Status: ${e.status}
  `).join("\n");

      return res.json({
        reply: `🗳️ Your Upcoming Elections:\n${list}`
      });
    }

    // ✅ VOTE STATUS
    if (intent === "vote_status") {
      const voted = elections.some(e => e.has_voted);

      return res.json({
        reply: voted
          ? "✅ You have already voted."
          : "❌ You have not voted yet.",
      });
    }

    // ✅ LAST VOTED ELECTION
    if (intent === "last_voted") {
      if (!lastVote.length) {
        return res.json({ reply: "❌ You have not voted yet." });
      }

      return res.json({
        reply: `🗳️ Last voted election:
- ${lastVote[0].title}
- Date: ${new Date(lastVote[0].voted_at).toLocaleString()}`
      });
    }

    // ✅ ENROLLED ELECTIONS
    if (intent === "enrolled") {
      if (!elections.length) {
        return res.json({ reply: "❌ You are not enrolled in any elections." });
      }

      const list = elections.map(e =>
        `- ${e.title} (${e.status})`
      ).join("\n");

      return res.json({
        reply: `📋 Your Enrolled Elections:\n${list}`
      });
    }

    // ✅ LAST LOGIN (UPDATED)
    if (intent === "last_login") {
      if (!user) {
        return res.json({
          reply: "⚠️ User data not found. Please login again.",
        });
      }

      const lastLogin = user.last_login
        ? new Date(user.last_login).toLocaleString()
        : "Not available";

      const accountCreated = user.created_at
        ? new Date(user.created_at).toLocaleDateString()
        : "Not available";

      return res.json({
        reply: `🕒 Account Activity:

• Last Login: ${lastLogin}
• Account Created: ${accountCreated}
• Status: ${user.is_active ? "Active ✅" : "Inactive ❌"}
`,
      });
    }

    // ✅ ELECTION INFO
    if (intent === "election_info") {
      if (!elections.length) {
        return res.json({ reply: "No elections found." });
      }

      const text = elections.map(e => `
📌 ${e.title}
Status: ${e.status}
Eligible: ${e.is_eligible ? "Yes" : "No"}
Voted: ${e.has_voted ? "Yes" : "No"}
Ends: ${e.end_time}
      `).join("\n");

      return res.json({ reply: text });
    }

    // ============================
    // 🤖 FALLBACK AI RESPONSE
    // ============================

    const prompt = `
You are an AI assistant ONLY for an online voting system.

STRICT RULES:
- Answer ONLY about elections, voting, eligibility, results
- If question is unrelated, reply:
  "Sorry, I can only help with e-voting related queries."

User Question:
${message}
`;

    const reply = await getAIResponse(prompt);

    return res.json({
      reply: reply || "⚠️ No response from AI",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: "🤖 Sorry, I can only help with e-voting related queries.",
    });
  }
}

module.exports = { aiChat };