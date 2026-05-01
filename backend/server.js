require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Google DNS for MongoDB SRV resolution
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'InsightForge Backend Online', version: '1.0.0' });
});

// Note: Ensure you set MONGO_URI and GEMINI_API_KEY in .env file
if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('<username>')) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('[Backend] MongoDB Atlas Connected!'))
    .catch(err => console.log('[Backend] MongoDB Connection Error:', err));
} else {
  console.log('[Backend] MongoDB URI missing or invalid. Skipping DB connection.');
}

// Initialize Gemini (Free Tier)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

function getFallbackInsights(companyName, category) {
  const normalized = companyName.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase() || 'company';
  
  // Company-specific intelligence
  const companyData = {
    zomato: {
      businessModel: "Zomato operates a marketplace model earning through: • Restaurant commissions • Delivery fees • Advertising • Subscription (Zomato Gold) • Quick commerce via Blinkit • B2B supplies via Hyperpure",
      revenueScale: "Revenue of ~$1.2B annually with strong growth in delivery and quick commerce segments",
      geographicPresence: "Primarily India with expansion into UAE, UK, and Southeast Asia",
      coreOfferings: "Food delivery platform, restaurant discovery, quick commerce (Blinkit), subscription services (Zomato Gold), and B2B supplies",
      positioningStatement: "Zomato positions itself as India's leading foodtech platform, bridging consumers and restaurants with seamless delivery and dining experiences",
      brandPerception: "Zomato is perceived as a leading consumer tech platform in India for food delivery and dining",
      targetAudience: "Urban consumers, students, professionals (B2C), and restaurants (B2B)",
      recentShifts: "• Blinkit expansion • Profitability focus • Subscription model refinement",
      strategicWatchouts: [
        "Intense competition from Swiggy in food delivery",
        "High burn rate in quick commerce expansion (Blinkit vs Zepto)",
        "Delivery partner management and retention issues",
        "Regulatory changes in food delivery and e-commerce",
        "Economic downturns affecting discretionary spending on food delivery"
      ],
      competitors: [
        {
          name: "Swiggy",
          positioning: "Direct competitor in food delivery and quick commerce",
          strengths: "Strong brand presence and integrated offerings",
          weaknesses: "Higher operational costs and slower expansion",
          marketActivity: "Recent focus on Instamart and Swiggy Genie"
        },
        {
          name: "Zepto",
          positioning: "Aggressive player in quick commerce space",
          strengths: "Fast delivery and tech-driven operations",
          weaknesses: "Limited geographical presence compared to Blinkit",
          marketActivity: "Rapid expansion and heavy marketing spend"
        },
        {
          name: "Blinkit",
          positioning: "Zomato's own quick commerce arm",
          strengths: "Integrated with Zomato ecosystem",
          weaknesses: "Cannibalization of delivery business",
          marketActivity: "Continuous expansion and feature additions"
        }
      ],
      competitiveGapAnalysis: {
        whereLeads: ["Brand recognition in India", "Integrated food delivery and quick commerce"],
        whereLags: ["International expansion pace", "Profitability margins"],
        opportunities: ["Further quick commerce penetration", "B2B supply chain expansion"]
      },
      brandCampaigns: ["Blinkit expansion campaigns", "Zomato Gold relaunch", "Intercity Legends partnerships"],
      corporateMilestones: ["IPO in 2021", "Blinkit acquisition", "Expansion into new markets"],
      experientialEvents: ["IPL partnerships", "Restaurant festivals", "User engagement campaigns"],
      decisionMakers: [
        {
          name: "Deepinder Goyal",
          role: "CEO and Co-founder",
          linkedin: "linkedin.com/in/deepindergoyal",
          context: "Leads overall strategy and vision for Zomato's foodtech ecosystem"
        },
        {
          name: "Akshant Goyal",
          role: "COO",
          linkedin: "Not publicly available",
          context: "Oversees operations including delivery and supply chain"
        }
      ],
      contactIntelligence: {
        emailPattern: "Not publicly available",
        linkedinCompanyPage: "linkedin.com/company/zomato",
        bestOutreachChannel: "LinkedIn"
      },
      linkedinHook: "Hi [Name], I've been following Zomato's expansion into quick commerce with Blinkit and the push toward profitability. We've identified specific opportunities around improving retention and order value that align with your current strategy. Would love to share a quick insight if you're open.",
      emailDraft: "Subject: Strategic Insights on Zomato's Quick Commerce Strategy\n\nHi Team,\n\nI've been tracking Zomato's aggressive moves in quick commerce through Blinkit and the focus on profitability. Our analysis shows specific opportunities in retention and order value optimization that could align with your current initiatives.\n\nWould you be open to a brief call to discuss these insights?\n\nBest,\nInsightForge Intelligence"
    },
    // Add more companies as needed
  };

  return companyData[normalized] || {
    businessModel: `A data-driven ${category} player generating revenue through subscription and advisory services, packaged intelligence reports, and enterprise consulting for ${companyName}.`,
    revenueScale: `Estimated mid-market revenue with steady growth from strategic enterprise deals and recurring software license income.`,
    geographicPresence: `Primarily operating across North America and APAC, with a growing presence in key global technology hubs.`,
    coreOfferings: `AI-powered market intelligence reports, competitor benchmarking, decision-maker outreach tools, and performance tracking services.`,
    positioningStatement: `${companyName} positions itself as a premium market intelligence provider for high-growth ${category} teams, differentiating on speed, accuracy, and actionable outreach-ready insights.`,
    brandPerception: `Seen as an ambitious, technology-first intelligence brand trusted by sales and strategy teams for rapid market context and outreach planning.`,
    targetAudience: `B2B GTM leaders, revenue operations teams, corporate strategy, and account-based sales organizations seeking differentiated intelligence in ${category}.`,
    recentShifts: `Shifting from basic industry summaries toward automated competitor mapping, decision-maker identification, and personalized outreach workflows.`,
    strategicWatchouts: [
      `Dependency on third-party data sources for freshness, which can impact insight accuracy during rapid market moves.`,
      `Regulatory risk if scraped market intelligence runs afoul of evolving data-use and privacy restrictions.`,
      `Execution risk around AI model reliability and quota limits for production-grade delivery.`,
      `Reputation risk if generated outreach is perceived as generic or misaligned with customer context.`,
      `Scaling risk from manually curated intelligence workflows to fully automated enterprise pipelines.`
    ],
    competitors: [
      {
        name: "MarketScout",
        positioning: "A fast-growth intelligence platform focused on real-time competitor alerts and market shift signals.",
        strengths: "Agile alerting, tight integration with sales workflows, and strong API connectivity.",
        weaknesses: "Limited depth on decision-maker outreach and less emphasis on personalized campaign drafts.",
        marketActivity: "Recent launch of a company intelligence dashboard and expanded coverage for enterprise accounts."
      },
      {
        name: "IntelLens",
        positioning: "A research-first intelligence provider targeting strategy teams with analyst-grade market reports.",
        strengths: "High-quality narrative content, sector specialization, and strong analyst credibility.",
        weaknesses: `Slower turnaround and less emphasis on action-oriented outreach execution compared to ${companyName}.`,
        marketActivity: "Announced a new financing round and expanded its AI research library in the last 12 months."
      }
    ],
    competitiveGapAnalysis: {
      whereLeads: [
        `Speed of report generation and integrated outreach-ready intelligence`,
        `Clear focus on ${category} market players and decision-maker context`
      ],
      whereLags: [
        `Deep analyst-backed primary research versus established enterprise research firms`,
        `Long-term brand recognition compared with legacy intelligence providers`
      ],
      opportunities: [
        `Expand into strategic account intelligence for hyper-growth GTM teams`,
        `Add automated CRM sync and prospecting workflows tied to AI insights`]
    },
    brandCampaigns: [
      `Launch of an automated "Competitive Signal" product line for real-time market alerts.`,
      `A content-led campaign positioning ${companyName} as the go-to intelligence engine for ${category} sellers.`
    ],
    corporateMilestones: [
      `Closed initial seed/series A funding to accelerate product development.`,
      `Expanded into a second major region to support enterprise customers.`
    ],
    experientialEvents: [
      `Hosted a virtual roundtable for GTM leaders on AI-informed outreach.`,
      `Sponsored a major industry conference focused on go-to-market intelligence.`
    ],
    decisionMakers: [
      {
        name: "Avery Morgan",
        role: "Head of Market Intelligence",
        linkedin: "Not publicly available",
        context: "Leads intelligence operations and oversees competitor mapping, buyer research, and targeted outreach strategies."
      }
    ],
    contactIntelligence: {
      emailPattern: `firstname.lastname@${normalized}.com`,
      linkedinCompanyPage: `linkedin.com/company/${normalized}`,
      bestOutreachChannel: "LinkedIn"
    },
    linkedinHook: `Hi there, I noticed ${companyName} is leaning into ${category} intelligence — I’ve got a concise briefing on your competitive positioning and outreach opportunities if you want to connect.`,
    emailDraft: `Subject: Strategic Intelligence Briefing for ${companyName}\n\nHi Team,\n\nI wanted to share a short briefing on ${companyName}'s position in the ${category} market. Based on recent signals, your team is well positioned around fast insights and outreach-ready account intelligence.\n\nIf you’re open to a quick 15-minute review, I can forward a tailored intelligence summary and competitor gaps that could help your next campaign.\n\nBest,\nInsightForge Intelligence`
  };
}

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
    const currentYear = new Date().getFullYear();
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(companyName + ' company news ' + currentYear)}&num=8`;
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
  if (!genAI) {
    console.warn('[Backend] Gemini API key missing. Returning fallback intelligence data.');
    return {
      status: 'fallback',
      insights: getFallbackInsights(companyName, category),
      message: 'Gemini API key missing. Fallback intelligence returned.'
    };
  }

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
    return {
      status: "fallback",
      insights: getFallbackInsights(companyName, category),
      message: error.message || 'Gemini unavailable. Fallback intelligence returned.'
    };
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
    console.log(`Stack: Node.js, Express, Puppeteer, Gemini, MongoDB, Nodemailer`);
  });
}

module.exports = app;
