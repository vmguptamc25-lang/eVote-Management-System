const AIService =
    require("../servicesoop/AIService");

const IntentService =
    require("../servicesoop/IntentService");

const VotingService =
    require("../servicesoop/VotingService");


async function aiChat(req, res) {

    try {

        const userId =
            req.user.id;

        const { message } =
            req.body;

        const intent =
            IntentService
                .detectIntent(message);


        const user =
            await VotingService
                .getUser(userId);

        const voter =
            await VotingService
                .getVoter(userId);

        const elections =
            await VotingService
                .getElections(voter.id);



        if (intent === "eligibility") {

            const eligible =
                elections.some(
                    e => e.is_eligible
                );

            return res.json({

                reply:
                    eligible
                        ? "✅ You are eligible"
                        : "❌ Not eligible"

            });

        }



        if (intent === "active") {

            const active =
                await VotingService
                    .getActive();

            if (!active.length) {

                return res.json({
                    reply:
                        "❌ No active elections."
                });

            }

            return res.json({

                reply:
                    "🟢 Active Elections:\n" +
                    active.map(
                        e => e.title
                    ).join("\n")

            });

        }

// Abstraction ✅

// Controller uses simple methods:

// VotingService.getUpcoming(voter.id)

// It does not know:

// what SQL runs
// how joins work
// how data is fetched

// Complexity is hidden.

        if (intent === "upcoming") {

            const upcoming =
                await VotingService
                    .getUpcoming(voter.id);

            if (!upcoming.length) {

                return res.json({
                    reply:
                        "❌ No upcoming elections."
                });

            }

            return res.json({

                reply:
                    "🗳️ Upcoming Elections:\n" +
                    upcoming.map(
                        u => u.title
                    ).join("\n")

            });

        }



        if (intent === "vote_status") {

            return res.json({

                reply:
                    elections.some(
                        e => e.has_voted
                    )

                        ? "✅ You have voted"

                        : "❌ You have not voted"

            });

        }



        if (intent === "enrolled") {

            return res.json({

                reply:
                    elections.map(
                        e => e.title
                    ).join("\n")

            });

        }



        if (intent === "last_login") {

            return res.json({

                reply:
                    `Last Login:
${user.last_login}`

            });

        }



        if (intent === "result") {

            const results =
                await VotingService
                    .getResults(voter.id);

            if (!results.length) {

                return res.json({
                    reply:
                        "❌ No results."
                });

            }

            return res.json({

                reply:
                    results.map(
                        r =>
                            `${r.title}
Votes:${r.total_votes}`
                    ).join("\n")

            });

        }



        if (intent === "election_info") {

            return res.json({

                reply:
                    elections.map(
                        e =>
                            `${e.title}
${e.status}`
                    ).join("\n")

            });

        }



        const reply =
            await AIService
                .generateResponse(
                    message
                );

        return res.json({
            reply
        });

    }

    catch (err) {

        console.error(err);

        res.status(500)
            .json({
                reply:
                    "Server error"
            });

    }

}

module.exports = {
    aiChat
};