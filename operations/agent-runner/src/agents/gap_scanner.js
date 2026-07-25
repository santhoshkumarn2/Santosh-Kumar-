import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

/**
 * Define the Gap Scanner Graph Annotation Schema
 */
export const GapScannerState = Annotation.Root({
  pillar: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "all",
  }),
  limit: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 5,
  }),
  query: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  gaps: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  formattedReport: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  metadata: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({
      agent_id: "Agent_019_Gap_Scanner",
      langsmith_automation_ready: true,
      tags: ["gap_scanner", "agent_019", "governance_report"],
    }),
  }),
});

// Seed Gaps matching Core 4 Pillars (Doc 54 Section 1.3)
export const SEED_GAPS = [
  {
    id: "GAP-OBS-001",
    pillar: "Agent Observability",
    gap_title: "LangSmith & Langfuse Lose Parent-Child Spans Across Async Sub-Agents",
    target_tool: "LangSmith / Langfuse",
    source: "https://github.com/langfuse/langfuse/issues/1429",
    pain_point: "When an agent spawns background sub-agents via async queues, parent context is dropped and trace lists become flat lists instead of decision trees.",
    technical_limitation: "Trace headers do not automatically inject or propagate OpenTelemetry parent_span_id across asynchronous background tasks.",
    business_impact: "Engineering leads cannot debug infinite sub-agent loops or trace root cause failures in production pipelines.",
    candidate_open_source_fixes: [
      "Inject OpenTelemetry parent_span_id context headers into task payload",
      "Use Jaeger UI or D3.js custom DAG visualization middleware"
    ],
    curator_hook_idea: "We tried to trace multi-agent execution trees in production. Then we hit a wall with flat span lists."
  },
  {
    id: "GAP-COST-001",
    pillar: "Per-Iteration Cost",
    gap_title: "Helicone Tracks Session-Level Spend but Cannot Sever Infinite Loop Steps",
    target_tool: "Helicone / LiteLLM Callbacks",
    source: "https://github.com/Helicone/helicone/issues/892",
    pain_point: "Proxy gateways log total session cost retroactively but fail to break an agent execution loop when step-level spend exceeds budget threshold.",
    technical_limitation: "Missing real-time callback middleware to decompose cost by step_index and trigger an emergency stop gate.",
    business_impact: "A single malfunctioning agent loop can exhaust $500+ of OpenAI API credit overnight.",
    candidate_open_source_fixes: [
      "Implement LiteLLM callbacks paired with custom atomic Redis token bucket",
      "Deploy local circuit breaker proxy with step-level budget ceiling"
    ],
    curator_hook_idea: "An agent got stuck in a 40-iteration loop over the weekend. Helicone logged the $340 bill — but couldn't stop it."
  },
  {
    id: "GAP-TEST-001",
    pillar: "Deterministic Testing",
    gap_title: "No Native Trace-to-Test Compiler for CI/CD Regression Workflows",
    target_tool: "LangChain / Braintrust / Pytest",
    source: "https://reddit.com/r/LLMOps/comments/1e89k2/agent_testing_in_cicd",
    pain_point: "Production traces are stored as static logs and cannot be converted into replayable automated test fixtures for GitHub Actions.",
    technical_limitation: "Eval frameworks require manual dataset generation instead of auto-compiling production trace graphs into assertion-ready test cases.",
    business_impact: "Model updates secretly break complex multi-step prompt chains without triggering traditional CI build failures.",
    candidate_open_source_fixes: [
      "Use Braintrust dataset API + custom pytest assertion wrapper",
      "Auto-generate mock response JSON fixtures from historical trace spans"
    ],
    curator_hook_idea: "Your unit tests pass, but your agent fails 30% of user queries in production. Here's how to compile traces into CI tests."
  },
  {
    id: "GAP-COMP-001",
    pillar: "Compliance / PII",
    gap_title: "Cloud Observability Tools Egress Unmasked PII to External Analytics SaaS",
    target_tool: "LangSmith / Helicone / Arize Phoenix",
    source: "https://news.ycombinator.com/item?id=39812041",
    pain_point: "Sending raw prompt traces to cloud observability providers violates DPDP/GDPR compliance when prompts contain user Aadhaar, PAN, or health data.",
    technical_limitation: "Most SDKs perform logging at the network transport layer without inline local sanitization hooks.",
    business_impact: "Risk of enterprise CISOs vetoing LLM deployments due to regulatory fine exposure.",
    candidate_open_source_fixes: [
      "Run local spaCy NER / Aho-Corasick DFA scanner before trace egress",
      "Deploy self-hosted inline token anonymizer proxy"
    ],
    curator_hook_idea: "Sending raw prompts to cloud observability tools might be violating your enterprise compliance policy today."
  }
];

