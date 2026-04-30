document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('intel-form');
    const loadingOverlay = document.getElementById('loading-overlay');
    const dashboard = document.getElementById('report-dashboard');
    const logsContainer = document.getElementById('loading-logs');
    
    // Display targets
    const displayTarget = document.getElementById('display-target');
    const displayCategory = document.getElementById('display-category');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const companyName = document.getElementById('companyName').value;
        const category = document.getElementById('category').value;
        
        displayTarget.textContent = companyName.toUpperCase();
        displayCategory.textContent = category.toUpperCase();
        
        // Hide form partially or fully, show loader
        document.querySelector('.input-panel').style.display = 'none';
        loadingOverlay.classList.remove('hidden');
        dashboard.classList.add('hidden');
        
        simulateIngestionAndExtraction(companyName, category);
    });

    function simulateIngestionAndExtraction(companyName, category) {
        const logs = [
            `[SYSTEM] Initializing Market Intelligence Engine...`,
            `[COLLECT] Scraping public data for "${companyName}"...`,
            `[API] Connecting to Gemini Free Tier for NLP extraction...`,
            `[PROCESS] Analyzing "${category}" market segments...`,
            `[NLP] Entity extraction and sentiment analysis active...`,
            `[DETECT] Identifying key competitors and market gaps...`,
            `[LEAD] Scanning LinkedIn public profiles for decision-makers...`,
            `[GENERATE] Crafting personalized outreach logic...`,
            `[VALIDATE] Quality check passed. Removing fluff...`,
            `[SYSTEM] Report generation complete.`
        ];
        
        logsContainer.innerHTML = '';
        let step = 0;
        
        const logInterval = setInterval(() => {
            if (step < logs.length) {
                logsContainer.innerHTML += `<div>${logs[step]}</div>`;
                logsContainer.scrollTop = logsContainer.scrollHeight;
                step++;
            } else {
                clearInterval(logInterval);
                setTimeout(() => {
                    loadingOverlay.classList.add('hidden');
                    populateReport(companyName, category);
                    dashboard.classList.remove('hidden');
                }, 1000);
            }
        }, 600); // Simulated delay for each log
    }

    function populateReport(company, category) {
        // 1. Company Overview
        document.getElementById('out-overview').innerHTML = `
            <div class="metric-box">
                <div class="metric-title">Business Model</div>
                <div class="metric-value">B2B SaaS / Hybrid</div>
            </div>
            <p><strong>Revenue Scale:</strong> <span class="tag">Inference</span> $50M - $100M ARR</p>
            <p><strong>Geographic Presence:</strong> North America, Western Europe (Expanding to APAC)</p>
            <p><strong>Core Offerings:</strong> AI-driven analytics, automated reporting tools, data pipeline management.</p>
            <p><strong>Positioning Statement:</strong> "The data nervous system for high-growth tech enterprises."</p>
        `;

        // 2. Market Position
        document.getElementById('out-market').innerHTML = `
            <p><strong>Brand Perception:</strong> Premium, disruptive, technically robust.</p>
            <p><strong>Target Audience:</strong> Enterprise CTOs, VP of Data, Enterprise Architects.</p>
            <div class="metric-box">
                <div class="metric-title">Recent Shifts (Last 12 Months)</div>
                <div class="metric-value">Product Pivot</div>
            </div>
            <p>Shifted messaging from "Data Storage" to "Active Intelligence" following recent Series C funding round.</p>
        `;

        // 3. Competitor Mapping
        document.getElementById('out-competitors').innerHTML = `
            <div class="competitor-row">
                <div><strong>Competitor A</strong><br><span class="tag">Legacy</span></div>
                <div><strong>Strengths:</strong> Deep enterprise penetration.</div>
                <div><strong>Weaknesses:</strong> Slow deployment, outdated UI.</div>
            </div>
            <div class="competitor-row">
                <div><strong>Competitor B</strong><br><span class="tag">Disruptor</span></div>
                <div><strong>Strengths:</strong> PLG motion, agile.</div>
                <div><strong>Weaknesses:</strong> Limited enterprise governance features.</div>
            </div>
            <div class="metric-box" style="margin-top: 1.5rem;">
                <div class="metric-title">Competitive Gap Analysis</div>
                <p style="margin-top:0.5rem; font-size: 0.9rem;"><strong>Opportunity:</strong> ${company} leads in real-time streaming but lags in native multi-cloud deployments. Untapped opportunity in the mid-market segment requiring out-of-the-box compliance tools.</p>
            </div>
        `;

        // 4. Brand Activity
        document.getElementById('out-brand').innerHTML = `
            <ul>
                <li><strong>Campaign:</strong> "Data Without Borders" (Q3) - Focused on multi-region capabilities. High digital engagement.</li>
                <li><strong>Product Launch:</strong> "Auto-Sync 2.0" - Introduced AI-based anomaly detection.</li>
                <li><strong>Social Direction:</strong> Heavy reliance on LinkedIn thought leadership from founders. Low visual content output.</li>
            </ul>
        `;

        // 5. Experiential Footprint
        document.getElementById('out-events').innerHTML = `
            <ul>
                <li><strong>Event:</strong> AWS re:Invent (Sponsor) - Hybrid format. High lead generation output.</li>
                <li><strong>Event:</strong> Local Tech Meetups (SF/NY) - Intimate developer-focused sessions.</li>
                <li><strong>Outcome:</strong> Strong community feedback, resulting in 30% increase in developer portal signups.</li>
            </ul>
        `;

        // 6. Strategic Watchouts
        document.getElementById('out-watchouts').innerHTML = `
            <ul>
                <li><strong>Market Risks:</strong> Commoditization of base-level data pipelines by cloud providers.</li>
                <li><strong>Brand Inconsistencies:</strong> Disconnect between premium enterprise pricing and self-serve PLG website experience.</li>
                <li><strong>Missed Opportunities:</strong> Lack of vertical-specific messaging (e.g., Healthcare, FinTech).</li>
            </ul>
        `;

        // 7. Decision Makers
        document.getElementById('out-decision-makers').innerHTML = `
            <ul>
                <li><strong>Alex Mercer</strong> - CMO <em>(Drives GTM strategy)</em></li>
                <li><strong>Jordan Hayes</strong> - VP of Growth <em>(Focuses on PLG and funnel optimization)</em></li>
                <li><span class="tag">Inference</span> Head of Product Marketing - <em>Role identified, individual not publicly confirmed</em></li>
            </ul>
        `;

        // 8. Contact Intel
        document.getElementById('out-contact').innerHTML = `
            <p><i class="fa-solid fa-envelope"></i> a.mercer@${company.toLowerCase().replace(/\s/g, '')}.com <span class="tag">Verified</span></p>
            <p><i class="fa-brands fa-linkedin"></i> linkedin.com/in/alexmercer-growth</p>
            <p class="data-unavailable"><i class="fa-solid fa-phone"></i> Phone: Not publicly available</p>
        `;

        // 9. Personalized Outreach
        document.getElementById('out-outreach').innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <strong><i class="fa-brands fa-linkedin"></i> LinkedIn Hook:</strong>
                <div class="email-draft">
"Hi Alex, loved your recent talk at AWS re:Invent on 'Active Intelligence'. 
Noticed ${company} is scaling its enterprise tier rapidly. 
We've helped similar data-infrastructure companies increase enterprise MQLs by 40% through vertical-specific GTM plays. 
Open to a brief chat on how we could apply this to your upcoming APAC expansion?"
                </div>
            </div>
            <div>
                <strong><i class="fa-solid fa-envelope"></i> Email Draft:</strong>
                <div class="email-draft">
<strong>Subject:</strong> Capitalizing on the "Auto-Sync 2.0" momentum

Hi Alex,

Following the successful launch of Auto-Sync 2.0, I noticed ${company} is perfectly positioned to capture the mid-market segment currently underserved by legacy competitors.

However, scaling that GTM requires highly targeted, vertical-specific messaging. We've built a framework that identifies and converts these exact mid-market gaps.

Would you be open to a 10-minute overview next Tuesday to see if this aligns with your Q4 pipeline goals?

Best,
[Your Name]
                </div>
            </div>
        `;

        // 10. Architecture & Tracking
        document.getElementById('out-architecture').innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <strong><i class="fa-solid fa-diagram-project"></i> System Workflow</strong>
                    <ol style="margin-top: 0.5rem; font-size: 0.85rem;">
                        <li>User inputs Target & Category</li>
                        <li>Puppeteer cluster scrapes public signals</li>
                        <li>Gemini Free Tier processes NLP (Entity/Sentiment)</li>
                        <li>JSON payload generated</li>
                        <li>React/Vite Frontend renders UI</li>
                    </ol>
                </div>
                <div>
                    <strong><i class="fa-solid fa-satellite"></i> Tracking Logic</strong>
                    <ul style="margin-top: 0.5rem; font-size: 0.85rem;">
                        <li><strong>Open Rate:</strong> Invisible 1x1 pixel via SendGrid API</li>
                        <li><strong>Click Tracking:</strong> UTM params (utm_source=outreach)</li>
                        <li><strong>CRM:</strong> Webhook sync to HubSpot/Salesforce</li>
                    </ul>
                </div>
            </div>
        `;
    }
});
