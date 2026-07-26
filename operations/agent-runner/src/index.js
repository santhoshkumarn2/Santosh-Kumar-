import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { neon } from "@neondatabase/serverless";
import { createGapScannerGraph } from "./agents/gap_scanner.js";
import { createCtoScannerGraph } from "./agents/cto_scanner.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Credentials": "true",
};

function setupLangSmithTracing(env, projectName = "nebula-cto-scanner") {
  if (typeof globalThis.process === "undefined") {
    globalThis.process = { env: {} };
  }
  if (!globalThis.process.env) {
    globalThis.process.env = {};
  }
  globalThis.process.env.LANGCHAIN_TRACING_V2 = "true";
  globalThis.process.env.LANGCHAIN_API_KEY = (env && env.LANGCHAIN_API_KEY) || "lsv2_pt_b5f1f0a1e123_test_key";
  globalThis.process.env.LANGCHAIN_PROJECT = (env && env.LANGCHAIN_PROJECT) || projectName;
}

const AgentState = Annotation.Root({
  task: Annotation({ reducer: (x, y) => y ?? x, default: () => "default_task" }),
  topic: Annotation({ reducer: (x, y) => y ?? x, default: () => "AI agent governance" }),
  plan: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  output: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
});

export function createAgentGraph(env = {}) {
  env = env || {};
  setupLangSmithTracing(env, "nebula-cto-scanner");
  const GATEWAY_URL = env.LITELLM_GATEWAY_URL || "https://santosh-kumar-psi.vercel.app/v1";
  const MASTER_KEY = env.LITELLM_MASTER_KEY || "sk-olympus-secret-2026";
  const MODEL_NAME = env.LLM_MODEL || "groq/llama-3.3-70b-versatile";

  const plannerLLM = new ChatOpenAI({
    modelName: MODEL_NAME,
    temperature: 0.5,
    configuration: { baseURL: GATEWAY_URL, apiKey: MASTER_KEY },
  });

  const writerLLM = new ChatOpenAI({
    modelName: MODEL_NAME,
    temperature: 0.7,
    configuration: { baseURL: GATEWAY_URL, apiKey: MASTER_KEY },
  });

  const plannerNode = async (state) => {
    const response = await plannerLLM.invoke([
      { role: "system", content: "You are an autonomous GTM planner. Create a concise 3-step action plan." },
      { role: "user", content: `Topic: ${state.topic}` },
    ]);
    return { plan: response.content };
  };

  const writerNode = async (state) => {
    const response = await writerLLM.invoke([
      { role: "system", content: "You are an expert copywriter. Expand the action plan into a ready-to-publish LinkedIn post." },
      { role: "user", content: `Action Plan:\n${state.plan}` },
    ]);
    return { output: response.content };
  };

  const workflow = new StateGraph(AgentState)
    .addNode("planner", plannerNode)
    .addNode("writer", writerNode)
    .addEdge(START, "planner")
    .addEdge("planner", "writer")
    .addEdge("writer", END);

  return workflow.compile();
}

export const agent = createAgentGraph();
export const graph = agent;

async function saveDraftToPostgres(env, task, topic, plan, draftContent) {
  if (!env || !env.DATABASE_URL) return;
  try {
    const sql = neon(env.DATABASE_URL);
    await sql`
      INSERT INTO content_drafts (task, topic, plan, draft_content, status)
      VALUES (${task}, ${topic}, ${plan}, ${draftContent}, 'published')
    `;
    console.log("[PostgreSQL] Agent draft successfully saved to Neon DB!");
  } catch (err) {
    console.error("[PostgreSQL Save Error]", err);
  }
}

export default {
  async scheduled(event, env, ctx) {
    setupLangSmithTracing(env, "nebula-cto-scanner");
    console.log(`[Cloudflare Cron] Scheduled tick triggered at ${new Date().toISOString()}`);

    const ctoGraph = createCtoScannerGraph(env);
    const result = await ctoGraph.invoke({ batch_size: 10, offset: 0 });

    ctx.waitUntil(saveDraftToPostgres(env, "cron_cto_scanner", "CEO/CTO Activity Scan", "Scanned 10 targets", result.summary));
  },

  async fetch(request, env, ctx) {
    setupLangSmithTracing(env, "nebula-cto-scanner");

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);

      if (url.pathname === "/" || url.pathname === "/health" || url.pathname === "/info" || url.pathname === "/ok") {
        return new Response(
          JSON.stringify({
            status: "ok",
            agent_004: "CEO/CTO Activity Scanner",
            runner: "cloudflare-worker",
            tracing: "active",
            project: "nebula-cto-scanner",
            model: env.LLM_MODEL || "groq/llama-3.3-70b-versatile (ChatGPT-grade via Groq & LiteLLM Gateway)"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Endpoint: Test Agent 004 (CEO/CTO Scanner) live on Cloudflare
      if (url.pathname === "/linkedin/scan-ctos" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const batchSize = body.batch_size || 10;
        const offset = body.offset || 0;

        const ctoGraph = createCtoScannerGraph(env);
        const finalState = await ctoGraph.invoke({ batch_size: batchSize, offset: offset });

        ctx.waitUntil(saveDraftToPostgres(env, "manual_cto_scan", "CEO/CTO Activity Scan", `Scanned ${batchSize} targets`, finalState.summary));

        return new Response(
          JSON.stringify({
            status: "success",
            agent: "Agent 004: CEO/CTO Activity Scanner",
            batch_size: batchSize,
            offset: offset,
            alerts_sent: finalState.alerts_sent,
            summary: finalState.summary,
            langsmith_project: "nebula-cto-scanner"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Endpoint: Gap Scanner (Agent 019)
      if (url.pathname === "/linkedin/scan-gaps" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const pillar = body.pillar || "all";
        const limit = body.limit || 5;

        const gapGraph = createGapScannerGraph(env);
        const finalState = await gapGraph.invoke({ pillar, limit });

        return new Response(
          JSON.stringify({
            status: "success",
            agent: "Agent 019: Gap Scanner",
            pillar: pillar,
            gaps_found: finalState.gaps.length,
            formatted_report: finalState.formattedReport,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ detail: "Not Found", status: 404 }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message, stack: err.stack }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  },
};
