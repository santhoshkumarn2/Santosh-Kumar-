import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { neon } from "@neondatabase/serverless";

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
    modelName: "groq/llama-3.1-70b-versatile",
    temperature: 0.5,
    configuration: {
      baseURL: GATEWAY_URL,
      apiKey: MASTER_KEY,
    },
  });

  const writerLLM = new ChatOpenAI({
    modelName: "gemini/gemini-1.5-flash",
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
    try {
      const url = new URL(request.url);

      // Root Health Endpoint
      if (url.pathname === "/" || url.pathname === "/health") {
        return new Response(
          JSON.stringify({
            status: "alive",
            runner: "cloudflare-worker",
            ecosystem: "langchain-langgraph-langsmith-neondb",
            database: env.DATABASE_URL ? "connected" : "missing",
            tracing: env.LANGCHAIN_TRACING_V2 === "true" ? "active" : "disabled",
            project: env.LANGCHAIN_PROJECT || "none",
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      // Query persistent database content drafts
      if (url.pathname === "/drafts" && request.method === "GET") {
        if (!env.DATABASE_URL) {
          return new Response(JSON.stringify({ error: "DATABASE_URL not configured" }), { status: 500 });
        }
        const sql = neon(env.DATABASE_URL);
        const rows = await sql`SELECT * FROM content_drafts ORDER BY created_at DESC LIMIT 10`;
        return new Response(JSON.stringify({ count: rows.length, drafts: rows }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Trigger Agent Reasoning Task
      if (url.pathname === "/trigger" && request.method === "POST") {
        const body = await request.json();
        const task = body.task || "generate_content";
        const topic = body.topic || "AI agent governance gaps";

        const graph = createAgentGraph(env);
        const finalState = await graph.invoke({ task, topic });

        // Asynchronously save agent output to Neon PostgreSQL
        ctx.waitUntil(saveDraftToPostgres(env, task, topic, finalState.plan, finalState.output));

        return new Response(
          JSON.stringify({
            status: "success",
            graph_execution: "completed",
            database_persistence: "saved_to_neon",
            plan: finalState.plan,
            output: finalState.output,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response("Not Found", { status: 404 });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message, stack: err.stack }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
