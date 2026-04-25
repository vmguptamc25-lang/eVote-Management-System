const db = require("../config/pooldb");

const checkAndNotifyElections = async () => {
    try {
        const [elections] = await db.execute(`
            SELECT id, title 
            FROM elections 
            WHERE status = 'ACTIVE' AND is_notified = 0
        `);

        console.log("Elections:", elections);

        for (let election of elections) {

            console.log(`Sending notification for: ${election.title}`);

            // ✅ STEP 1: Get user_id instead of voter_id
            const [voters] = await db.execute(`
                SELECT v.user_id 
                FROM election_voters ev
                JOIN voters v ON ev.voter_id = v.id
                WHERE ev.election_id = ?
            `, [election.id]);

            console.log("Users to notify:", voters);

            // ✅ STEP 2: Emit notification to each USER
            for (let voter of voters) {

                const room = `user_${voter.user_id}`; // ✅ CORRECT NOW

                console.log("Emitting to:", room);

                const clients = await global.io.in(room).fetchSockets();
                console.log(`Clients in ${room}:`, clients.length);

                if (clients.length > 0) {
                    global.io.to(room).emit("electionStarted", {
                        title: election.title,
                        election_id:election.id
                    });
                } else {
                    console.log(`User ${voter.user_id} not connected`);
                }
            }

            // ✅ STEP 3: Mark as notified
            await db.execute(`
                UPDATE elections 
                SET is_notified = 1 
                WHERE id = ?
            `, [election.id]);
        }

    } catch (error) {
        console.error("Notifier Error:", error);
    }
};

module.exports = checkAndNotifyElections;