/**
 * LangGraph Gap Scanner Engine Graph Construction
 */
export function createGapScannerGraph(env = {}) {
  const GATEWAY_URL = env.LITELLM_GATEWAY_URL || "https://santosh-kumar-psi.vercel.app/v1";
  const MASTER_KEY = env.LITELLM_MASTER_KEY || "sk-olympus-secret-2026";

  const analyzerLLM = new ChatOpenAI({
    modelName: "groq/llama-3.3-70b-versatile",
    temperature: 0.3,
    configuration: {
      baseURL: GATEWAY_URL,
      apiKey: MASTER_KEY,
    },
  });

  const scanNode = async (state) => {
    let filtered = SEED_GAPS;
    if (state.pillar && state.pillar !== "all") {
      filtered = SEED_GAPS.filter((g) => g.pillar.toLowerCase().includes(state.pillar.toLowerCase()));
    }
    const limit = state.limit || 5;
    return { gaps: filtered.slice(0, limit) };
  };

  const reportNode = async (state) => {
    const gaps = state.gaps || [];

    // Build structured prompt for the LLM to synthesize a LinkedIn-ready gap report
    const gapSummary = gaps.map((g, i) =>
      `Gap ${i + 1}: ${g.gap_title}\nPillar: ${g.pillar}\nPain Point: ${g.pain_point}\nBusiness Impact: ${g.business_impact}`
    ).join("\n\n");

    // REAL LLM CALL — this produces traces on Groq, Vercel LiteLLM, and LangSmith
    const response = await analyzerLLM.invoke([
      {
        role: "system",
        content: `You are Agent 019: Gap Scanner for Project Nebula. 
Your job is to analyze AI tooling gaps and produce a concise, executive-level LinkedIn post report.
Format your output as a professional LinkedIn post with key insights, numbered gaps, and 3-5 relevant hashtags.`
      },
      {
        role: "user",
        content: `Analyze these ${gaps.length} AI agent tooling gaps and write a LinkedIn post:\n\n${gapSummary}`
      }
    ]);

    // Also build the raw markdown report for DB storage
    let rawReport = `# AI Agent Gap Scanner Report\n\n**Total Candidates Found:** ${gaps.length}\n\n`;
    for (let i = 0; i < gaps.length; i++) {
      const g = gaps[i];
      rawReport += `### Gap #${i + 1}: ${g.gap_title}\n`;
      rawReport += `- **Pillar:** \`${g.pillar}\`\n`;
      rawReport += `- **Target Tool:** ${g.target_tool}\n`;
      rawReport += `- **Source:** ${g.source}\n`;
      rawReport += `- **Pain Point:** ${g.pain_point}\n`;
      rawReport += `- **Business Impact:** ${g.business_impact}\n\n`;
    }

    return {
      formattedReport: response.content,
      metadata: {
        llm_model: "groq/llama-3.3-70b-versatile",
        llm_gateway: "vercel-litellm",
        raw_report: rawReport,
        gaps_analyzed: gaps.length,
        ran_at: new Date().toISOString(),
      }
    };
  };

  const workflow = new StateGraph(GapScannerState)
    .addNode("scan", scanNode)
    .addNode("report", reportNode)
    .addEdge(START, "scan")
    .addEdge("scan", "report")
    .addEdge("report", END);

  return workflow.compile();
}

export const gapScannerGraph = createGapScannerGraph();
