class IntentService {

    detectIntent(message) {

        const msg =
            message.toLowerCase();

        if (msg.includes("eligible"))
            return "eligibility";

        if (
            msg.includes("result") ||
            msg.includes("winner") ||
            msg.includes("result published")
        )
            return "result";

        if (
            msg.includes("active") ||
            msg.includes("ongoing") ||
            msg.includes("current")
        )
            return "active";

        if (
            msg.includes("upcoming") ||
            msg.includes("next election") ||
            msg.includes("future election")
        )
            return "upcoming";

        if (
            msg.includes("vote")
            && msg.includes("did")
        )
            return "vote_status";

        if (
            msg.includes("last voted") ||
            msg.includes("recent vote")
        )
            return "last_voted";

        if (
            msg.includes("enrolled")
        )
            return "enrolled";

        if (
            msg.includes("last login")
        )
            return "last_login";

        if (
            msg.includes("election")
        )
            return "election_info";

        return "general";

    }

}

module.exports =
    new IntentService();