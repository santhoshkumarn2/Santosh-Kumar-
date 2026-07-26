import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SignalAnalyzer {
  constructor(configPath = null) {
    const defaultCfgPath = path.join(__dirname, 'config.json');
    this.config = JSON.parse(fs.readFileSync(configPath || defaultCfgPath, 'utf8'));
  }

  async analyzeSignal(item) {
    const prompt = `
You are an executive AI Signal Analyzer for Project Nebula (the "Cloudflare for AI Agents" - agent governance, inline PII scanning, DFA intent classification, and LLM cost control).

Analyze the following public LinkedIn activity from a target tech executive:

Executive: ${item.target_name} (${item.target_title} at ${item.target_company})
Segment: ${item.target_segment}
Post Title: ${item.title}
Post Snippet: ${item.snippet}
URL: ${item.post_url}

Your task:
1. Classify the signal:
   - HOT (Score 7-10): Directly mentions AI agents, LLM costs, agent security/governance, PII, latency, or agent testing/observability pain.
   - WARM (Score 4-6): Mentions general AI adoption, SaaS engineering scaling, API gateways, devtools, or team productivity.
   - COOL (Score 1-3): Personal announcements, hiring posts unrelated to AI, generic news.

2. Extract 2-3 specific technical engagement hooks.
3. Recommend an action: "comment", "dm", or "ignore".

Return JSON ONLY in this exact format:
{
  "signal_classification": "HOT" | "WARM" | "COOL",
  "relevance_score": number (1-10),
  "primary_theme": "string",
  "extracted_hooks": ["string", "string"],
  "recommended_action": "comment" | "dm" | "ignore",
  "reasoning": "short explanation"
}
`;

    try {
      const response = await fetch(`${this.config.llm_gateway.base_url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.llm_gateway.api_key}`
        },
        body: JSON.stringify({
          model: this.config.llm_gateway.analyzer_model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        console.warn(`[Analyzer] Gateway HTTP ${response.status}. Falling back to heuristic scoring.`);
        return this.fallbackHeuristicAnalysis(item);
      }

      const resData = await response.json();
      const contentStr = resData.choices[0].message.content;
      const jsonMatch = contentStr.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return this.fallbackHeuristicAnalysis(item);
      }
    } catch (err) {
      console.error(`[Analyzer] Error calling LLM analyzer: ${err.message}`);
      return this.fallbackHeuristicAnalysis(item);
    }
  }

  fallbackHeuristicAnalysis(item) {
    const text = `${item.title} ${item.snippet}`.toLowerCase();
    const hotKeywords = ['ai agent', 'llm cost', 'pii', 'governance', 'langchain', 'langgraph', 'crewai', 'agentic', 'latency', 'evals'];
    const warmKeywords = ['ai', 'openai', 'llm', 'api', 'devops', 'testing', 'saas', 'cloud', 'architecture'];

    let score = 2;
    let classification = 'COOL';
    let theme = 'General Tech Update';

    if (hotKeywords.some(kw => text.includes(kw))) {
      score = 8;
      classification = 'HOT';
      theme = 'AI Agent & LLM Ops Infrastructure';
    } else if (warmKeywords.some(kw => text.includes(kw))) {
      score = 5;
      classification = 'WARM';
      theme = 'SaaS & Engineering Architecture';
    }

    return {
      signal_classification: classification,
      relevance_score: score,
      primary_theme: theme,
      extracted_hooks: [`Executive post touches on ${theme}`],
      recommended_action: score >= 7 ? 'comment' : score >= 4 ? 'comment' : 'ignore',
      reasoning: 'Evaluated via fallback heuristic rules engine.'
    };
  }

  async analyzeBatch(items) {
    const analyzedResults = [];
    for (const item of items) {
      console.log(`[Analyzer] Analyzing signal for ${item.target_name} (${item.target_company})...`);
      const analysis = await this.analyzeSignal(item);
      analyzedResults.push({
        ...item,
        analysis
      });
    }
    return analyzedResults;
  }
}
