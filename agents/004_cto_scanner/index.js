import { DorkScanner } from './scanner.js';
import { SignalAnalyzer } from './analyzer.js';
import { CommentGenerator } from './comment_generator.js';
import { EmailNotifier } from './mailer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runCtoScanner(options = {}) {
  const targetLimit = options.targetLimit || 100;

  console.log(`\n🚀 [Agent 004: CEO/CTO Activity Scanner] Run Started at ${new Date().toISOString()}`);
  console.log(`[Agent 004] Target Mode: Scanning ALL ${targetLimit} Target Profiles...`);

  const scanner = new DorkScanner();
  const analyzer = new SignalAnalyzer();
  const generator = new CommentGenerator();
  const mailer = new EmailNotifier();

  // Step 1: Scan All Targets
  const freshItems = await scanner.scanAllTargets(targetLimit);
  console.log(`[Agent 004] Discovered ${freshItems.length} fresh items across target profiles.`);

  if (freshItems.length === 0) {
    console.log(`[Agent 004] No new un-processed items in this scan cycle.`);
    return { scanned: 0, alerts_sent: 0 };
  }

  // Step 2: Analyze Signals One by One
  const analyzedItems = await analyzer.analyzeBatch(freshItems);
  
  const signalAlerts = [];

  // Step 3: Process HOT / WARM Signals One by One & Generate Draft Comments
  for (const item of analyzedItems) {
    if (item.analysis.signal_classification === 'HOT' || item.analysis.signal_classification === 'WARM') {
      console.log(`\n🎯 [Agent 004] Processing ${item.analysis.signal_classification} Signal for ${item.target_name} (${item.target_company})...`);
      
      const draftComment = await generator.generateDraftComment(item);
      signalAlerts.push({
        item,
        draftComment
      });
    }
  }

  // Step 4: Dispatch SINGLE Digest Email with All Links and Profiles
  if (signalAlerts.length > 0) {
    console.log(`\n📧 [Agent 004] Compiling ${signalAlerts.length} signals into a SINGLE Digest Email...`);
    await mailer.sendDigestAlert(signalAlerts, freshItems.length);
  }

  console.log(`\n✅ [Agent 004: CEO/CTO Activity Scanner] Run Completed. Scanned: ${freshItems.length}, Signals in Digest: ${signalAlerts.length}\n`);

  return {
    scanned: freshItems.length,
    alerts_sent: signalAlerts.length > 0 ? 1 : 0,
    total_signals: signalAlerts.length,
    items: analyzedItems
  };
}

// Allow direct execution from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const limit = parseInt(process.argv[2] || '100', 10);
  runCtoScanner({ targetLimit: limit }).catch(err => {
    console.error('Fatal error during Agent 004 execution:', err);
    process.exit(1);
  });
}
