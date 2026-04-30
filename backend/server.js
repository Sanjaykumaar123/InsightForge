require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Google DNS for MongoDB SRV resolution
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Note: Ensure you set MONGO_URI and GEMINI_API_KEY in .env file
if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('<username>')) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('[Backend] MongoDB Atlas Connected!'))
    .catch(err => console.log('[Backend] MongoDB Connection Error:', err));
} else {
  console.log('[Backend] MongoDB URI missing or invalid. Skipping DB connection.');
}

// Initialize Gemini (Free Tier)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define Schema for Leads
const leadSchema = new mongoose.Schema({
  company: String,
  category: String,
  insights: Object,
  date: { type: Date, default: Date.now }
});
const Lead = mongoose.model('Lead', leadSchema);

// --- Scraping Orchestration (Axios + Cheerio + Puppeteer) ---
async function scrapeCompanyData(companyName) {
  console.log(`[Scraper] Starting live scrape for: ${companyName}`);
  const results = { googleSnippets: [], newsHeadlines: [], websiteText: '' };

  try {
    // 1. Google Search Snippets (via Axios + Cheerio)
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(companyName + ' company news 2025')}&num=8`;
    const googleRes = await axios.get(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000
    });
    const $ = cheerio.load(googleRes.data);
    $('div.VwiC3b, div.s3v9rd, span.aCOpRe, div.IsZvec').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 40 && results.googleSnippets.length < 6) {
        results.googleSnippets.push(text);
      }
    });
    console.log(`[Scraper] Google snippets found: ${results.googleSnippets.length}`);
  } catch (e) {
    console.log(`[Scraper] Google scrape failed: ${e.message}`);
  }

  try {
    // 2. News Headlines (Google News via Cheerio)
    const newsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(companyName)}&hl=en-IN&gl=IN&ceid=IN:en`;
    const newsRes = await axios.get(newsUrl, { timeout: 8000 });
    const $ = cheerio.load(newsRes.data, { xmlMode: true });
    $('item title').each((i, el) => {
      const headline = $(el).text().trim();
      if (headline && results.newsHeadlines.length < 6) {
        results.newsHeadlines.push(headline);
      }
    });
    console.log(`[Scraper] News headlines found: ${results.newsHeadlines.length}`);
  } catch (e) {
    console.log(`[Scraper] News scrape failed: ${e.message}`);
  }

  // Build summary for AI
  const scrapedSummary = [
    results.googleSnippets.length > 0 ? `GOOGLE SEARCH CONTEXT:\n${results.googleSnippets.join('\n')}` : '',
    results.newsHeadlines.length > 0 ? `RECENT NEWS HEADLINES:\n${results.newsHeadlines.join('\n')}` : ''
  ].filter(Boolean).join('\n\n');

  console.log(`[Scraper] Scrape complete. Total context: ${scrapedSummary.length} characters`);
  return { status: 'success', data: scrapedSummary || `General knowledge about ${companyName}` };
}

// --- AI Layer (Gemini) ---
async function generateInsights(companyData, category, companyName) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are an elite AI-powered Market Intelligence Engine producing a consulting-grade report.
Analyze the company below using the scraped data AND your own knowledge.

Company Name: ${companyName}
Category: ${category}
Scraped Data Context: ${JSON.stringify(companyData)}

