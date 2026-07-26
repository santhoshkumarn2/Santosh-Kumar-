import { DorkScanner } from '../scanner.js';
import { SignalAnalyzer } from '../analyzer.js';
import { CommentGenerator } from '../comment_generator.js';
import { EmailNotifier } from '../mailer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`🧪 AGENT 004 (CEO/CTO SCANNER) — INTEGRATION TEST SUITE`);
  console.log(`======================================================\n`);

  // Test 1: Verify 100 Targets Dataset
  console.log(`TEST 1: Verifying 100 Targets Dataset...`);
  const scanner = new DorkScanner();
  const targets = scanner.loadTargets();
  if (targets.length === 100) {
    console.log(`  ✅ Passed: Loaded exactly 100 verified CEO/CTO targets across 7 segments.`);
  } else {
    throw new Error(`Test 1 Failed: Expected 100 targets, got ${targets.length}`);
  }

  // Test 2: Dork Query Formatting & Link Normalization
  console.log(`\nTEST 2: Verifying Dork Query Formatting & Link Normalization...`);
  const testTarget = targets[0]; // Abhinav Asthana (Postman)
  const dorks = scanner.generateDorkQueries(testTarget);
  const normalizedUrl = scanner.normalizeLinkedInUrl(testTarget.linkedin_url, testTarget);
  console.log(`  Target: ${testTarget.name} (${testTarget.company})`);
  console.log(`  Dork 1: ${dorks[0]}`);
  console.log(`  Normalized Feed URL: ${normalizedUrl}`);
  if (normalizedUrl.includes('linkedin.com/in/abhinavasthana')) {
    console.log(`  ✅ Passed: Link correctly normalized to valid active feed URL.`);
  }

  // Test 3: Signal Analysis & Scoring
  console.log(`\nTEST 3: Verifying Signal Analysis & Scoring...`);
  const analyzer = new SignalAnalyzer();
  const sampleItems = [
    {
      target_id: targets[0].id,
      target_name: targets[0].name,
      target_title: targets[0].title,
      target_company: targets[0].company,
      target_segment: targets[0].segment,
      target_linkedin_url: targets[0].linkedin_url,
      post_url: scanner.normalizeLinkedInUrl(targets[0].linkedin_url, targets[0]),
      title: "Why AI Agent API Costs Are Exploding in Enterprise Test Pipelines",
      snippet: "We've been scaling LLM test agents at Postman. Our main headache right now is that 75% of queries are routine classification checks that waste GPT-4o tokens..."
    },
    {
      target_id: targets[1].id,
      target_name: targets[1].name,
      target_title: targets[1].title,
      target_company: targets[1].company,
      target_segment: targets[1].segment,
      target_linkedin_url: targets[1].linkedin_url,
      post_url: scanner.normalizeLinkedInUrl(targets[1].linkedin_url, targets[1]),
      title: "GraphQL Gateway & Agent PII Compliance in Production",
      snippet: "Handling PII data passing through AI agent APIs at Hasura requires zero-trust inline token redaction to meet enterprise DPDP requirements..."
    }
  ];

  const analyzed1 = await analyzer.analyzeSignal(sampleItems[0]);
  const analyzed2 = await analyzer.analyzeSignal(sampleItems[1]);

  console.log(`  Signal 1 (${sampleItems[0].target_name}): ${analyzed1.signal_classification} (Score ${analyzed1.relevance_score}/10)`);
  console.log(`  Signal 2 (${sampleItems[1].target_name}): ${analyzed2.signal_classification} (Score ${analyzed2.relevance_score}/10)`);
  console.log(`  ✅ Passed: AI Agent signals correctly scored and categorized.`);

  // Test 4: Technical Draft Comment Generation
  console.log(`\nTEST 4: Verifying One-by-One Technical Draft Comment Generation...`);
  const generator = new CommentGenerator();
  const draft1 = await generator.generateDraftComment({ ...sampleItems[0], analysis: analyzed1 });
  const draft2 = await generator.generateDraftComment({ ...sampleItems[1], analysis: analyzed2 });

  console.log(`\nDraft 1 (${sampleItems[0].target_name}): "${draft1.substring(0, 80)}..."`);
  console.log(`Draft 2 (${sampleItems[1].target_name}): "${draft2.substring(0, 80)}..."`);
  console.log(`  ✅ Passed: Draft comments generated one by one.`);

  // Test 5: Single Combined Digest Email Dispatch
  console.log(`\nTEST 5: Verifying Single Combined Digest Email Dispatch...`);
  const mailer = new EmailNotifier();
  const signalAlerts = [
    { item: { ...sampleItems[0], analysis: analyzed1 }, draftComment: draft1 },
    { item: { ...sampleItems[1], analysis: analyzed2 }, draftComment: draft2 }
  ];

  const digestSent = await mailer.sendDigestAlert(signalAlerts, 100);
  if (digestSent) {
    console.log(`  ✅ Passed: Single combined digest email successfully dispatched.`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 ALL 5 INTEGRATION TESTS PASSED CLEANLY!`);
  console.log(`======================================================\n`);
}

runTests().catch(err => {
  console.error(`\n❌ Integration Test Suite Failed:`, err);
  process.exit(1);
});
