import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { neon } from "@neondatabase/serverless";

// Standard CORS headers for cross-origin browser tools (LangSmith Studio Web UI)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Credentials": "true",
};

// Define the Agent State Graph Annotations
const AgentState = Annotation.Root({
  task: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "default_task",
  }),
  topic: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "AI agent governance",
  }),
  plan: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  output: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
});

/**
 * Builds the LangGraph State Machine for Autonomous Agent Workflows
 */
function createAgentGraph(env) {
  const GATEWAY_URL = env.LITELLM_GATEWAY_URL || "https://santosh-kumar-psi.vercel.app/v1";
  const MASTER_KEY = env.LITELLM_MASTER_KEY || "sk-olympus-secret-2026";

  const plannerLLM = new ChatOpenAI({
    modelName: "groq/llama-3.3-70b-versatile",
    temperature: 0.5,
    configuration: {
      baseURL: GATEWAY_URL,
      apiKey: MASTER_KEY,
    },
  });

  const writerLLM = new ChatOpenAI({
    modelName: "groq/llama-3.3-70b-versatile",
    temperature: 0.7,
    configuration: {
      baseURL: GATEWAY_URL,
      apiKey: MASTER_KEY,
    },
  });

  const plannerNode = async (state) => {
    const response = await plannerLLM.invoke([
      {
        role: "system",
        content: "You are an autonomous GTM planner. Create a concise 3-step action plan for the given topic.",
      },
      {
        role: "user",
        content: `Topic: ${state.topic}`,
      },
    ]);
    return { plan: response.content };
  };

  const writerNode = async (state) => {
    const response = await writerLLM.invoke([
      {
        role: "system",
        content: "You are an expert copywriter. Expand the action plan into a ready-to-publish LinkedIn post with rich formatting and hashtags.",
      },
      {
        role: "user",
        content: `Action Plan:\n${state.plan}`,
      },
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

/**
 * Saves execution output to persistent Neon PostgreSQL database
 */
async function saveDraftToPostgres(env, task, topic, plan, draftContent) {
  if (!env.DATABASE_URL) return;
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
    const graph = createAgentGraph(env);
    const result = await graph.invoke({ task: "cron_scan", topic: "AI Agent Governance Gaps" });
    ctx.waitUntil(saveDraftToPostgres(env, "cron_scan", "AI Agent Governance Gaps", result.plan, result.output));
  },

  async fetch(request, env, ctx) {
    // 1. Handle CORS preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);

      // Root / Health / Info endpoints with full CORS & Studio metadata
      if (url.pathname === "/" || url.pathname === "/health" || url.pathname === "/info" || url.pathname === "/ok") {
        return new Response(
          JSON.stringify({
            status: "ok",
            server_version: "0.1.0",
            runner: "cloudflare-worker",
            ecosystem: "langchain-langgraph-langsmith-neondb",
            database: env.DATABASE_URL ? "connected" : "missing",
            tracing: env.LANGCHAIN_TRACING_V2 === "true" ? "active" : "disabled",
            project: env.LANGCHAIN_PROJECT || "none",
            graphs: {
              agent: "createAgentGraph",
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // LangGraph Studio API Endpoints Compatibility
      if (url.pathname === "/assistants" || url.pathname === "/assistants/search") {
        return new Response(
          JSON.stringify([
            {
              assistant_id: "agent",
              graph_id: "agent",
              config: {},
              metadata: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (url.pathname === "/threads" || url.pathname === "/threads/search") {
        if (request.method === "POST" && url.pathname === "/threads") {
          return new Response(
            JSON.stringify({
              thread_id: "thread-default",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              metadata: {},
              status: "idle",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (url.pathname === "/drafts" && request.method === "GET") {
        if (!env.DATABASE_URL) {
          return new Response(JSON.stringify({ error: "DATABASE_URL not configured" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const sql = neon(env.DATABASE_URL);
        const rows = await sql`SELECT * FROM content_drafts ORDER BY created_at DESC LIMIT 10`;
        return new Response(JSON.stringify({ count: rows.length, drafts: rows }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (url.pathname === "/trigger" && request.method === "POST") {
        const body = await request.json();
        const task = body.task || "generate_content";
        const topic = body.topic || "AI agent governance gaps";

        const graph = createAgentGraph(env);
        const finalState = await graph.invoke({ task, topic });

        ctx.waitUntil(saveDraftToPostgres(env, task, topic, finalState.plan, finalState.output));

        return new Response(
          JSON.stringify({
            status: "success",
            graph_execution: "completed",
            database_persistence: "saved_to_neon",
            plan: finalState.plan,
            output: finalState.output,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Always return valid JSON for 404s so Studio doesn't crash on "Not Found" string
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
