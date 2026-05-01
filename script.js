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

    async function simulateIngestionAndExtraction(companyName, category) {
        const logs = [
            `[SYSTEM] Initializing Market Intelligence Engine...`,
            `[COLLECT] Scraping public data for "${companyName}"...`,
            `[API] Connecting to Gemini Free Tier for NLP extraction...`,
            `[PROCESS] Analyzing "${category}" market segments...`,
            `[SYSTEM] Waiting for API response...`
        ];
        
        logsContainer.innerHTML = '';
        let step = 0;
        
        // Show initial logs
        const logInterval = setInterval(() => {
            if (step < logs.length) {
                logsContainer.innerHTML += `<div>${logs[step]}</div>`;
                logsContainer.scrollTop = logsContainer.scrollHeight;
                step++;
            } else {
                clearInterval(logInterval);
            }
        }, 600);

        try {
            const apiUrl = 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company: companyName, category: category })
            });
            const data = await response.json();
            
            if (data.success && data.data && data.data.insights && data.data.insights.insights) {
                const report = data.data.insights.insights;
                logsContainer.innerHTML += `<div style="color: #39FF14">[SUCCESS] Received data from backend!</div>`;
                setTimeout(() => {
                    loadingOverlay.classList.add('hidden');
                    populateReport(companyName, category, report);
                    dashboard.classList.remove('hidden');
                }, 1000);
            } else {
                throw new Error(data.error || 'Failed to get insights');
            }
        } catch (err) {
            logsContainer.innerHTML += `<div style="color: #ff4444">[ERROR] ${err.message}</div>`;
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                document.querySelector('.input-panel').style.display = 'block';
            }, 3000);
        }
    }

    function populateReport(company, category, report) {
        // 1. Company Overview
        document.getElementById('out-overview').innerHTML = `
            <div class="metric-box">
                <div class="metric-title">Business Model</div>
                <div class="metric-value">${report.businessModel || 'N/A'}</div>
            </div>
            <p><strong>Revenue Scale:</strong> <span class="tag">Inference</span> ${report.revenueScale || 'N/A'}</p>
            <p><strong>Geographic Presence:</strong> ${report.geographicPresence || 'N/A'}</p>
            <p><strong>Core Offerings:</strong> ${report.coreOfferings || 'N/A'}</p>
            <p><strong>Positioning Statement:</strong> "${report.positioningStatement || 'N/A'}"</p>
        `;

        // 2. Market Position
        document.getElementById('out-market').innerHTML = `
            <p><strong>Brand Perception:</strong> ${report.brandPerception || 'N/A'}</p>
            <p><strong>Target Audience:</strong> ${report.targetAudience || 'N/A'}</p>
            <div class="metric-box">
                <div class="metric-title">Recent Shifts (Last 12 Months)</div>
                <div class="metric-value">${report.recentShifts || 'N/A'}</div>
            </div>
        `;

        // 3. Competitor Mapping
        let compHtml = '';
        if (report.competitors && Array.isArray(report.competitors)) {
            report.competitors.forEach(comp => {
                compHtml += `
                    <div class="competitor-row">
                        <div><strong>${comp.name}</strong></div>
                        <div><strong>Strengths:</strong> ${comp.strengths || 'N/A'}</div>
                        <div><strong>Weaknesses:</strong> ${comp.weaknesses || 'N/A'}</div>
                    </div>
                `;
            });
        }
        
        let gapHtml = '';
        if (report.competitiveGapAnalysis) {
            gapHtml = `
                <div class="metric-box" style="margin-top: 1.5rem;">
                    <div class="metric-title">Competitive Gap Analysis</div>
                    <p style="margin-top:0.5rem; font-size: 0.9rem;"><strong>Opportunities:</strong> ${report.competitiveGapAnalysis.opportunities?.join(', ') || 'N/A'}</p>
                </div>
            `;
        }
        document.getElementById('out-competitors').innerHTML = compHtml + gapHtml;

        // 4. Brand Activity
        const brand = report.brandCampaigns || report.brandActivity || [];
        document.getElementById('out-brand').innerHTML = `
            <ul>
                ${brand.map(b => `<li>${b}</li>`).join('')}
            </ul>
        `;

        // 5. Experiential Footprint
        const events = report.experientialEvents || report.events || [];
        document.getElementById('out-events').innerHTML = `
            <ul>
                ${events.map(e => `<li>${e}</li>`).join('')}
            </ul>
        `;

        // 6. Strategic Watchouts
        const watchouts = report.strategicWatchouts || [];
        document.getElementById('out-watchouts').innerHTML = `
            <ul>
                ${watchouts.map(w => `<li>${w}</li>`).join('')}
            </ul>
        `;

        // 7. Decision Makers
        let dmHtml = '<ul>';
        if (report.decisionMakers && Array.isArray(report.decisionMakers)) {
            report.decisionMakers.forEach(dm => {
                dmHtml += `<li><strong>${dm.name}</strong> - ${dm.role} <em>(${dm.context})</em></li>`;
            });
        }
        dmHtml += '</ul>';
        document.getElementById('out-decision-makers').innerHTML = dmHtml;

        // 8. Contact Intel
        const contact = report.contactIntelligence || {};
        document.getElementById('out-contact').innerHTML = `
            <p><i class="fa-solid fa-envelope"></i> ${contact.emailPattern || contact.email || 'Not publicly available'} <span class="tag">Verified</span></p>
            <p><i class="fa-brands fa-linkedin"></i> ${contact.linkedinCompanyPage || contact.linkedin || 'Not publicly available'}</p>
            <p><i class="fa-solid fa-satellite-dish"></i> Best Channel: ${contact.bestOutreachChannel || 'LinkedIn'}</p>
        `;

        // 9. Personalized Outreach
        document.getElementById('out-outreach').innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <strong><i class="fa-brands fa-linkedin"></i> LinkedIn Hook:</strong>
                <div class="email-draft">${report.linkedinHook || 'N/A'}</div>
            </div>
            <div>
                <strong><i class="fa-solid fa-envelope"></i> Email Draft:</strong>
                <div class="email-draft">${(report.emailDraft || 'N/A').replace(/\n/g, '<br>')}</div>
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
                        <li>Gemini 2.5 Flash processes NLP</li>
                        <li>JSON payload generated</li>
                        <li>Dynamic Dashboard renders UI</li>
                    </ol>
                </div>
                <div>
                    <strong><i class="fa-solid fa-satellite"></i> Tracking Logic</strong>
                    <ul style="margin-top: 0.5rem; font-size: 0.85rem;">
                        <li><strong>Open Rate:</strong> Invisible 1x1 pixel</li>
                        <li><strong>Click Tracking:</strong> UTM params</li>
                        <li><strong>CRM:</strong> MongoDB Atlas Storage</li>
                    </ul>
                </div>
            </div>
        `;
    }
});
