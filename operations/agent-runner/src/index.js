import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

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

  // Planner LLM (Groq Llama-3.1 70B via LiteLLM Gateway)
  const plannerLLM = new ChatOpenAI({
    modelName: "groq/llama-3.1-70b-versatile",
    temperature: 0.5,
    configuration: {
      baseURL: GATEWAY_URL,
      apiKey: MASTER_KEY,
    },
  });

  // Writer LLM (Gemini 1.5 Flash via LiteLLM Gateway)
  const writerLLM = new ChatOpenAI({
    modelName: "gemini/gemini-1.5-flash",
    temperature: 0.7,
    configuration: {
      baseURL: GATEWAY_URL,
      apiKey: MASTER_KEY,
    },
  });

  // Node 1: Planner Node
  const plannerNode = async (state) => {
    console.log(`[LangGraph Node: Planner] Processing topic: ${state.topic}`);
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

  // Node 2: Writer Node
  const writerNode = async (state) => {
    console.log(`[LangGraph Node: Writer] Expanding action plan into content...`);
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

  // Build the Graph Workflow
  const workflow = new StateGraph(AgentState)
    .addNode("planner", plannerNode)
    .addNode("writer", writerNode)
    .addEdge(START, "planner")
    .addEdge("planner", "writer")
    .addEdge("writer", END);

  return workflow.compile();
}

export default {
  // 1. Cron Trigger Handler for 24/7 background agents
  async scheduled(event, env, ctx) {
    console.log("LangGraph Cron trigger fired at: ", new Date(event.scheduledTime).toISOString());
    
    // Set up LangSmith tracing env vars if provided in Worker secrets
    if (env.LANGCHAIN_TRACING_V2) process.env.LANGCHAIN_TRACING_V2 = env.LANGCHAIN_TRACING_V2;
    if (env.LANGCHAIN_API_KEY) process.env.LANGCHAIN_API_KEY = env.LANGCHAIN_API_KEY;
    if (env.LANGCHAIN_PROJECT) process.env.LANGCHAIN_PROJECT = env.LANGCHAIN_PROJECT;

    const graph = createAgentGraph(env);
    ctx.waitUntil(
      graph.invoke({ task: "cron_scan", topic: "AI Agent Governance Gaps" })
    );
  },

  // 2. HTTP Request Handler (Webhooks & Invocation)
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Set up LangSmith tracing env vars if provided in Worker secrets
    if (env.LANGCHAIN_TRACING_V2) process.env.LANGCHAIN_TRACING_V2 = env.LANGCHAIN_TRACING_V2;
    if (env.LANGCHAIN_API_KEY) process.env.LANGCHAIN_API_KEY = env.LANGCHAIN_API_KEY;
    if (env.LANGCHAIN_PROJECT) process.env.LANGCHAIN_PROJECT = env.LANGCHAIN_PROJECT;

    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "alive",
          runner: "cloudflare-worker",
          ecosystem: "langchain-langgraph-langsmith",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (url.pathname === "/trigger" && request.method === "POST") {
      try {
        const body = await request.json();
        const task = body.task || "generate_content";
        const topic = body.topic || "AI agent governance gaps";

        const graph = createAgentGraph(env);
        const finalState = await graph.invoke({ task, topic });

        return new Response(
          JSON.stringify({
            status: "success",
            graph_execution: "completed",
            plan: finalState.plan,
            output: finalState.output,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message, stack: err.stack }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