Return ONLY a valid JSON object with EXACTLY these keys (no markdown, no code blocks):
{
  "businessModel": "Detailed description of how the company makes money",
  "revenueScale": "Revenue figures, growth rate, valuation if known",
  "geographicPresence": "Cities, countries, regions of operation",
  "coreOfferings": "All major products/services with brief descriptions",
  "positioningStatement": "How the company positions itself vs competitors",
  "brandPerception": "How consumers and industry perceive this brand",
  "targetAudience": "Detailed segmentation: demographics, psychographics, use cases",
  "recentShifts": "Strategic pivots and business model changes in last 12-24 months",
  "strategicWatchouts": ["Risk 1 with specific detail", "Risk 2", "Risk 3", "Risk 4", "Risk 5"],
  "competitors": [
    {
      "name": "Competitor Name",
      "positioning": "How they position themselves in the market",
      "strengths": "Their key competitive advantages",
      "weaknesses": "Where they are weak compared to ${companyName}",
      "marketActivity": "Recent campaigns, launches, or strategic moves"
    }
  ],
  "competitiveGapAnalysis": {
    "whereLeads": ["Area where ${companyName} is ahead", "Another strength"],
    "whereLags": ["Area where ${companyName} is behind", "Another weakness"],
    "opportunities": ["Market opportunity 1", "Opportunity 2"]
  },
  "brandCampaigns": ["Specific campaign name and description", "Another specific campaign"],
  "corporateMilestones": ["Funding round / acquisition / IPO / major hire with year", "Another milestone"],
  "experientialEvents": ["Specific event, sponsorship, or activation", "Another event"],
  "decisionMakers": [
    {
      "name": "Full Name",
      "role": "Exact Title",
      "linkedin": "linkedin.com/in/their-profile or Not publicly available",
      "context": "Why they are relevant and what decisions they influence"
    }
  ],
  "contactIntelligence": {
    "emailPattern": "firstname.lastname@company.com or Not publicly available",
    "linkedinCompanyPage": "linkedin.com/company/companyname",
    "bestOutreachChannel": "LinkedIn / Email / Twitter"
  },
  "linkedinHook": "A sharp, specific LinkedIn message under 150 words that mentions a specific recent activity (e.g. Instamart expansion, Blinkit). NO generic phrases like 'I noticed your company'. Make it punchy and relevant.",
  "emailDraft": "A complete professional email with Subject line, greeting, 2-3 specific paragraphs referencing REAL activities (campaigns, pivots), a clear ask, and sign-off. Reference specific brand activities and recent shifts."
}
Rules: 
- Use specific facts, not vague statements like 'extensive campaigns'
- For competitors, include ALL major ones with the full nested object
- Separate brand campaigns from corporate events clearly
- Email draft must have 'Subject:' as its first line
- LinkedIn hook must mention a specific recent activity of the company`;

    console.log(`[Backend] Requesting AI insights from Gemini...`);
    const result = await model.generateContent(prompt);
    console.log(`[Backend] Received AI insights!`);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return { status: "success", insights: JSON.parse(text) };
  } catch (error) {
    console.error("[Backend] Gemini Error:", error);
    return { status: "error", insights: null, message: error.message };
  }
}

// --- Outreach System (Nodemailer) ---
async function sendOutreachEmail(targetEmail, subject, htmlContent, trackingBaseUrl) {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your_email')) {
    console.log(`[Outreach] Email credentials not set. Skipping real send.`);
    return { success: false, message: 'Email credentials not configured in .env' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS  // Gmail App Password (16 chars, no spaces)
    }
  });

  // Embed 1x1 tracking pixel at end of email body
  const trackingPixel = `<img src="${trackingBaseUrl}/api/track?email=${encodeURIComponent(targetEmail)}" width="1" height="1" style="display:none" />`;
  const fullHtml = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;">${htmlContent.replace(/\n/g, '<br/>')}</div>${trackingPixel}`;

  const mailOptions = {
    from: `"InsightForge Intelligence" <${process.env.EMAIL_USER}>`,
    to: targetEmail,
    subject: subject || 'Strategic Intelligence Sync',
    html: fullHtml
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Outreach] Email sent to ${targetEmail} | Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Outreach] Email send failed:`, err.message);
    return { success: false, message: err.message };
  }
}

// --- Routes ---

app.post('/api/analyze', async (req, res) => {
  const { company, category } = req.body;
  
  try {
    // 1. Scrape
    const scrapedData = await scrapeCompanyData(company);
    
    // 2. AI Processing
    const insights = await generateInsights(scrapedData, category, company);
    
    // 3. Save to DB
    if (mongoose.connection.readyState === 1) {
      const newLead = new Lead({ company, category, insights });
      await newLead.save();
      console.log(`[Backend] Saved insights for ${company} to MongoDB!`);
    } else {
      console.log(`[Backend] MongoDB not connected. Skipping save for ${company}.`);
    }

    res.json({
      success: true,
      message: "Analysis complete",
      data: {
        company,
        category,
        insights,
        status: mongoose.connection.readyState === 1 ? "Saved to MongoDB Atlas." : "Mock response (DB disabled)."
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Email Tracking Pixel Route
app.get('/api/track', (req, res) => {
  const email = req.query.email;
  console.log(`[Tracking] 📬 Email opened by: ${email} at ${new Date().toISOString()}`);
  
  // Return a 1x1 transparent GIF
  const buf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': buf.length
  });
  res.end(buf);
});

// Send Outreach Email Route
app.post('/api/send-outreach', async (req, res) => {
  const { targetEmail, subject, emailDraft } = req.body;
  if (!targetEmail || !emailDraft) {
    return res.status(400).json({ success: false, error: 'targetEmail and emailDraft are required' });
  }
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  const result = await sendOutreachEmail(targetEmail, subject, emailDraft, baseUrl);
  res.json(result);
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
    console.log(`Stack: Node.js, Express, Puppeteer, Gemini, MongoDB, Nodemailer`);
  });
}

module.exports = app;
