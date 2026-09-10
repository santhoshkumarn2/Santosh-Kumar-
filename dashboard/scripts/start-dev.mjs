import { createServer } from "vite";
import { generateFunnelData } from "./collect-data.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DASHBOARD_DIR = path.resolve(__dirname, "..");
const TARGET_DATA_FILE = path.resolve(DASHBOARD_DIR, "src", "data", "funnel-data.ts");
const CONFIG_FILE = path.resolve(DASHBOARD_DIR, "vite.config.ts");

async function init() {
  console.log("\n==========================================");
  console.log("  Project Nebula Funnel Intelligence Hub  ");
  console.log("==========================================\n");

  try {
    console.log("-> Synchronizing latest funnel & telemetry data...");
    const data = await generateFunnelData();
    const original = fs.readFileSync(TARGET_DATA_FILE, "utf-8");
    const exportConstIdx = original.indexOf("export const funnelData: FunnelData =");
    if (exportConstIdx !== -1) {
      const typesPart = original.slice(0, exportConstIdx);
      const updatedContent = `${typesPart}export const funnelData: FunnelData = ${JSON.stringify(data, null, 2)};\n`;
      fs.writeFileSync(TARGET_DATA_FILE, updatedContent, "utf-8");
      console.log("-> Telemetry data synchronized successfully.");
    }
  } catch (err) {
    console.warn("! Warning: Telemetry sync encountered an issue, launching with cached data:", err.message);
  }

  console.log("-> Launching Vite dev server on port 3000...");
  try {
    const server = await createServer({
      configFile: CONFIG_FILE,
      root: DASHBOARD_DIR,
      server: {
        port: 3000,
        host: "0.0.0.0",
      },
    });
    await server.listen();
    console.log("\n==========================================");
    console.log("  Dashboard is live and ready!");
    console.log("  ➜ Local:   http://localhost:3000/");
    console.log("  ➜ IPv4:    http://127.0.0.1:3000/");
    console.log("==========================================\n");
  } catch (err) {
    console.error("! Fatal error starting Vite server:", err);
    process.exit(1);
  }
}

init();
