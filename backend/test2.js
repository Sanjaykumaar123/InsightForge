require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateInsights(companyData, category, companyName) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are an advanced AI-powered Market Intelligence Engine.
Analyze the following company based on the provided scraped data (or your own knowledge if data is limited).
Company Name: ${companyName}
Category: ${category}
Scraped Data Context: ${JSON.stringify(companyData)}

Return your response ONLY as a valid JSON object with these exactly named keys:
{
  "businessModel": "...",
  "revenueScale": "...",
  "geographicPresence": "...",
  "coreOfferings": "...",
  "positioningStatement": "...",
  "brandPerception": "...",
  "targetAudience": "...",
  "recentShifts": "...",
  "strategicWatchouts": ["...", "..."],
  "decisionMakers": [{"name": "...", "role": "...", "context": "..."}],
  "linkedinHook": "...",
  "emailDraft": "..."
}
Do not include markdown blocks, just the JSON string.`;

    console.log(`[Backend] Requesting AI insights from Gemini...`);
    const result = await model.generateContent(prompt);
    console.log(`[Backend] Received response from Gemini!`);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return { status: "success", insights: JSON.parse(text) };
  } catch (error) {
    console.error("[Backend] Gemini Error:", error);
    return { status: "error", insights: null, message: error.message };
  }
}

async function run() {
  const scrapedData = { status: "success", data: "Mock scraped data for ZOMATO" };
  const insights = await generateInsights(scrapedData, "FOOD DELIVERY", "ZOMATO");
  console.log("Result:", insights);
}

run();
