const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function getAIResponse(prompt) {
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", // 🔥 fast model
      messages: [
        {
          role: "system",
          content: "You are a smart voting assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error(err);
    return "AI error";
  }
}

module.exports = { getAIResponse };