import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Search, ShieldAlert, Users, Network, TrendingUp, Mail, Server, Database, ChevronRight, Download, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';

function TypewriterEffect({ text }) {
  const [displayText, setDisplayText] = useState('');

  React.useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayText(text.slice(0, i + 1));
      i++;
      if (i > text.length) clearInterval(intervalId);
    }, 30);
    return () => clearInterval(intervalId);
  }, [text]);

  return <span>{displayText}</span>;
}

export default function App() {
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [reportReady, setReportReady] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [emailTarget, setEmailTarget] = useState('');
  const [emailStatus, setEmailStatus] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = () => {
    if (!reportData) return;
    setDownloading(true);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();   // 595
    const pageH = doc.internal.pageSize.getHeight();  // 842
    const margin = 50;
    const contentW = pageW - margin * 2;              // 495
    const labelW = 130;
    const valueX = margin + labelW;
    const valueW = contentW - labelW;
    let y = 0;

    // ── helpers ──────────────────────────────────────────
    const newPage = () => {
      doc.addPage();
      // White page bg
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageW, pageH, 'F');
      y = margin;
    };

    const check = (needed = 24) => { if (y + needed > pageH - 50) newPage(); };

    const sectionHeader = (title, isRed = false) => {
      check(36);
      y += 10;
      // Colored fill bar
      doc.setFillColor(isRed ? 220 : 30, isRed ? 38 : 90, isRed ? 38 : 180);
      doc.rect(margin, y, contentW, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(title, margin + 6, y + 14);
      y += 28;
      doc.setTextColor(30, 30, 30);
    };

    const fieldRow = (label, value) => {
      if (!value || value === 'Not publicly available' && label !== 'Email Pattern' && label !== 'LinkedIn') {
        if (label === 'Email Pattern' || label === 'LinkedIn') {
          // still show these
        } else return;
      }
      const str = String(value || 'N/A');
      const lines = doc.splitTextToSize(str, valueW);
      const rowH = lines.length * 14 + 6;
      check(rowH);

      // Alternating row bg
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, y - 2, contentW, rowH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(label, margin + 4, y + 10);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      doc.text(lines, valueX, y + 10);

      y += rowH + 2;
    };

    const bulletRow = (text, isRed = false) => {
      if (!text) return;
      const lines = doc.splitTextToSize(`\u2022  ${text}`, contentW - 14);
      const rowH = lines.length * 13 + 4;
      check(rowH);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(isRed ? 180 : 30, isRed ? 30 : 30, isRed ? 30 : 30);
      doc.text(lines, margin + 8, y + 10);
      y += rowH + 2;
    };

    const subLabel = (text) => {
      check(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFillColor(235, 235, 235);
      doc.rect(margin, y, contentW, 16, 'F');
      doc.text(text, margin + 6, y + 11);
      y += 20;
      doc.setTextColor(20, 20, 20);
    };

    // ── PAGE 1 — white background ──────────────────────
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 70, 'F');

    // Accent stripe
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 70, pageW, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('INSIGHTFORGE', margin, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('AI-Powered Market Intelligence Engine', margin, 48);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`TARGET: ${target.toUpperCase()}`, pageW - margin - 160, 28, { align: 'left' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`CATEGORY: ${category.toUpperCase()}`, pageW - margin - 160, 42);
    doc.text(`DATE: ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}`, pageW - margin - 160, 56);

    y = 90;

    // ── SECTION 1: Company Overview ──────────────────
    sectionHeader('01.  COMPANY OVERVIEW');
    fieldRow('Business Model', reportData.businessModel);
    fieldRow('Revenue Scale', reportData.revenueScale);
    fieldRow('Geographic Presence', reportData.geographicPresence);
    fieldRow('Core Offerings', reportData.coreOfferings);
    fieldRow('Positioning Statement', reportData.positioningStatement);

    // ── SECTION 2: Market Position ───────────────────
    sectionHeader('02.  MARKET POSITION');
    fieldRow('Brand Perception', reportData.brandPerception);
    fieldRow('Target Audience', reportData.targetAudience);
    fieldRow('Recent Shifts', reportData.recentShifts);

    // ── SECTION 3: Competitor Mapping ────────────────
    if (reportData.competitors?.length) {
      sectionHeader('03.  COMPETITOR MAPPING');
      reportData.competitors.forEach(c => {
        fieldRow(c.name || 'Competitor', c.context);
      });
    }

    // ── SECTION 4: Brand Activity & Events ───────────
    if (reportData.brandActivity?.length || reportData.events?.length) {
      sectionHeader('04.  BRAND ACTIVITY & EVENTS');
      if (reportData.brandActivity?.length) {
        subLabel('Recent Brand Activity');
        reportData.brandActivity.forEach(a => bulletRow(a));
      }
      if (reportData.events?.length) {
        subLabel('Events / Experiential');
        reportData.events.forEach(e => bulletRow(e));
      }
    }

    // ── SECTION 5: Strategic Watchouts ───────────────
    if (reportData.strategicWatchouts?.length) {
      sectionHeader('05.  STRATEGIC WATCHOUTS', true);
      reportData.strategicWatchouts.forEach(w => bulletRow(w, true));
    }

    // ── SECTION 6: Decision Makers & Contact ─────────
    if (reportData.decisionMakers?.length) {
      sectionHeader('06.  DECISION MAKERS & CONTACT INTELLIGENCE');
      reportData.decisionMakers.forEach(dm => {
        check(40);
        // Name row
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, contentW, 15, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(dm.name || '', margin + 6, y + 11);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(59, 130, 246);
        doc.text(dm.role || '', margin + 6 + doc.getTextWidth(dm.name || '') + 10, y + 11);
        y += 18;
        if (dm.context) {
          const ctxLines = doc.splitTextToSize(dm.context, contentW - 10);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(60, 60, 60);
          doc.text(ctxLines, margin + 8, y + 10);
          y += ctxLines.length * 12 + 6;
        }
      });
      y += 4;
      fieldRow('Email Pattern', reportData.contactIntelligence?.email || 'Not publicly available');
      fieldRow('LinkedIn Search', reportData.contactIntelligence?.linkedin || 'Not publicly available');
    }

    // ── SECTION 7: Personalized Outreach ─────────────
    sectionHeader('07.  PERSONALIZED OUTREACH');
    subLabel('LinkedIn Hook');
    if (reportData.linkedinHook) {
      const hookLines = doc.splitTextToSize(reportData.linkedinHook, contentW - 10);
      check(hookLines.length * 13 + 10);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      doc.text(hookLines, margin + 8, y + 10);
      y += hookLines.length * 13 + 12;
    }
    subLabel('Email Draft');
    if (reportData.emailDraft) {
      const emailLines = doc.splitTextToSize(reportData.emailDraft, contentW - 10);
      check(20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      emailLines.forEach(line => {
        check(14);
        doc.text(line, margin + 8, y + 10);
        y += 14;
      });
    }

    // ── Footer on every page ──────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(240, 240, 240);
      doc.rect(0, pageH - 30, pageW, 30, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`InsightForge Intelligence Engine  |  Confidential  |  Page ${i} of ${totalPages}`, margin, pageH - 12);
      doc.text(new Date().toLocaleString('en-IN'), pageW - margin, pageH - 12, { align: 'right' });
    }

    doc.save(`InsightForge_${target}_Report.pdf`);
    setDownloading(false);
  };


  const shareReport = () => {
    const text = [
      `📊 INSIGHTFORGE INTELLIGENCE REPORT`,
      `Target: ${target.toUpperCase()} | Category: ${category.toUpperCase()}`,
      ``,
      `🏢 Business Model: ${reportData?.businessModel || 'N/A'}`,
      `📍 Positioning: ${reportData?.positioningStatement || 'N/A'}`,
      `👥 Audience: ${reportData?.targetAudience || 'N/A'}`,
      `⚠️ Key Risk: ${reportData?.strategicWatchouts?.[0] || 'N/A'}`,
      ``,
      `Generated by InsightForge — AI-Powered Market Intelligence`,
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setShareStatus('✅ Report summary copied to clipboard!');
      setTimeout(() => setShareStatus(''), 3000);
    }).catch(() => setShareStatus('❌ Copy failed'));
  };

  const sendEmail = async () => {
    if (!emailTarget || !reportData?.emailDraft) return;
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/send-outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: emailTarget,
          subject: 'Strategic Intelligence Sync — InsightForge',
          emailDraft: reportData.emailDraft
        })
      });
      const data = await res.json();
      setEmailStatus(data.success ? '✅ Email sent successfully!' : `⚠️ ${data.message}`);
    } catch (e) {
      setEmailStatus('❌ Failed to reach backend.');
    }
    setSendingEmail(false);
  };

  const simulateProcess = async () => {
    setLoading(true);
    setReportReady(false);
    setLogs([]);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const steps = [
      `[SYSTEM] Connecting to backend API (${apiUrl})...`,
      `[COLLECT] Scraping public data for "${target}"...`,
      `[API] Connecting to Gemini Free Tier...`,
      `[PROCESS] Analyzing "${category}" market segments...`,
      `[SYSTEM] Waiting for API response...`
    ];

    // Show initial logs
    for (let j = 0; j < steps.length; j++) {
      setTimeout(() => {
        setLogs(prev => [...prev, steps[j]]);
      }, j * 600);
    }

    try {
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: target, category: category })
      });
      
      const data = await response.json();
      console.log("Backend Response:", data);
      
      if(data.success && data.data && data.data.insights) {
        if (data.data.insights.status === "error") {
          setLogs(prev => [...prev, `[ERROR] AI API Error: ${data.data.insights.message}`]);
          setTimeout(() => setLoading(false), 2000);
          return;
        }
        
        if (data.data.insights.insights) {
          setReportData(data.data.insights.insights);
        }
      }
      
      setLogs(prev => [...prev, `[SUCCESS] Received data from backend! Rendering UI.`]);
      
      setTimeout(() => {
        setLoading(false);
        setReportReady(true);
      }, 1000);

    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, `[ERROR] Backend connection failed. Is the server running?`]);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (!target || !category) return;
    simulateProcess();
  };

  return (
    <div className="relative z-10 p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="glow-bg"></div>
      
      {/* Header */}
      <header className="flex justify-between items-center border-b border-gray-800 pb-6 mb-10">
        <div className="flex items-center gap-4 text-radium-primary">
          <Activity className="w-8 h-8 animate-pulse text-glow" />
          <h1 className="font-heading font-bold text-2xl tracking-widest">
            MARKET_INTEL <span className="text-gray-500 font-normal">// ENGINE</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 font-heading text-xs tracking-widest text-gray-400">
          <span className="w-2 h-2 bg-radium-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]"></span>
          SYSTEM ONLINE
        </div>
      </header>

      {/* Hero / About Section */}
      {!loading && !reportReady && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center py-10 px-4"
        >
          <div className="inline-flex items-center gap-2 bg-radium-faint border border-radium-glow rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-radium-primary animate-pulse"></span>
            <span className="text-radium-primary font-heading text-xs tracking-widest">AI-POWERED INTELLIGENCE ENGINE</span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl text-white mb-4 leading-tight">
            Know Your Market.<br />
            <span className="text-radium-primary" style={{textShadow:'0 0 30px rgba(57,255,20,0.5)'}}>Outpace Your Competition.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            InsightForge autonomously researches any company and delivers a consulting-grade intelligence report — competitors, decision makers, outreach drafts — in under 30 seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['🕷️ Live Web Scraping','🤖 Gemini AI Analysis','🏢 Competitor Deep-Dive','📊 Competitive Gap Analysis','👥 Decision Maker Intel','📧 Personalized Outreach','📥 PDF Export','🗄️ MongoDB Auto-Save'].map((pill, i) => (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-dark-surface border border-gray-800 text-gray-300 text-xs font-heading px-4 py-2 rounded-full hover:border-radium-primary hover:text-radium-primary transition-all duration-200 cursor-default">
                {pill}
              </motion.span>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
            {[{value:'8',label:'Intel Sections',icon:'📋'},{value:'30s',label:'Report Time',icon:'⚡'},{value:'100%',label:'AI Generated',icon:'🤖'},{value:'∞',label:'Companies',icon:'🌐'}].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="glass-panel p-4 text-center hover:border-radium-primary transition-colors">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="font-heading text-2xl text-radium-primary">{stat.value}</div>
                <div className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          <h2 className="font-heading text-xs text-gray-500 tracking-widest mb-6">HOW IT WORKS</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-12">
            {[{step:'01',title:'Enter Target',desc:'Type any company name and market category'},{step:'02',title:'Live Scraping',desc:'Engine scrapes Google Search and News in real-time'},{step:'03',title:'AI Processing',desc:'Gemini 2.5 Flash generates structured intelligence'},{step:'04',title:'Full Report',desc:'Download PDF, send outreach, track email opens'}].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }}
                className="relative glass-panel p-4 text-left">
                <div className="font-heading text-radium-primary text-xs mb-2 tracking-widest">{item.step}</div>
                <div className="text-white font-semibold text-sm mb-1">{item.title}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{item.desc}</div>
                {i < 3 && <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-radium-primary z-10 text-lg">›</div>}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Form */}
      {!loading && !reportReady && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-radium-primary shadow-[0_0_15px_rgba(57,255,20,0.8)]"></div>
          <div className="flex items-center gap-3 mb-8">
            <Search className="text-radium-primary w-6 h-6" />
            <h2 className="font-heading text-xl text-white">INITIALIZE QUERY</h2>
          </div>
          
          <form onSubmit={handleStart} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <div className="relative group">
              <label className="block font-heading text-xs text-gray-400 mb-2 tracking-wider">TARGET COMPANY</label>
              <input 
                type="text" 
                required
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="e.g. Acme Corp" 
                className="w-full bg-transparent border-none text-white font-body text-lg py-2 focus:outline-none placeholder-gray-700"
              />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-800 transition-all duration-300 group-focus-within:h-[2px] group-focus-within:bg-radium-primary group-focus-within:shadow-[0_0_8px_rgba(57,255,20,0.4)]"></div>
            </div>
            
            <div className="relative group">
              <label className="block font-heading text-xs text-gray-400 mb-2 tracking-wider">MARKET CATEGORY</label>
              <input 
                type="text" 
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. AI Security" 
                className="w-full bg-transparent border-none text-white font-body text-lg py-2 focus:outline-none placeholder-gray-700"
              />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-800 transition-all duration-300 group-focus-within:h-[2px] group-focus-within:bg-radium-primary group-focus-within:shadow-[0_0_8px_rgba(57,255,20,0.4)]"></div>
            </div>
            
            <button 
              type="submit"
              className="bg-transparent border border-radium-primary text-radium-primary font-heading font-semibold tracking-wider py-3 px-8 rounded flex items-center justify-center gap-3 transition-all duration-300 hover:bg-radium-glow hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:text-white"
            >
              EXECUTE <Activity className="w-4 h-4" />
            </button>
          </form>
        </motion.section>
      )}

      {/* Loading State */}
      {loading && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 flex flex-col items-center justify-center min-h-[400px]"
        >
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-2 border-transparent border-t-radium-primary border-b-radium-primary rounded-full animate-spin"></div>
            <div className="absolute inset-[-10%] border-2 border-transparent border-l-cyan-400 border-r-cyan-400 rounded-full animate-[spin_3s_linear_reverse]"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-radium-primary rounded-full shadow-[0_0_20px_rgba(57,255,20,1)]"></div>
          </div>
          <h3 className="font-heading text-radium-primary tracking-[0.2em] mb-6 animate-pulse">EXTRACTING SIGNALS...</h3>
          
          <div className="w-full max-w-2xl bg-dark-surface border border-gray-800 p-4 rounded h-[150px] overflow-hidden flex flex-col justify-end font-mono text-sm text-gray-400">
            <AnimatePresence>
              {logs.map((log, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-1"
                >
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {/* Dashboard Results */}
      {reportReady && (
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-800 border-dashed gap-4">
            <div className="flex items-center gap-3">
              <Network className="text-radium-primary w-6 h-6" />
              <h2 className="font-heading text-xl text-white">INTELLIGENCE REPORT</h2>
            </div>
            <div className="font-heading text-sm text-gray-400 tracking-wider">
              TARGET: <span className="text-radium-primary text-glow">{target.toUpperCase()}</span> | 
              CATEGORY: <span className="text-radium-primary text-glow ml-2">{category.toUpperCase()}</span>
            </div>
            <div className="flex gap-4 flex-col items-end">
              <div className="flex gap-4">
                <button
                  id="export-pdf-btn"
                  onClick={downloadPDF}
                  disabled={downloading}
                  className="flex items-center gap-2 bg-dark-surface border border-gray-800 text-gray-300 px-4 py-2 rounded text-xs font-heading hover:border-radium-primary hover:text-radium-primary transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> {downloading ? 'EXPORTING...' : 'EXPORT'}
                </button>
                <button
                  id="share-btn"
                  onClick={shareReport}
                  className="flex items-center gap-2 bg-dark-surface border border-gray-800 text-gray-300 px-4 py-2 rounded text-xs font-heading hover:border-radium-primary hover:text-radium-primary transition-colors"
                >
                  <Share2 className="w-4 h-4" /> SHARE
                </button>
              </div>
              {shareStatus && <p className="text-xs font-mono text-radium-primary">{shareStatus}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Company Overview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card flex flex-col col-span-1 md:col-span-2">
              <div className="bg-dark-surface p-4 border-b border-gray-800 flex items-center gap-3">
                <Server className="text-radium-primary w-5 h-5" />
                <h3 className="font-heading text-sm tracking-wider text-white">01. COMPANY OVERVIEW</h3>
              </div>
              <div className="p-6 text-gray-300 text-sm flex-grow">
                <div className="bg-dark-surface p-4 rounded border-l-2 border-radium-primary mb-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Business Model</div>
                  <div className="text-lg text-white font-semibold">{reportData?.businessModel || 'Loading...'}</div>
                </div>
                <p className="mb-2"><strong className="text-white">Revenue Scale:</strong> <span className="inline-block px-2 py-1 bg-radium-faint border border-radium-glow rounded text-xs text-radium-primary mx-2 font-heading">Inference</span> {reportData?.revenueScale || 'Loading...'}</p>
                <p className="mb-2"><strong className="text-white">Geographic Presence:</strong> {reportData?.geographicPresence || 'Loading...'}</p>
                <p className="mb-2"><strong className="text-white">Core Offerings:</strong> {reportData?.coreOfferings || 'Loading...'}</p>
                <p><strong className="text-white">Positioning Statement:</strong> "{reportData?.positioningStatement || 'Loading...'}"</p>
              </div>
            </motion.div>

            {/* 2. Market Position */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card flex flex-col">
              <div className="bg-dark-surface p-4 border-b border-gray-800 flex items-center gap-3">
                <TrendingUp className="text-radium-primary w-5 h-5" />
                <h3 className="font-heading text-sm tracking-wider text-white">02. MARKET POSITION</h3>
              </div>
              <div className="p-6 text-gray-300 text-sm flex-grow">
                <p className="mb-2"><strong className="text-white">Brand Perception:</strong> {reportData?.brandPerception || 'Loading...'}</p>
                <p className="mb-4"><strong className="text-white">Target Audience:</strong> {reportData?.targetAudience || 'Loading...'}</p>
                <div className="bg-dark-surface p-4 rounded border-l-2 border-radium-primary mb-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recent Shifts</div>
                  <div className="text-lg text-white font-semibold">{reportData?.recentShifts || 'Loading...'}</div>
                </div>
              </div>
            </motion.div>

            {/* 3. Competitor Mapping — DEEP ANALYSIS */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card flex flex-col col-span-1 md:col-span-2">
              <div className="bg-dark-surface p-4 border-b border-gray-800 flex items-center gap-3">
                <Network className="text-radium-primary w-5 h-5" />
                <h3 className="font-heading text-sm tracking-wider text-white">03. COMPETITOR MAPPING — DEEP ANALYSIS</h3>
              </div>
              <div className="p-6 text-gray-300 text-sm flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportData?.competitors?.map((comp, i) => (
                  <div key={i} className="bg-dark-surface p-4 border border-gray-800 rounded">
                    <strong className="text-radium-primary block mb-3 font-heading tracking-wider text-base">{comp.name}</strong>
                    {comp.positioning && <p className="mb-2 text-xs"><span className="text-gray-500 uppercase tracking-wider">Positioning: </span>{comp.positioning}</p>}
                    {comp.strengths && <p className="mb-2 text-xs"><span className="text-green-400 uppercase tracking-wider">Strengths: </span>{comp.strengths}</p>}
                    {comp.weaknesses && <p className="mb-2 text-xs"><span className="text-red-400 uppercase tracking-wider">Weakness vs {target}: </span>{comp.weaknesses}</p>}
                    {comp.marketActivity && <p className="text-xs"><span className="text-yellow-400 uppercase tracking-wider">Recent Activity: </span>{comp.marketActivity}</p>}
                    {/* fallback for old schema */}
                    {comp.context && !comp.positioning && <p className="text-xs text-gray-400">{comp.context}</p>}
                  </div>
                )) || <div className="col-span-2 text-gray-500">Loading...</div>}
              </div>
            </motion.div>

            {/* 3b. Competitive Gap Analysis */}
            {reportData?.competitiveGapAnalysis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }} className="glass-card flex flex-col col-span-1 md:col-span-2 border-blue-900/50">
              <div className="bg-dark-surface p-4 border-b border-gray-800 flex items-center gap-3">
                <TrendingUp className="text-blue-400 w-5 h-5" />
                <h3 className="font-heading text-sm tracking-wider text-blue-400">03b. COMPETITIVE GAP ANALYSIS</h3>
              </div>
              <div className="p-6 text-gray-300 text-sm flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <strong className="text-green-400 block mb-2 uppercase text-xs tracking-wider">Where {target} Leads ✅</strong>
                  <ul className="space-y-2">{reportData.competitiveGapAnalysis.whereLeads?.map((l,i) => <li key={i} className="flex gap-2"><ChevronRight className="w-3 h-3 text-green-400 shrink-0 mt-1"/><span>{l}</span></li>)}</ul>
                </div>
                <div>
                  <strong className="text-red-400 block mb-2 uppercase text-xs tracking-wider">Where {target} Lags ❌</strong>
                  <ul className="space-y-2">{reportData.competitiveGapAnalysis.whereLags?.map((l,i) => <li key={i} className="flex gap-2"><ChevronRight className="w-3 h-3 text-red-400 shrink-0 mt-1"/><span>{l}</span></li>)}</ul>
                </div>
                <div>
                  <strong className="text-yellow-400 block mb-2 uppercase text-xs tracking-wider">Opportunities 🎯</strong>
                  <ul className="space-y-2">{reportData.competitiveGapAnalysis.opportunities?.map((o,i) => <li key={i} className="flex gap-2"><ChevronRight className="w-3 h-3 text-yellow-400 shrink-0 mt-1"/><span>{o}</span></li>)}</ul>
                </div>
              </div>
            </motion.div>
            )}

            {/* 4. Brand Activity & Events — SEPARATED */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="glass-card flex flex-col col-span-1 md:col-span-2">
              <div className="bg-dark-surface p-4 border-b border-gray-800 flex items-center gap-3">
                <Activity className="text-radium-primary w-5 h-5" />
                <h3 className="font-heading text-sm tracking-wider text-white">04. BRAND ACTIVITY, MILESTONES & EVENTS</h3>
              </div>
              <div className="p-6 text-gray-300 text-sm flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <strong className="text-white block mb-3 uppercase text-xs tracking-wider border-b border-gray-800 pb-2">🎯 Brand Campaigns</strong>
                  <ul className="space-y-2">
                    {(reportData?.brandCampaigns || reportData?.brandActivity)?.map((act, i) => (
                      <li key={i} className="flex gap-2 text-xs"><ChevronRight className="w-3 h-3 text-radium-primary shrink-0 mt-0.5"/><span>{act}</span></li>
                    )) || <li className="text-gray-500">Loading...</li>}
                  </ul>
                </div>
                <div>
                  <strong className="text-white block mb-3 uppercase text-xs tracking-wider border-b border-gray-800 pb-2">🏆 Corporate Milestones</strong>
                  <ul className="space-y-2">
                    {(reportData?.corporateMilestones || reportData?.events)?.map((m, i) => (
                      <li key={i} className="flex gap-2 text-xs"><ChevronRight className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5"/><span>{m}</span></li>
                    )) || <li className="text-gray-500">Loading...</li>}
                  </ul>
                </div>
                <div>
                  <strong className="text-white block mb-3 uppercase text-xs tracking-wider border-b border-gray-800 pb-2">🎪 Experiential Events</strong>
                  <ul className="space-y-2">
                    {reportData?.experientialEvents?.map((e, i) => (
                      <li key={i} className="flex gap-2 text-xs"><ChevronRight className="w-3 h-3 text-purple-400 shrink-0 mt-0.5"/><span>{e}</span></li>
                    )) || <li className="text-gray-500">Loading...</li>}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* 5. Strategic Watchouts (Warning Card) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card flex flex-col border-red-900/50 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <div className="bg-dark-surface p-4 border-b border-gray-800 flex items-center gap-3">
                <ShieldAlert className="text-red-500 w-5 h-5" />
                <h3 className="font-heading text-sm tracking-wider text-red-500">05. STRATEGIC WATCHOUTS</h3>
              </div>
              <div className="p-6 text-gray-300 text-sm flex-grow">
                <ul className="space-y-3">
                  {reportData?.strategicWatchouts?.map((watchout, i) => (
                    <li key={i} className="flex gap-2 items-start"><ChevronRight className="w-4 h-4 text-red-500 shrink-0 mt-0.5"/> <span><strong className="text-white">Risk:</strong> {watchout}</span></li>
                  )) || <li>Loading...</li>}
                </ul>
              </div>
            </motion.div>

            {/* 6. Decision Makers & Contact Intelligence — FIXED LAYOUT */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card flex flex-col col-span-1 md:col-span-2">
              <div className="bg-dark-surface p-4 border-b border-gray-800 flex items-center gap-3">
                <Users className="text-radium-primary w-5 h-5" />
                <h3 className="font-heading text-sm tracking-wider text-white">06. DECISION MAKERS & CONTACT INTELLIGENCE</h3>
              </div>
              <div className="p-6 text-gray-300 text-sm flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <strong className="text-white block mb-4 uppercase text-xs tracking-wider">Key Profiles</strong>
                  <ul className="space-y-5">
                  {reportData?.decisionMakers?.map((dm, i) => (
                    <li key={i} className="border-l-2 border-radium-primary pl-3">
                      <div className="text-white font-bold text-sm">{dm.name}</div>
                      <div className="text-radium-primary text-xs font-heading tracking-wider mb-1">{dm.role}</div>
                      {dm.linkedin && dm.linkedin !== 'Not publicly available' && (
                        <div className="text-blue-400 text-xs mb-1">🔗 {dm.linkedin}</div>
                      )}
                      <div className="text-gray-400 text-xs italic">{dm.context}</div>
                    </li>
                  )) || <li>Loading...</li>}
                </ul>
                </div>
                <div className="bg-dark-surface border border-gray-800 p-4 rounded">
                  <strong className="text-white block mb-4 uppercase text-xs tracking-wider">Contact Intelligence</strong>
                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 uppercase">Estimated Email Pattern</span>
                      <span className="text-radium-primary">{reportData?.contactIntelligence?.emailPattern || reportData?.contactIntelligence?.email || 'Not publicly available'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 uppercase">LinkedIn Company Page</span>
                      <span className="text-blue-400">{reportData?.contactIntelligence?.linkedinCompanyPage || reportData?.contactIntelligence?.linkedin || 'Not publicly available'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 uppercase">Best Outreach Channel</span>
                      <span className="text-yellow-400 font-bold">{reportData?.contactIntelligence?.bestOutreachChannel || 'LinkedIn'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 7. Personalized Outreach */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card flex flex-col col-span-1 md:col-span-2">
              <div className="bg-dark-surface p-4 border-b border-gray-800 flex items-center gap-3">
                <Mail className="text-radium-primary w-5 h-5" />
                <h3 className="font-heading text-sm tracking-wider text-white">07. PERSONALIZED OUTREACH</h3>
              </div>
              <div className="p-6 text-gray-300 text-sm flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <strong className="text-white flex items-center gap-2 mb-3"><Users className="w-4 h-4"/> LinkedIn Hook</strong>
                  <div className="bg-dark-surface border border-gray-800 p-4 rounded font-mono text-[13px] leading-relaxed whitespace-pre-line text-gray-400">
                    {reportData?.linkedinHook ? <TypewriterEffect text={reportData.linkedinHook} /> : 'Loading...'}
                  </div>
                </div>
                <div>
                  <strong className="text-white flex items-center gap-2 mb-3"><Mail className="w-4 h-4"/> Email Draft</strong>
                  <div className="bg-dark-surface border border-gray-800 p-4 rounded font-mono text-[13px] leading-relaxed whitespace-pre-line text-gray-400">
                    <strong className="text-white mb-2 block">Subject: Strategic Intelligence Sync</strong>
                    {reportData?.emailDraft ? <TypewriterEffect text={reportData.emailDraft} /> : 'Loading...'}
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <input
                      id="email-target-input"
                      type="email"
                      value={emailTarget}
                      onChange={e => setEmailTarget(e.target.value)}
                      placeholder="Enter target email to send..."
                      className="w-full bg-dark-surface border border-gray-700 text-white px-3 py-2 rounded text-sm font-mono focus:outline-none focus:border-radium-primary"
                    />
                    <button
                      id="send-email-btn"
                      onClick={sendEmail}
                      disabled={sendingEmail || !emailTarget}
                      className="flex items-center gap-2 justify-center bg-radium-primary hover:bg-radium-primary/80 disabled:opacity-50 text-black font-bold py-2 px-4 rounded text-xs uppercase tracking-wider transition-all"
                    >
                      <Mail className="w-4 h-4" />
                      {sendingEmail ? 'Sending...' : 'Send Email + Track'}
                    </button>
                    {emailStatus && <p className="text-xs mt-1 font-mono">{emailStatus}</p>}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 8. Architecture & Tracking */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card flex flex-col col-span-1 md:col-span-2 bg-gradient-to-br from-dark-panel to-[#001a11] border-radium-primary/30">
              <div className="bg-dark-surface p-4 border-b border-gray-800 flex items-center gap-3">
                <Database className="text-radium-primary w-5 h-5" />
                <h3 className="font-heading text-sm tracking-wider text-white">08. ARCHITECTURE & TRACKING (InsightForge Stack)</h3>
              </div>
              <div className="p-6 text-gray-300 text-sm flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <strong className="text-radium-primary mb-3 block font-heading text-xs tracking-wider">SYSTEM WORKFLOW</strong>
                  <ol className="space-y-2 list-decimal list-inside text-gray-400 marker:text-radium-primary">
                    <li>Frontend: <span className="text-white">React + Tailwind + Framer Motion</span></li>
                    <li>Backend API: <span className="text-white">Node.js + Express</span> orchestrates requests</li>
                    <li>Data Collection: <span className="text-white">Puppeteer & Cheerio</span> scrape public signals</li>
                    <li>AI Processing: <span className="text-white">Gemini Free Tier</span> parses NLP & generates insights</li>
                    <li>Database: <span className="text-white">MongoDB Atlas (Free)</span> stores leads</li>
                    <li>Outreach: <span className="text-white">Nodemailer</span> triggers emails with tracking</li>
                  </ol>
                </div>
                <div>
                  <strong className="text-radium-primary mb-3 block font-heading text-xs tracking-wider">TRACKING SYSTEM</strong>
                  <ul className="space-y-3">
                    <li className="flex gap-2 items-start"><Activity className="w-4 h-4 text-radium-primary shrink-0 mt-0.5"/> <span><strong className="text-white">Open Tracking:</strong> 1x1 transparent pixel via Nodemailer</span></li>
                    <li className="flex gap-2 items-start"><Activity className="w-4 h-4 text-radium-primary shrink-0 mt-0.5"/> <span><strong className="text-white">Click Tracking:</strong> UTM parameters appending (utm_source=insightforge)</span></li>
                    <li className="flex gap-2 items-start"><Activity className="w-4 h-4 text-radium-primary shrink-0 mt-0.5"/> <span><strong className="text-white">CRM Sync:</strong> Backend event logging mapped to MongoDB schema</span></li>
                  </ul>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.section>
      )}
    </div>
  );
}
