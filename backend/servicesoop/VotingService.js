const db =
    require("../config/pooldb");

class VotingService {
//     1. Encapsulation ✅

// Data + behavior are bundled inside classes.

// Example:

    async getUser(userId) {

        const [rows] =
            await db.query(
                "SELECT * FROM users WHERE id=?",
                [userId]
            );

        return rows[0];
    }

    async getVoter(userId) {

        const [rows] =
            await db.query(
                "SELECT * FROM voters WHERE user_id=?",
                [userId]
            );

        return rows[0];
    }

    async getElections(voterId) {

        const [rows] =
            await db.query(`
 SELECT e.*,ev.is_eligible,
 ev.has_voted

 FROM election_voters ev
 JOIN elections e
 ON ev.election_id=e.id

 WHERE ev.voter_id=?
 `, [voterId]);

        return rows;
    }

    async getUpcoming(voterId) {

        const [rows] =
            await db.query(`
 SELECT e.title,
 e.start_time,
 e.end_time,
 e.status

 FROM election_voters ev
 JOIN elections e
 ON ev.election_id=e.id

 WHERE ev.voter_id=?
 AND e.start_time > NOW()
 `, [voterId]);

        return rows;
    }

    async getActive() {

        const [rows] =
            await db.query(`
 SELECT title,end_time
 FROM elections
 WHERE status='ACTIVE'
 `);

        return rows;
    }

    async getResults(voterId) {

        const [rows] =
            await db.query(`
 SELECT
 e.title,
 e.total_votes,
 ev.has_voted

 FROM election_voters ev
 JOIN elections e
 ON ev.election_id=e.id

 WHERE ev.voter_id=?
 AND e.status='RESULT_PUBLISHED'
 `, [voterId]);

        return rows;
    }

}

//You created an object from a class.
// 4. Modular/Class-based Design ✅

// Responsibilities separated:

// IntentService  → intent logic

// VotingService  → DB logic

// AIService      → GenAI logic
// So currently you have:
// ✔ Encapsulation

// ✔ Abstraction

// ✔ Object Instantiation

// ✔ Modular OOP Design

// (But not Inheritance or Polymorphism yet)

// Interview answer

// Say:

// I used OOP by encapsulating voting, intent detection, and generative AI logic into service classes, applied abstraction through service methods, and instantiated these as reusable objects in the controller.

module.exports =
    new VotingService();