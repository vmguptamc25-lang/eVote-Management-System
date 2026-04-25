const OpenAI =
    require("openai");

class AIService {

    constructor() {

        this.client =
            new OpenAI({
                apiKey:
                    process.env.GROQ_API_KEY,

                baseURL:
                    "https://api.groq.com/openai/v1"
            });

    }

    async generateResponse(message) {

        const prompt = `
You are an AI assistant ONLY
for online voting.

Answer ONLY voting-related questions.

User Question:
${message}
`;

        const response =
            await this.client.chat
                .completions.create({

                    model:
                        "llama-3.1-8b-instant",

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]

                });

        return response
            .choices[0]
            .message.content;

    }

}

module.exports =
    new AIService();