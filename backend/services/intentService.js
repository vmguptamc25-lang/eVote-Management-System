function detectIntent(message) {
  const msg = message.toLowerCase();

  // ✅ VALID KEYWORDS (ONLY ALLOW THESE)
  const validKeywords = [
    "vote",
    "election",
    "candidate",
    "eligible",
    "login",
    "enrolled",
    "voted",
    "result",
    "status"
  ];

  const isValid = validKeywords.some(word => msg.toLowerCase().includes(word));

  if (!isValid) {
    return res.json({
      reply: "🤖 Sorry, I can only help with e-voting related queries."
    });
  }


  if (msg.includes("eligible")) return "eligibility";
  if (
    msg.includes("result", "Result") ||
    msg.includes("winner", "Winner") ||
    msg.includes("result published")
  ) {
    return "result";
  }
  if (msg.includes("current", "Current", "Active", "active", "Ongoing", "ongoing")) return "active";
  if (msg.includes("vote") && msg.includes("did")) return "vote_status";
  if (msg.includes("candidate")) return "candidate_info";
  if (msg.includes("login", "last login")) return "last_login";
  if (msg.includes("last", "recent", "votes", "voted")) return "last_voted";
  if (
    msg.includes("upcoming", "Upcoming") ||
    msg.includes("next election", " upcoming election", "Upcoming election") ||
    msg.includes("future election")
  ) {
    return "upcoming";
  }

  if (msg.includes("election")) return "election_info";
  if (
    msg.includes("missed election") ||
    msg.includes("miss election")
  ) {
    return "general";
  }




  return "general";
}

module.exports = { detectIntent };