import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EmailNotifier {
  constructor(configPath = null) {
    const defaultCfgPath = path.join(__dirname, 'config.json');
    this.config = JSON.parse(fs.readFileSync(configPath || defaultCfgPath, 'utf8'));
    this.outboxPath = path.join(__dirname, 'data', 'sent_emails.json');
    this.ensureDirs();
    this.initTransporter();
  }

  ensureDirs() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(this.outboxPath)) {
      fs.writeFileSync(this.outboxPath, JSON.stringify([], null, 2));
    }
  }

  initTransporter() {
    const gmailUser = process.env.GMAIL_USER || this.config.email_alerts?.smtp?.auth?.user;
    const gmailPass = process.env.GMAIL_APP_PASS || this.config.email_alerts?.smtp?.auth?.pass;

    if (gmailUser && gmailPass && !gmailUser.includes('YOUR_GMAIL')) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });
      this.hasLiveSmtp = true;
      console.log(`[EmailNotifier] Live Gmail SMTP initialized for ${gmailUser}`);
    } else {
      this.hasLiveSmtp = false;
      console.log(`[EmailNotifier] No live Gmail credentials found. Alerts will be logged to local outbox.`);
    }
  }

  getCleanPostUrl(item) {
    let url = item.post_url;
    if (!url || !url.startsWith('http')) {
      url = item.target_linkedin_url ? `${item.target_linkedin_url.replace(/\/+$/, '')}/recent-activity/all/` : 'https://www.linkedin.com';
    }
    return url;
  }

  formatDigestEmail(signalAlerts, totalScanned = 100) {
    const hotCount = signalAlerts.filter(a => a.item.analysis.signal_classification === 'HOT').length;
    const warmCount = signalAlerts.length - hotCount;
    const subject = `🔴 [Agent 004 Digest] Found ${signalAlerts.length} Executive Signals (${hotCount} HOT, ${warmCount} WARM) across ${totalScanned} Targets`;
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    let plainTextBody = `======================================================================
NEBULA AGENT 004 — 100 TARGET SCAN DIGEST REPORT
======================================================================
Timestamp: ${timestamp}
Total Profiles Scanned: ${totalScanned}
High-Relevance Signals Identified: ${signalAlerts.length} (${hotCount} HOT, ${warmCount} WARM)

`;

    let htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <h2 style="color: #0b57d0; margin-top: 0;">🔴 Executive Activity Scan Digest</h2>
  
  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
    <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${timestamp}</p>
    <p style="margin: 4px 0;"><strong>Total Targets Scanned:</strong> ${totalScanned} Profiles</p>
    <p style="margin: 4px 0;"><strong>Actionable Signals Identified:</strong> <span style="background-color: #e8f0fe; color: #1967d2; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${signalAlerts.length} (${hotCount} HOT, ${warmCount} WARM)</span></p>
  </div>

  <h3 style="color: #202124; border-bottom: 2px solid #0b57d0; padding-bottom: 6px;">Identified Opportunities & Draft Comments</h3>
`;

    signalAlerts.forEach((alert, idx) => {
      const item = alert.item;
      const draftComment = alert.draftComment;
      const cleanUrl = this.getCleanPostUrl(item);
      const emoji = item.analysis.signal_classification === 'HOT' ? '🔴' : '🟡';

      plainTextBody += `----------------------------------------------------------------------
${emoji} SIGNAL #${idx + 1}: ${item.target_name} (${item.target_company})
----------------------------------------------------------------------
• Role: ${item.target_title}
• Segment: ${item.target_segment}
• Score: ${item.analysis.relevance_score}/10 (${item.analysis.signal_classification})
• Theme: ${item.analysis.primary_theme}
• Direct Link: ${cleanUrl}

📝 DRAFT COMMENT:
"${draftComment}"

`;

      htmlBody += `
  <div style="background-color: #ffffff; border: 1px solid #dadce0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h4 style="margin: 0; color: #1a73e8; font-size: 16px;">${emoji} #${idx + 1} — ${item.target_name} (${item.target_company})</h4>
      <span style="font-size: 12px; background-color: #f1f3f4; padding: 3px 8px; border-radius: 12px; font-weight: bold;">Score ${item.analysis.relevance_score}/10</span>
    </div>
    
    <p style="font-size: 13px; color: #5f6368; margin: 6px 0 12px 0;">${item.target_title} | Segment: ${item.target_segment}</p>
    <p style="font-size: 14px; color: #202124; margin: 6px 0;"><strong>Theme:</strong> ${item.analysis.primary_theme}</p>

    <div style="margin: 12px 0;">
      <a href="${cleanUrl}" target="_blank" style="background-color: #0a66c2; color: #ffffff; padding: 8px 16px; text-decoration: none; border-radius: 16px; font-weight: bold; font-size: 13px; display: inline-block;">👉 Open ${item.target_name}'s Post / Feed</a>
    </div>

    <div style="background-color: #f8f9fa; padding: 12px; border-left: 4px solid #0a66c2; border-radius: 4px; font-style: italic; font-size: 13px; color: #3c4043;">
      "${draftComment}"
    </div>
  </div>
`;
    });

    plainTextBody += `======================================================================
Project Nebula — Agent 004 (CEO/CTO Activity Scanner)
======================================================================`;

    htmlBody += `
  <p style="font-size: 12px; color: #70757a; margin-top: 25px; text-align: center;">
    Project Nebula — Agent 004 (CEO/CTO Activity Scanner)
  </p>
</div>
`;

    return { subject, plainTextBody, htmlBody };
  }

  async sendDigestAlert(signalAlerts, totalScanned = 100) {
    if (!signalAlerts || signalAlerts.length === 0) {
      console.log(`[EmailNotifier] No actionable signals to send in digest.`);
      return false;
    }

    const { subject, plainTextBody, htmlBody } = this.formatDigestEmail(signalAlerts, totalScanned);
    const recipient = process.env.RECIPIENT_EMAIL || this.config.email_alerts.recipient_email;

    console.log(`\n=================== SINGLE DIGEST EMAIL DISPATCHED ===================`);
    console.log(`TO: ${recipient}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TOTAL SIGNALS IN DIGEST: ${signalAlerts.length}`);
    console.log(plainTextBody);
    console.log(`=====================================================================\n`);

    if (this.hasLiveSmtp) {
      try {
        const gmailUser = process.env.GMAIL_USER || this.config.email_alerts.smtp.auth.user;
        const info = await this.transporter.sendMail({
          from: `"Agent 004 Scanner" <${gmailUser}>`,
          to: recipient,
          subject: subject,
          text: plainTextBody,
          html: htmlBody
        });
        console.log(`[EmailNotifier] Live Digest email sent successfully! MessageID: ${info.messageId}`);
      } catch (err) {
        console.error(`[EmailNotifier] Error sending live digest email via Gmail SMTP: ${err.message}`);
      }
    }

    // Record in local outbox
    const outbox = JSON.parse(fs.readFileSync(this.outboxPath, 'utf8'));
    outbox.push({
      timestamp: new Date().toISOString(),
      recipient,
      subject,
      total_signals: signalAlerts.length,
      signals: signalAlerts.map(a => ({ name: a.item.target_name, company: a.item.target_company, url: a.item.post_url }))
    });
    fs.writeFileSync(this.outboxPath, JSON.stringify(outbox, null, 2));

    return true;
  }
}
