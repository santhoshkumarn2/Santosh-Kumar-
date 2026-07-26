import cron from 'node-cron';
import { runCtoScanner } from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentOffset = 0;
const BATCH_SIZE = 10;
const TOTAL_TARGETS = 100;

function logSchedule(msg) {
  const time = new Date().toISOString();
  console.log(`[Scheduler ${time}] ${msg}`);
}

// Every 3 hours (6 AM, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM, 12 AM, 3 AM IST)
const CRON_EXPRESSION = '0 6,9,12,15,18,21,0,3 * * *';

logSchedule(`Initializing Agent 004 3-Hour Scheduler...`);
logSchedule(`Cron schedule: "${CRON_EXPRESSION}"`);

cron.schedule(CRON_EXPRESSION, async () => {
  logSchedule(`Triggering scheduled 3-hour scan for target offset ${currentOffset}...`);
  try {
    await runCtoScanner({ batchSize: BATCH_SIZE, offset: currentOffset });
    currentOffset = (currentOffset + BATCH_SIZE) % TOTAL_TARGETS;
    logSchedule(`Next scan scheduled for target offset ${currentOffset}`);
  } catch (err) {
    console.error(`[Scheduler] Error executing scheduled scan:`, err);
  }
});

logSchedule(`Scheduler active and waiting for next cron tick.`);
