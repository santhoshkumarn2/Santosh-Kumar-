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

export default {
  async scheduled(event, env, ctx) {
    const graph = createAgentGraph(env);
    ctx.waitUntil(
      graph.invoke({ task: "cron_scan", topic: "AI Agent Governance Gaps" })
    );
  },

  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/" || url.pathname === "/health") {
        return new Response(
          JSON.stringify({
            status: "alive",
            runner: "cloudflare-worker",
            ecosystem: "langchain-langgraph-langsmith",
            has_langsmith_key: Boolean(env.LANGCHAIN_API_KEY),
            project: env.LANGCHAIN_PROJECT || "none",
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.pathname === "/trigger" && request.method === "POST") {
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
      }

      return new Response("Not Found", { status: 404 });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: err.message,
          stack: err.stack,
          name: err.name,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
