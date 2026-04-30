require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("Generating...");
    const result = await model.generateContent("Test prompt");
    console.log("Result:", result.response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
